// Namespace: EmailControllers
import Imap, { ImapMessage } from 'node-imap';
import { ImapConfigSchema, ImapConfig, ImapConfigObject } from '../models/ImapConfig.js';
import { MailFolderSchema, MailFolder } from '../models/MailFolder.js';
import { MailItemSchema, MailItem } from '../models/MailItem.js';
import { MessageListItem } from '../models/MessageListItem.js';
import { parseAddressList, EmailAddress, EmailAddressSchema } from '../models/EmailAddress.js';
import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import { parseIsolatedEntityName } from 'typescript';
import { parse } from 'dotenv';
import { z } from 'zod';
import { ImapFactory } from '../factories/ImapFactory.js';

export class ImapController {
    private imap: Imap;
    private connected: boolean = false;

    constructor() {
        this.imap = ImapFactory.getInstance();
        
    }

    connect(): Promise<void> {
            return new Promise((resolve, reject) => {
                if(!this.connected) {

                    this.imap.once('ready', () => {
                        this.connected = true;
                        resolve();
                    });
                    this.imap.once('error', (err: any) => {
                        console.log(err);
                    });

                    this.imap.once('end', () => {
                        console.log('Connection ended');
                        this.connected = false;
                    });

                    this.imap.once('error', (err: any) => reject(err));
                    this.imap.connect();
                }else{
                    resolve();
                }
            });
    }

    getFolderList(): Promise<MailFolder[]> {
        return new Promise((resolve, reject) => {
            this.imap.getBoxes((err: Error | null, boxes: any) => {
                if (err) return reject(err);
                const folders: MailFolder[] = [];
                const traverse = (boxObj: any, path = '') => {
                    for (const name in boxObj) {
                        const box = boxObj[name];
                        const fullPath = path ? path + box.delimiter + name : name;
                        // Validate with schema and push
                        folders.push(MailFolderSchema.parse({
                            name,
                            path: fullPath,
                            flags: box.flags,
                            delimiter: box.delimiter
                        }));
                        if (box.children) traverse(box.children, fullPath);
                    }
                };
                traverse(boxes);
                resolve(folders);
            });
        });
    }

    getMessageList(folder: string, start: number, end: number|string): Promise<MessageListItem[]> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, true, (err: Error | null, box: Imap.Box) => {
                if (err) return reject(err);
                const results: MessageListItem[] = [];
                const fetch = this.imap.seq.fetch(`${start}:${end}`, { bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)', struct: true });
                fetch.on('message', (msg: ImapMessage, seqno: number) => {
                    const item: any = { };
                    msg.on('body', (stream: any) => {
                        let buffer = '';
                        stream.on('data', (chunk: Buffer) => buffer += chunk.toString('utf8'));
                        stream.on('end', () => {
                            const headers = Imap.parseHeader(buffer);
                            item.subject = headers.subject?.[0];
                            item.from = parseAddressList(headers.from)[0];
                            item.to = parseAddressList(headers.to);
                            item.date = headers.date?.[0] ? new Date(headers.date[0]) : undefined;
                        });
                    });
                    msg.once('attributes', (attrs: any) => {
                        item.id = attrs.uid;
                    });
                    msg.once('end', () => {
                        //console.log('Parsed MessageListItem:', item);
                        results.push(MessageListItem.parse(item));
                    });
                });
                fetch.once('error', (err:Error|null) => reject(err));
                fetch.once('end', () => resolve(results));
            });
        });
    }

    getMessage(folder: string, uid: number): Promise<MailItem> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, true, (err: Error | null, box: Imap.Box) => {
                if (err) return reject(err);
                const fetch = this.imap.fetch(uid, { bodies: ['HEADER', 'TEXT'], struct: true, envelope: true, size:true });
                let mail: MailItem = { id: uid };
                fetch.on('message', (msg: ImapMessage, seqno: number) => {
                    let headersBuffer = '';
                    let textBuffer = '';
                    let htmlBuffer = '';
                    let attachments: any[] = [];
                    let headers: any = {};
                    let fullbuffer = '';
                    msg.on('body', (stream: any, info: any) => {
                        let buffer = '';
                        stream.on('data', (chunk: Buffer) => { 
                            buffer += chunk.toString('utf8');
                            fullbuffer += buffer;
                         });
                        stream.on('end', () => {
                            if (info.which && info.which.toUpperCase().startsWith('HEADER')) {
                                headersBuffer += buffer;
                            } else if (info.which && info.which.toUpperCase().includes('TEXT/HTML')) {
                                htmlBuffer += buffer;
                            } else {
                                textBuffer += buffer;
                            }
                            //console.log('=============END============');
                            simpleParser(fullbuffer, (parserErr, parsedmail) => {
                                if (parserErr) throw parserErr;
                                //console.log('Subject:', parsedmail.subject);
                                //console.log('From:', parsedmail.from);
                                //console.log('To:', parsedmail.to);
                                //console.log('Text Body:', parsedmail.text?.toString().length);
                                //console.log('HTML Body:', parsedmail.html.toString().length);
                                //console.log('Headers:', parsedmail.headers);
                                mail.subject = parsedmail.subject;
                                mail.from = EmailAddressSchema.parse({ address: parsedmail.from?.value[0].address?.toString(), name: parsedmail.from?.value[0].name });
                                if (typeof parsedmail.to !== 'undefined' && !Array.isArray(parsedmail.to)) {
                                    mail.to?.push(EmailAddressSchema.parse({ address: parsedmail.to.value[0].address?.toString(), name: parsedmail.to.value[0].name }));
                                }else{
                                    if(Array.isArray(parsedmail.to)) {
                                        parsedmail.to.map((addr: AddressObject) => {
                                            mail.to?.push(EmailAddressSchema.parse({ address: addr.value[0].address?.toString(), name: addr.value[0].name }));
                                        });
                                    }
                                }
                                if(typeof parsedmail.cc !== 'undefined' && !Array.isArray(parsedmail.cc)) {
                                    mail.cc?.push(EmailAddressSchema.parse({ address: parsedmail.cc.value[0].address?.toString(), name: parsedmail.cc.value[0].name }));
                                }else{
                                    if(Array.isArray(parsedmail.cc)) {
                                        parsedmail.cc.map((addr: AddressObject) => {
                                            mail.cc?.push(EmailAddressSchema.parse({ address: addr.value[0].address?.toString(), name: addr.value[0].name }));
                                        });
                                    }
                                }
                                if(typeof parsedmail.bcc !== 'undefined' && !Array.isArray(parsedmail.bcc)) {
                                    mail.bcc?.push(EmailAddressSchema.parse({ address: parsedmail.bcc.value[0].address?.toString(), name: parsedmail.bcc.value[0].name }));
                                }else{
                                    if(Array.isArray(parsedmail.bcc)) {
                                        parsedmail.bcc.map((addr: AddressObject) => {
                                            mail.bcc?.push(EmailAddressSchema.parse({ address: addr.value[0].address?.toString(), name: addr.value[0].name }));
                                        });
                                    }
                                }
                                mail.date = parsedmail.date ? new Date(parsedmail.date) : undefined;
                                mail.messageId = parsedmail.messageId;
                                mail.inReplyTo = parsedmail.inReplyTo;
                                if(typeof parsedmail.references !== 'undefined' && !Array.isArray(parsedmail.references)) {
                                    mail.references?.push(parsedmail.references);
                                }else{
                                    if(Array.isArray(parsedmail.references)) {
                                        parsedmail.references.map((ref: string) => {
                                            mail.references?.push(ref);
                                        });
                                    }
                                }
                                mail.text = parsedmail.text?.toString();
                                mail.html = parsedmail.html?.toString();
                                for(let [key,value] of parsedmail.headers) {
                                    mail.headers?.push([key, value]);
                                }
                                mail.attachments = parsedmail.attachments;
                                // Remove undefined/empty arrays
                                if (mail.to && mail.to.length === 0) delete mail.to;
                                if (mail.cc && mail.cc.length === 0) delete mail.cc;
                                if (mail.bcc && mail.bcc.length === 0) delete mail.bcc;
                                if (mail.references && mail.references.length === 0) delete mail.references;
                                if (mail.attachments && mail.attachments.length === 0) delete mail.attachments;
                                resolve(MailItemSchema.parse(mail));



                            });
                            //console.log('=============END============');

                        });

                    });
                    msg.once('end', () => {
                    });
                });
                fetch.once('error', (err: Error | null) => reject(err));
            });
        });
    }
    /**
     * Move a message from one folder to another by UID.
     * @param sourceFolder The folder to move the message from
     * @param destinationFolder The folder to move the message to
     * @param uid The UID of the message to move
     */
    moveMessage(sourceFolder: string, destinationFolder: string, uid: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(sourceFolder, false, (err: Error | null, box: Imap.Box | null) => {
                if (err) return reject(err);
                // Try to use move if supported, otherwise fallback to copy+delete
                if (typeof this.imap.move === 'function') {
                    (this.imap as any).move(uid, destinationFolder, (err: any) => {
                        if (err) return reject(err);
                        resolve();
                    });
                } else {
                    this.imap.copy(uid, destinationFolder, (err: Error | null) => {
                        if (err) return reject(err);
                        this.imap.addFlags(uid, '\Deleted', (err: Error | null) => {
                            if (err) return reject(err);
                            this.imap.expunge(uid, (err: Error | null) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                }
            });
        });
    }

    /**
     * Delete a message by UID from a specified folder.
     * @param folder The folder containing the message
     * @param uid The UID of the message to delete
     */
    deleteMessage(folder: string, uid: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, false, (err: Error | null, box: Imap.Box | null) => {
                if (err) return reject(err);
                this.imap.addFlags(uid, '\\Deleted', (err: Error | null) => {
                    if (err) return reject(err);
                    this.imap.expunge(uid, (err: Error | null) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        });
    }

    /**
     * Create a new folder in the IMAP account.
     */
    createFolder(folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.addBox(folderName, (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Delete a folder from the IMAP account.
     */
    deleteFolder(folderName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.delBox(folderName, (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Search for messages matching the parameters set in a MailSearchOption object.
     */
    search(folder: string, searchOptions: import('../models/MailSearchOption').MailSearchOption): Promise<number[]> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, true, (err: Error | null, box: Imap.Box | null) => {
                if (err) return reject(err);
                // Build search criteria array
                const criteria: any[] = [];
                if (searchOptions.from) criteria.push(['FROM', searchOptions.from]);
                if (searchOptions.to) criteria.push(['TO', searchOptions.to]);
                if (searchOptions.subject) criteria.push(['SUBJECT', searchOptions.subject]);
                if (searchOptions.since) criteria.push(['SINCE', searchOptions.since.toISOString().slice(0, 10)]);
                if (searchOptions.before) criteria.push(['BEFORE', searchOptions.before.toISOString().slice(0, 10)]);
                if (searchOptions.unseen) criteria.push('UNSEEN');
                if (searchOptions.flagged) criteria.push('FLAGGED');
                if (searchOptions.answered) criteria.push('ANSWERED');
                if (searchOptions.custom) criteria.push(searchOptions.custom);
                this.imap.search(criteria.length ? criteria : ['ALL'], (err: Error | null, results: number[]) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        });
    }

    /**
     * Set flags on a message.
     */
    setFlags(folder: string, uid: number, flags: string | string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, false, (err: Error | null, box: Imap.Box | null) => {
                if (err) return reject(err);
                this.imap.addFlags(uid, flags, (err: Error | null) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    /**
     * Clear flags on a message.
     */
    ClearMessageFlagsTool(folder: string, uid: number, flags: string | string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, false, (err: Error | null, box: Imap.Box | null) => {
                if (err) return reject(err);
                this.imap.delFlags(uid, flags, (err: Error | null) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

}

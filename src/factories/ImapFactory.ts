import Imap from 'node-imap';
import { imapConfig as config, ImapConfigObject } from "../models/ImapConfig.js";

// Factory to create and manage a singleton IMAP connection
export class ImapFactory {
    private static instance: Imap;
    private constructor() {}

    public static getInstance(): Imap {
        if (!ImapFactory.instance) {
            // Validate config using Zod
            ImapConfigObject.parse(config);
            // Create new IMAP instance
            ImapFactory.instance = new Imap({
                user: config.user,
                password: config.password,
                host: config.host,
                port: config.port,
                tls: config.tls,
                tlsOptions: config.tlsOptions,
                debug: (msg: string) => console.log('IMAP:', msg)
            });
        }
        return ImapFactory.instance;
    }

}
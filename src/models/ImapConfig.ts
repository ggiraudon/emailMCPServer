// Namespace: EmailModels

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env

export const ImapConfigSchema = {
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    tls: z.boolean().optional(),
    tlsOptions: z.any().optional(),
};

export const ImapConfigObject = z.object(ImapConfigSchema);
export type ImapConfig = z.infer<typeof ImapConfigObject>;

export const imapConfig: ImapConfig = ImapConfigObject.parse({
  host: process.env.IMAP_HOST ? process.env.IMAP_HOST : "localhost",
  port: process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT) : 993,
  user: process.env.IMAP_USER ? process.env.IMAP_USER : "user",
  password: process.env.IMAP_PASSWORD ? process.env.IMAP_PASSWORD : "password",
  tls: process.env.IMAP_TLS ? process.env.IMAP_TLS === "true" : true
});

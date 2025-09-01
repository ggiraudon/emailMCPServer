// Namespace: EmailModels

import { z } from 'zod';
import { EmailAddressSchema } from './EmailAddress.js';

export const MailItemSchema = z.object({
    id: z.number().optional(),
    subject: z.string().optional(),
    from: EmailAddressSchema.optional(),
    to: z.array(EmailAddressSchema).optional(),
    cc: z.array(EmailAddressSchema).optional(),
    bcc: z.array(EmailAddressSchema).optional(),
    date: z.coerce.date().optional(),
    messageId: z.string().optional(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    headers: z.record(z.any()).optional(),
    attachments: z.array(z.any()).optional(),
});

export type MailItem = z.infer<typeof MailItemSchema>;

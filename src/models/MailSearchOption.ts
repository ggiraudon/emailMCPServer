// Namespace: EmailModels

import { z } from 'zod';

export const MailSearchOptionSchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    subject: z.string().optional(),
    since: z.coerce.date().optional(),
    before: z.coerce.date().optional(),
    unseen: z.boolean().optional(),
    flagged: z.boolean().optional(),
    answered: z.boolean().optional(),
    custom: z.any().optional(),
});

export type MailSearchOption = z.infer<typeof MailSearchOptionSchema>;

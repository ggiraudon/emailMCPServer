// Namespace: EmailModels

import { z } from 'zod';

export const MailFolderSchema = z.object({
    name: z.string(),
    path: z.string().optional(),
    flags: z.array(z.string()).optional(),
    delimiter: z.string().optional(),
});

export type MailFolder = z.infer<typeof MailFolderSchema>;

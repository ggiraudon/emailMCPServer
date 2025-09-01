// Namespace: EmailModels

import { z } from 'zod';

export const SmtpConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    secure: z.boolean().optional(),
    authMethod: z.string().optional(),
});

export type SmtpConfig = z.infer<typeof SmtpConfigSchema>;

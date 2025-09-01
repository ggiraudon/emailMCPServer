// Namespace: EmailModels

import { z } from 'zod';

export const PopConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    tls: z.boolean().optional(),
});

export type PopConfig = z.infer<typeof PopConfigSchema>;

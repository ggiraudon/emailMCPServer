// Namespace: EmailModels

import { z } from 'zod';

export const JmapConfigSchema = z.object({
    host: z.string(),
    user: z.string(),
    password: z.string(),
    token: z.string().optional(),
    port: z.number().optional(),
    useSSL: z.boolean().optional(),
});

export type JmapConfig = z.infer<typeof JmapConfigSchema>;

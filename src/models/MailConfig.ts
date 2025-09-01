// Namespace: EmailModels

import { z } from 'zod';
import { ImapConfigObject, ImapConfigSchema } from './ImapConfig.js';
import { PopConfigSchema } from './PopConfig.js';
import { SmtpConfigSchema } from './SmtpConfig.js';
import { JmapConfigSchema } from './JmapConfig.js';

export const MailConfigSchema = z.object({
    imapConfig: ImapConfigObject.optional(),
    popConfig: PopConfigSchema.optional(),
    smtpConfig: SmtpConfigSchema.optional(),
    jmapConfig: JmapConfigSchema.optional(),
});

export type MailConfig = z.infer<typeof MailConfigSchema>;

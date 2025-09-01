// Namespace: EmailModels

import { z } from 'zod';
import { EmailAddressSchema } from './EmailAddress.js';

export const MessageListItem = z.object({
    id: z.number().optional(),
    subject: z.string().optional(),
    from: EmailAddressSchema.optional(),
    to: z.array(EmailAddressSchema).optional(),
    date: z.coerce.date().optional(),
});

export type MessageListItem = z.infer<typeof MessageListItem>;

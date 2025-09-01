// Namespace: EmailModels

import { z } from 'zod';

export const EmailAddressSchema = z.object({
    address: z.string(),
    name: z.string().optional(),
});

export type EmailAddress = z.infer<typeof EmailAddressSchema>;

export function parseAddressList(addresses?: string[]): EmailAddress[] {
    if (!addresses || addresses.length === 0) return [];
    
    return addresses.map(addr => {
      const match = addr.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
      if (match) {
        const [, name, address] = match;
        return EmailAddressSchema.parse({ name: name || undefined, address: address || '' });
      }
      return EmailAddressSchema.parse({ address: addr });
    });
  }


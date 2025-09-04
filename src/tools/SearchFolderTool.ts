import { Tool } from "fastmcp";
import { ImapControllerFactory } from "../factories/ImapControllerFactory.js";
import { MailSearchOptionSchema } from "../models/MailSearchOption.js";
import { z } from "zod";

export const SearchInput = z.object({
  folder: z.string().min(2).max(100),
  from: z.string().optional(),
  to: z.string().optional(),
  subject: z.string().optional(),
  since: z.coerce.date().optional(),
  before: z.coerce.date().optional(),
//  unseen: z.boolean().optional(),
//  flagged: z.boolean().optional(),
//  answered: z.boolean().optional(),
});

export const SearchFolderTool: Tool<any, typeof SearchInput> = {
  name: "search",
  description: "Searches for messages in the specified folder matching the parameters set in searchOptions. Available search options are: from, to, subject, since, before, unseen, flagged, answered, custom. It returns a list of ids that can then be used to get individual messages based on their id.",
  parameters: SearchInput,

  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folder' in args)) {
      throw new Error("Missing required arguments");
    }
    const searchOptions = MailSearchOptionSchema.parse(args);
    const controller = ImapControllerFactory.getInstance();
    await controller.connect();
    const ids = await controller.search(args.folder, searchOptions);
    return JSON.stringify({ ids });
  }
};

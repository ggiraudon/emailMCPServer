import { Tool } from "fastmcp";
import { ImapControllerFactory } from "../factories/ImapControllerFactory.js";
import { MailItem } from "../models/MailItem.js";
import { z } from "zod";

export const GetMessageInput = z.object({
  folder: z.string().min(2).max(100),
  uid: z.number()
});

export const GetMessageTool: Tool<any, typeof GetMessageInput> = {
  name: "getMessage",
  description: "Returns a message by UID from a given folder for a given IMAP account.",
  parameters: GetMessageInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folder' in args) || !('uid' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = ImapControllerFactory.getInstance();
    await controller.connect();
    const message: MailItem = await controller.getMessage(args.folder, args.uid);
    return JSON.stringify({ message });
  }
};

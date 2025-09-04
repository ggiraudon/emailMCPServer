import { Tool } from "fastmcp";
import { ImapControllerFactory } from "../factories/ImapControllerFactory.js";
import { MailItem } from "../models/MailItem.js";
import { z } from "zod";

const GetMessageListInput = z.object({
  folder: z.string().min(2).max(100),
  start: z.number().min(1).optional().default(1),
  end: z.string().min(1).optional().default('*'),
});

export const GetMessageListTool: Tool<any, typeof GetMessageListInput> = {
  name: "getMessageList",
  description: "Returns a list of messages in a given folder.",
  parameters: GetMessageListInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folder' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = ImapControllerFactory.getInstance();
    await controller.connect();
    const messages: MailItem[] = await controller.getMessageList(args.folder, args.start, args.end);
    return JSON.stringify({ messages });
  }
};

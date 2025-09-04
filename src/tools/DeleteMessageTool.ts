import { Tool } from "fastmcp";
import { imapConfig } from "../models/ImapConfig.js";
import { ImapController } from "../controllers/ImapController.js";
import { z } from "zod";

export const DeleteMessageInput = z.object({
  folder: z.string().min(2).max(100),
  uid: z.number()
});

export const DeleteMessageTool: Tool<any, typeof DeleteMessageInput> = {
  name: "deleteMessage",
  description: "Deletes a message by UID from a given folder.",
  parameters: DeleteMessageInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folder' in args) || !('uid' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = new ImapController();
    await controller.connect();
    await controller.deleteMessage(args.folder, args.uid);
    return JSON.stringify({ success: true });
  }
};

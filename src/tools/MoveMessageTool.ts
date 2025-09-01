import { Tool } from "fastmcp";
import { imapConfig } from "../models/ImapConfig.js";
import { ImapController } from "../controllers/ImapController.js";
import { z } from "zod";

export const MoveMessageInput = z.object({
  sourceFolder: z.string().min(2).max(100),
  destinationFolder: z.string().min(2).max(100),
  id: z.number()
});

export const MoveMessageTool: Tool<any, typeof MoveMessageInput> = {
  name: "moveMessage",
  description: "Moves a message by ID from one folder to another.",
  parameters: MoveMessageInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object'|| !('sourceFolder' in args) || !('destinationFolder' in args) || !('id' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = new ImapController(imapConfig);
    await controller.connect();
    await controller.moveMessage(args.sourceFolder, args.destinationFolder, args.id);
    return JSON.stringify({ success: true });
  }
};

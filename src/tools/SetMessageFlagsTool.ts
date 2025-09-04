import { Tool } from "fastmcp";
import { imapConfig } from "../models/ImapConfig.js";
import { ImapController } from "../controllers/ImapController.js";
import { z } from "zod";

export const SetFlagsInput = z.object({
  folder: z.string().min(2).max(100),
  uid: z.number(),
  flags: z.union([z.string(), z.array(z.string())])
});

export const SetMessageFlagsTool: Tool<any, typeof SetFlagsInput> = {
  name: "setFlags",
  description: "Sets flags on a message.",
  parameters: SetFlagsInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folder' in args) || !('uid' in args) || !('flags' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = new ImapController();
    await controller.connect();
    await controller.setFlags(args.folder, args.uid, args.flags);
    return JSON.stringify({ success: true });
  }
};

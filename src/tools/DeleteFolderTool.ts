import { Tool } from "fastmcp";
import { imapConfig } from "../models/ImapConfig.js";
import { ImapController } from "../controllers/ImapController.js";
import { z } from "zod";

export const DeleteFolderInput = z.object({
  folderName: z.string().min(2).max(100)
});

export const DeleteFolderTool: Tool<any, typeof DeleteFolderInput> = {
  name: "deleteFolder",
  description: "Deletes a folder from the IMAP account.",
  parameters: DeleteFolderInput,
    
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folderName' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = new ImapController();
    await controller.connect();
    await controller.deleteFolder(args.folderName);
    return JSON.stringify({ success: true });
  }
};

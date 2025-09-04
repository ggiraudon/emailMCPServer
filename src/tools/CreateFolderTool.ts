import { Tool } from "fastmcp";
import { ImapControllerFactory } from "../factories/ImapControllerFactory.js";
import { z } from "zod";

export const CreateFolderInput = z.object({
  folderName: z.string().min(2).max(100)
});

export const CreateFolderTool: Tool<any, typeof CreateFolderInput> = {
  name: "createFolder",
  description: "Creates a new folder in the IMAP account.",
  parameters: CreateFolderInput,
  async execute(args, context) {
    if (!args || typeof args !== 'object' || !('folderName' in args)) {
      throw new Error("Missing required arguments");
    }
    const controller = ImapControllerFactory.getInstance();
    await controller.connect();
    await controller.createFolder(args.folderName);
    return JSON.stringify({ success: true });
  }
};

import { TypeOf, z } from "zod";
import { Tool } from "fastmcp"
import { ImapControllerFactory } from "../factories/ImapControllerFactory.js";
import { MailFolder,MailFolderSchema } from "../models/MailFolder.js";

const GetFolderListInput = z.object({
  // No input parameters needed for this tool
});

export const GetFolderListTool: Tool<any, typeof GetFolderListInput> = {
  name: "getFolderList",
  description: "Returns a list of folders in the imap account.",
  parameters: GetFolderListInput,
  async execute(params) {
    const controller = ImapControllerFactory.getInstance();
    await controller.connect();
    const folders: MailFolder[] = await controller.getFolderList();
    // Return as a JSON string to match the expected return type
    return JSON.stringify({
      folders: folders.map(f => ({
        name: f.name,
        path: f.path,
        flags: f.flags,
        delimiter: f.delimiter
      }))
    });
  }
};

export default GetFolderListTool;
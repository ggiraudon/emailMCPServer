
import { FastMCP,Logger } from "fastmcp";
import { z } from "zod";
import { ImapConfigSchema, ImapConfig, ImapConfigObject } from "./models/ImapConfig.js";
import { ImapController } from "./controllers/ImapController.js";
import { ClearMessageFlagsTool } from "./tools/ClearMessageFlagsTool.js";
import { CreateFolderTool } from "./tools/CreateFolderTool.js";
import { DeleteFolderTool } from "./tools/DeleteFolderTool.js";
import { DeleteMessageTool } from "./tools/DeleteMessageTool.js";
import { GetFolderListTool } from "./tools/GetFolderListTool.js";
import { GetMessageListTool } from "./tools/GetMessageListTool.js";
import { GetMessageTool } from "./tools/GetMessageTool.js";
import { MoveMessageTool } from "./tools/MoveMessageTool.js";
import { SearchFolderTool } from "./tools/SearchFolderTool.js";
import { SetMessageFlagsTool } from "./tools/SetMessageFlagsTool.js";

class debugLogger implements Logger
{
  debug(...args: unknown[]): void {
    console.debug("[DEBUG]", ...args);
  }
  error(...args: unknown[]): void {
    console.error("[ERROR]", ...args);
  }
  info(...args: unknown[]): void {
    console.info("[INFO]", ...args);
  }
  log(...args: unknown[]): void {
    console.log("[LOG]", ...args);
  }
  warn(...args: unknown[]): void {
    console.warn("[WARN]", ...args);
  }
  
}

const server = new FastMCP({
  name: "email-mcp-server",
  version: "1.0.0",
  // Uncomment line below to enable debug logging
  // logger: new debugLogger()
});



server.addTool(ClearMessageFlagsTool);
server.addTool(CreateFolderTool);
server.addTool(DeleteFolderTool);
server.addTool(DeleteMessageTool);
server.addTool(GetFolderListTool);
server.addTool(GetMessageListTool);
server.addTool(GetMessageTool);
server.addTool(MoveMessageTool);
server.addTool(SearchFolderTool);
server.addTool(SetMessageFlagsTool);


server.start({
  transportType: "httpStream",

  httpStream: {
    port: 8080,
    host: "0.0.0.0"
  },
});
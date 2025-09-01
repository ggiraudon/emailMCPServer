# Email MCP Server

This project is a modular, type-safe Email Management Context Protocol (MCP) server built with Node.js and TypeScript. It provides a set of tools and controllers for interacting with email servers using the IMAP protocol, supporting operations such as listing folders, retrieving messages, searching, moving, deleting, and managing message flags.

## Features

- **IMAP Email Operations**: Connect to IMAP servers to list folders, fetch messages, search, move, delete, and manage flags.
- **Type Safety**: All models and data structures are defined using [Zod](https://github.com/colinhacks/zod) schemas for runtime validation and TypeScript type inference.
- **MCP Tools**: Implements the [fastmcp](https://www.npmjs.com/package/fastmcp) Tool interface for modular, composable email operations.
- **Configurable**: Email server configuration is loaded from a config file or environment variables.
- **Extensible**: Easily add support for POP, SMTP, or JMAP protocols by extending the models and controllers.

## Project Structure

- `src/models/` — Zod schemas and types for email data structures (MailItem, MailFolder, EmailAddress, etc.)
- `src/controllers/` — Controllers for IMAP and other protocols
- `src/tools/` — Individual MCP tools for each email operation
- `src/index.ts` — Entry point, config loading, and tool registration

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Configure your email server settings in `config.json` or `.env`.
3. Run the server or use the tools as needed.

### Todo

- [x] IMAP functions
- [ ] POP functions
- [ ] SMTP functions
- [ ] JMAP functions

## License

MIT

# Model Context Protocol (MCP)

Antigravity supports the Model Context Protocol (MCP), an open standard that lets AI agents and editors securely connect to local developer tools, databases, file parsers, and external remote APIs. This integration provides the AI model with real-time context and execution capabilities beyond your immediate workspace.

## What is MCP?
MCP acts as a universal bridge between Antigravity and your broader development environment. Instead of manually copying and pasting database schemas, logs, or API specifications into prompts or chat panels, MCP lets Antigravity fetch structured context directly or execute safe actions on your behalf when needed.

- **Add Context**: Antigravity can use live data from connected MCP servers to inform its reasoning and suggestions.
- **Add Custom Tools**: Antigravity can execute specific, safe actions defined by your connected servers.

## Antigravity 2.0
In Antigravity 2.0, you can manage your MCP servers through the Installed MCP Servers section of your Settings.

## Antigravity IDE
In Antigravity IDE, the easiest way to manage MCP servers is through the built-in MCP Store. In the MCP Store, you can browse, discover, and install supported MCP servers. You can also install custom servers by updating your `mcp_config.json`.
The configuration file is located globally at `~/.gemini/config/mcp_config.json` (or locally in your workspace under `.agents/mcp_config.json`).

## Antigravity CLI
Antigravity CLI supports both local stdio processes and remote host MCP server configurations. 
- **Interactive MCP Manager**: Type `/mcp` inside the prompt panel and press Enter to open the interactive MCP Manager Overlay.
- **Global server setups**: Configured in `~/.gemini/config/mcp_config.json`.
- **Workspace local setups**: Configured in your active project under `.agents/mcp_config.json`.

## Antigravity SDK
In Python applications built using the Antigravity SDK, MCP servers can be connected programmatically under a unified execution pipeline alongside built-in tools and custom Python functions.
The SDK automatically discovers servers configured in your workspace's `.agents/mcp_config.json` file.

## MCP Configuration Structure
The configuration file contains a single `mcpServers` object where you define each server you want to connect to:

```json
{
  "mcpServers": {
    "sqlite-explorer": {
      "command": "node",
      "args": [
        "/usr/local/bin/sqlite-mcp-server.js"
      ],
      "env": {
        "SQLITE_DB_PATH": "/var/data/app.db"
      }
    },
    "my-remote-server": {
      "serverUrl": "https://api.example.com/mcp/",
      "headers": {
        "Authorization": "Bearer YOUR_API_TOKEN"
      }
    }
  }
}
```

## MCP Authentication
Connected MCP servers can securely authenticate against external services using built-in Google credentials, automatic OAuth flows, or custom HTTP headers.

- **Google Credentials**: Set `authProviderType` to `"google_credentials"` to use Google Application Default Credentials (ADC).
- **OAuth**: Antigravity can automatically handle OAuth for servers that support dynamic client registration (DCR). If the server does not support DCR, you can provide your client credentials manually via the `oauth` field.

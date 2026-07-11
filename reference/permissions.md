# Agent Permissions

Antigravity uses a robust, unified permission engine to secure your environment while enabling autonomous workflows. Every sensitive operation the Agent performs is represented as a permission resource formatted as `action(target)`.

Permissions are evaluated across three distinct access lists:
- **Deny**: The action is blocked immediately.
- **Ask**: The Agent pauses and prompts for your explicit approval before proceeding.
- **Allow**: The action is auto-approved without prompting.

Precedence Rule: Conflicting rules are strictly evaluated in priority order: `Deny > Ask > Allow`.

## Supported Actions & Matching Rules
| Action | Target Format | Matching Behavior | Default Fallback |
|---|---|---|---|
| `read_file` | `read_file(/path)` | Matches absolute paths or paths relative to project workspace roots. | Ask (Auto-allowed in workspace) |
| `write_file` | `write_file(/path)` | Same as read_file. Implicitly grants read_file for the exact same target path. | Ask (Auto-allowed in workspace) |
| `read_url` | `read_url(domain)` | Matches hostnames and subdomains. Ignores URL path segments. | Ask |
| `execute_url` | `execute_url(domain)` | Actuating on web elements or driving interactive browser workflows on a domain. | Ask |
| `command` | `command(prefix)` | Matches by exact word/token prefix. | Ask |
| `unsandboxed` | `unsandboxed(prefix)` | Matches commands by exact word/token prefix to run outside of container isolation. | Ask |
| `mcp` | `mcp(server/tool)` | Matches exact MCP tools or all tools on a specified server. | Ask |

## Implicit Permission Rules
- **Write implies Read**: Allowing `write_file` on a path automatically grants `read_file` on that path.
- **Deny Read implies Deny Write**: Denying `read_file` on a path immediately blocks `write_file` on that path.

## Interactive Permission Prompts
When the Agent encounters an operation requiring approval (Ask mode), an interactive card appears in your editor. Before clicking Allow for file, URL, or MCP permissions, you can directly edit the target string in the prompt card to expand the granted scope. (Note: Scope editing is not supported for terminal commands).

## Terminal Sandboxing (Preview)
Permission grants also apply to commands when sandbox is enabled:
- Paths granted under `read_file` dynamically populate the sandbox's read-only filesystem allowlist.
- Paths granted under `write_file` dynamically populate the sandbox's read-write filesystem allowlist.
- Domains granted under `read_url` define outbound network access policies.

## Default System Behaviors & Guardrails
- **Web Browsing Defaults to Ask**: Actions for `read_url` and `execute_url` default to Ask.
- **Workspaces are Auto-Allowed**: Reading and writing files inside your active project directory is automatically allowed.

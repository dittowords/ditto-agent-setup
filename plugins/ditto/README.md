# Ditto plugin

One plugin directory, read by both Claude Code and Cursor. Install instructions
live in the [repo README](../../README.md).

| Path                        | Host        | What it does                                                       |
| --------------------------- | ----------- | ------------------------------------------------------------------ |
| `mcp.json`                  | both        | Remote [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview) (OAuth, no token) |
| `skills/`                   | both        | `/ditto-review`, `/ditto-audit`, and the Ditto Specs skills        |
| `rules/ditto.mdc`           | Cursor      | Always-applied copy instructions                                   |
| `.claude-plugin/`           | Claude Code | Manifest, plus the same instructions loaded by a `SessionStart` hook |
| `.cursor-plugin/plugin.json` | Cursor     | Manifest                                                           |

`rules/ditto.mdc` and `.claude-plugin/ditto-instructions.md` carry the same
instructions in each host's native format — edit both together.

The hook config lives at `.claude-plugin/hooks.json`, not the default
`hooks/hooks.json`, because Cursor auto-discovers that path too and its hook
schema is different. `.claude-plugin/plugin.json` names the path explicitly.

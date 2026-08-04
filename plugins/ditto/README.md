# Ditto plugin

One plugin directory, read by both Claude Code and Cursor. Install instructions
live in the [repo README](../../README.md).

| Path                        | Host        | What it does                                                       |
| --------------------------- | ----------- | ------------------------------------------------------------------ |
| `mcp.json`                  | both        | Remote [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview) (OAuth, no token) |
| `skills/`                   | both        | `/ditto-review`, `/ditto-audit`, and the Ditto Specs skills        |
| `rules/ditto.mdc`           | Cursor      | Always-applied copy instructions                                   |
| `hooks/`                    | Claude Code | Same instructions, loaded by a `SessionStart` hook                 |
| `.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json` | one each | Per-host manifest |

`rules/ditto.mdc` and `hooks/ditto-instructions.md` carry the same instructions
in each host's native format — edit both together.

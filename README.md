# Ditto Agent Package

Ditto's bundled agent integration:

- [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview)
- Session hooks: every session starts with instructions to consult Ditto for user-facing copy,
  without you prompting it.
- `/ditto-review`: check the current diff's user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-audit [path]`: check the path for user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-spec-audit [component]`: for repos using [Ditto
  specs](https://developer.dittowords.com/ditto-specs-cli-reference/overview) —
  audit every instance of a specced component across the codebase against its
  spec's rules. Component-scoped, unlike the file-scoped `/ditto-audit`.
- `/ditto-spec-component <component>`: analyze a component, create or update
  its Ditto spec file (and specs for child components that lack one), and sync
  styleguide rules from the platform.
- `/ditto-spec-gaps [component]`: find copy patterns across component
  instances that should be styleguide rules but aren't; create approved ones
  on the platform.

## Install (Claude Code)

In Claude Code:

```
/plugin marketplace add dittowords/ditto-agent-setup
/plugin install ditto@ditto
```

Then set your Ditto API token (from [your Ditto account
settings](https://app.dittowords.com/account/user)) in the environment Claude
Code runs in:

```bash
export DITTO_API_TOKEN=<your-api-token>
```

Restart Claude Code (or run `/mcp`) and approve the `ditto` MCP server.

### Optional: set up Ditto Specs

[Ditto Specs](https://developer.dittowords.com/ditto-specs-cli-reference/overview)
are `*.ditto.md` files that co-locate copy rules with your components. To set
them up, run:

```
/ditto-spec-setup
```

The setup asks before doing anything, installs the specs CLI only if missing,
creates `dittospec.config.json` and `workspace.ditto.md`, scaffolds component
spec files, and detects an existing setup to update instead of duplicating.

With specs in place:

- `/ditto-review` and `/ditto-audit` treat spec files as the source of truth
  for the surfaces they cover.
- `/ditto-spec-audit`, `/ditto-spec-component`, and `/ditto-spec-gaps` become
  usable.

## Other agents

Claude Code is the primary adapter. The other hosts reuse the same `skills/`
and instruction text; each adapter just points its host at them. All hosts
need `DITTO_API_TOKEN` set (from [your Ditto account
settings](https://app.dittowords.com/account/user)).

The optional Ditto Specs setup works on every host below: run
`/ditto-spec-setup` where commands are supported, or ask the agent to run the
ditto-spec-setup skill.

### Codex

```bash
codex plugin marketplace add dittowords/ditto-agent-setup
codex plugin add ditto@ditto
```

Run `codex`, open `/hooks`, and trust the session hooks. The plugin reuses
`skills/` and the session instructions from `hooks/hooks.json`.

Register the Ditto MCP in `~/.codex/config.toml` (a stdio bridge carries the
token header):

```toml
[mcp_servers.ditto]
command = "npx"
args = ["-y", "mcp-remote", "https://api.dittowords.com/v2/mcp", "--header", "Authorization: token ${DITTO_API_TOKEN}"]
```

### GitHub Copilot CLI

```bash
copilot plugin marketplace add dittowords/ditto-agent-setup
copilot plugin install ditto@ditto
```

Commands are namespaced by plugin name, e.g. `/ditto:ditto-review`.

Register the Ditto MCP in `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "ditto": {
      "type": "http",
      "url": "https://api.dittowords.com/v2/mcp",
      "headers": {
        "Authorization": "token <your-api-token>"
      }
    }
  }
}
```

Without the plugin, Copilot still picks up the instructions from `AGENTS.md`
or `.github/copilot-instructions.md` in a repo, or globally from
`~/.copilot/copilot-instructions.md` (instructions only, no commands or
skills).

### OpenCode

Add to your `opencode.json`, pointing at a checkout of this repo:

```json
{
  "plugin": ["<path-to-checkout>/.opencode/plugins/ditto.mjs"],
  "mcp": {
    "ditto": {
      "type": "remote",
      "url": "https://api.dittowords.com/v2/mcp",
      "headers": {
        "Authorization": "token {env:DITTO_API_TOKEN}"
      }
    }
  }
}
```

The plugin injects the Ditto instructions every turn and registers the
`/ditto-*` commands and bundled skills.

### Gemini CLI

```bash
gemini extensions install https://github.com/dittowords/ditto-agent-setup
```

The extension loads `AGENTS.md` as always-on context, registers the
`/ditto-*` commands and skills, and configures the Ditto MCP server (reads
`DITTO_API_TOKEN` from your environment). If the MCP server fails to
authenticate, add it manually:

```bash
gemini mcp add --transport http ditto https://api.dittowords.com/v2/mcp --header "Authorization: token <your-api-token>"
```

### Keeping instruction copies aligned

`AGENTS.md` and `.github/copilot-instructions.md` are copies of
`hooks/ditto-instructions.md` for instruction-tier hosts. When changing
instruction text, edit `hooks/ditto-instructions.md` and copy it to both.

## Try it on the example

The [`example/`](example) directory contains sample components seeded with
copy problems (inconsistent casing, "Log in" vs "sign in", shouty errors).
From this repo:

![ditto-audit running on the example directory](assets/ditto-audit.png)

And `/ditto-review` does the same for just your working diff, useful right
before a commit:

![ditto-review running on a working diff](assets/ditto-review.png)


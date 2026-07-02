# Ditto Agent Package

Ditto's bundled agent integration:

- [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview)
- Session hooks: every session starts with instructions to consult Ditto for user-facing copy,
  without you prompting it.
- `/ditto-review`: check the current diff's user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-audit [path]`: the same check across a directory or the whole
  codebase.

## Install

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

## Project scoping

Add a `ditto/config.yml` to your repo root to scope Ditto results to specific
projects:

```yaml
projects:
  - id: "your-project-developer-id"
```

More information can be found in the [Ditto MCP docs](https://developer.dittowords.com/mcp-reference/overview).

## Try it on the example

The [`example/`](example) directory contains sample components seeded with
copy problems (inconsistent casing, "Log in" vs "sign in", shouty errors).
From this repo:

![ditto-audit running on the example directory](assets/ditto-audit.svg)

And `/ditto-review` does the same for just your working diff, useful right
before a commit:

![ditto-review running on a working diff](assets/ditto-review.svg)


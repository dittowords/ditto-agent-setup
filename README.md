# Ditto Agent Setup Package

Ditto's bundled agent integration:

- [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview)
- Session hooks: every session starts with instructions to consult Ditto for user-facing copy,
  without you prompting it.
- `/ditto-review`: check the current diff's user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-audit [path]`: check the path for user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-spec-audit [component]`: (for repos using Ditto specs) audit every
  instance of a specced component across the codebase against its spec's
  rules.
- `/ditto-spec-component <component>`: (for repos using Ditto specs) analyze a component, create or update
  its Ditto spec file (and specs for child components that lack one), and sync
  styleguide rules from the platform.
- `/ditto-spec-gaps [component]`: (for repos using Ditto specs) find copy patterns across component
  instances that should be styleguide rules but aren't; create approved ones
  on the platform.

The `/ditto-spec-audit`, `/ditto-spec-component`, and `/ditto-spec-gaps` skills
work on repos set up for Ditto Specs. See the [agent skills
reference](https://developer.dittowords.com/ditto-specs-cli-reference/agent-skills)
for the full explanation of each.

## Install

Grab your API token from [your Ditto account
settings](https://app.dittowords.com/account/user).

Set it once in the shell your agent runs in.

```bash
export DITTO_API_TOKEN=<your-api-token>
```

### Claude Code

```
/plugin marketplace add dittowords/ditto-agent-setup
/plugin install ditto@ditto
```

Restart Claude Code and approve the `ditto` MCP server (if not approved already).

### Optional: set up Ditto Specs

[Ditto Specs](https://developer.dittowords.com/ditto-specs-cli-reference/overview)
are `*.ditto.md` files that co-locate copy rules with your components. Run
`/ditto-spec-setup` and the agent will install the
specs CLI if missing, creates `dittospec.config.json` and
`workspace.ditto.md`, and scaffolds component spec files.

With specs in place `/ditto-spec-audit`, `/ditto-spec-component`, and `/ditto-spec-gaps` become usable.

## Try it on the example

The [`example/`](example) directory contains sample components seeded with
copy problems (inconsistent casing, "Log in" vs "sign in", shouty errors).
From this repo:

![ditto-audit running on the example directory](assets/ditto-audit.png)

And `/ditto-review` does the same for just your working diff, useful right
before a commit:

![ditto-review running on a working diff](assets/ditto-review.png)


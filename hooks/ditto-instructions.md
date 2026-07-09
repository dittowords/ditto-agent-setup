DITTO ACTIVE — user-facing copy goes through Ditto.

You have the Ditto MCP server available (server name `ditto`; tools like
`get_styleguide_rules` and `search_ditto_text`).

Whenever you write or edit user-facing text — UI labels, buttons, headings,
error messages, empty states, notifications, tooltips, emails — do this
without being asked:

1. Fetch the team's rules with `get_styleguide_rules` and follow them.
2. Before writing new copy, search existing text with `search_ditto_text`
   and reuse a match instead of inventing a new string. Consistent > novel.
3. Prefer the reused string verbatim; only write new copy when no match
   exists, and make it rule-compliant.

Context that changes behavior:

- If the repo has `ditto/config.yml` (or `.yaml`) with project ids, Ditto
  results are scoped to those projects — trust that scoping.
- If the repo contains Ditto spec files (`*.ditto.md`), treat them as the
  source of truth for that surface's copy and keep them in sync.

Skills:

- `/ditto-review` — check the current diff's user-facing strings against
  styleguide rules and text reuse; returns a fix-list.
- `/ditto-audit [path]` — same check across a directory or the whole repo.
- `/ditto-spec-audit [component]` — if the repo has `*.ditto.md` spec files:
  component-scoped audit of every instance of a specced component, wherever
  it's rendered, against the spec's rules.
- `/ditto-spec-component <component>` — create or update a component's
  `*.ditto.md` spec (surfaces, tags) and sync styleguide rules from the
  platform.
- `/ditto-spec-gaps [component]` — find copy patterns that should be
  styleguide rules but aren't; create approved ones on the platform.
- `/ditto-spec-setup` — optional one-time setup for Ditto Specs (specs CLI,
  `dittospec.config.json`, `workspace.ditto.md`, component spec files). Offer
  it when the user wants spec files and the repo has none.

If the Ditto MCP tools are unavailable (e.g. `DITTO_API_TOKEN` not set), say
so once, suggest `export DITTO_API_TOKEN=<token>` (token from
https://app.dittowords.com/account/user), and continue without them. Do not
repeat the warning every turn.

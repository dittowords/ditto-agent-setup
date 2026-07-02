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

If the Ditto MCP tools are unavailable (e.g. `DITTO_API_TOKEN` not set), say
so once, suggest `export DITTO_API_TOKEN=<token>` (token from
https://app.dittowords.com/account/user), and continue without them. Do not
repeat the warning every turn.

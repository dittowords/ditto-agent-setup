---
name: ditto-audit
description: >
  Audit a directory or the whole codebase's user-facing strings against Ditto
  styleguide rules and existing Ditto text, and return a fix-list. Use when
  the user says "ditto audit", "audit our copy", "check the codebase strings",
  or invokes /ditto-audit, optionally with a path argument. For just the
  current diff, use ditto-review instead.
---

Audit user-facing strings in a directory (argument, default: repo root)
against Ditto. Same contract as ditto-review, applied to files instead of a
diff.

## Steps

1. **Scope.** Use the path argument if given, else the repo root. Only scan
   source files likely to contain UI copy (e.g. `*.tsx|jsx|ts|js|vue|svelte|
   swift|kt|html`, string catalogs, template files). Skip build output,
   vendored code, tests, and lockfiles.

2. **Extract user-facing strings**: UI labels, buttons, headings,
   placeholders, error/empty/success messages, tooltips, notification and
   email copy. Grep for likely patterns (JSX text nodes, `label=`, `title=`,
   `placeholder=`, `alert(`, message constants), then read the hits in
   context to confirm they're user-facing. Skip identifiers, log lines,
   comments, and non-user-facing literals.

3. **Fetch the rules** once with `get_styleguide_rules` (Ditto MCP). If the
   repo has `ditto/config.yml`, results are already scoped to its projects.
   If the repo contains `*.ditto.md` spec files, load the ones covering the
   audited surfaces and treat them as the source of truth there.

4. **Check each string** for rule violations and for reuse: batch
   `search_ditto_text` lookups where possible; if an equivalent string
   already exists in Ditto, the code should use it verbatim. Also flag
   near-duplicates *within* the codebase that Ditto could unify (e.g.
   "Log in" here, "Sign in" there).

5. **Report the fix-list**, grouped by file, one line per finding:

   `<file>:L<line>: <rule|reuse|dupe|spec> "<current string>" → "<suggested string>" (<why, ≤10 words>)`

   - `rule:` violates a styleguide rule — name the rule.
   - `reuse:` an equivalent string exists in Ditto — use it.
   - `dupe:` inconsistent variants of the same string within the codebase.
   - `spec:` conflicts with a `*.ditto.md` spec file.

   End with: `N files scanned, M strings checked, K findings.`

For large codebases, audit the highest-traffic surfaces first and say what
was skipped rather than silently truncating. Do not edit files unless asked.
If the Ditto MCP tools are unavailable, report that (`DITTO_TOKEN`
missing?) instead of guessing at rules.

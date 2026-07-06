---
name: ditto-review
description: >
  Check the current diff's user-facing strings against Ditto styleguide rules
  and existing Ditto text, and return a fix-list. Use when the user says
  "ditto review", "review my copy", "check my strings", "review UI text",
  invokes /ditto-review, or before committing changes that add or edit
  user-facing text. For a whole directory or repo, use ditto-audit instead.
---

Review the current diff's user-facing strings against Ditto. Output is a
fix-list, not an essay.

## Steps

1. **Collect the diff.** Unstaged + staged + branch work:
   `git diff HEAD` plus, if on a branch, `git diff $(git merge-base HEAD origin/HEAD 2>/dev/null || git merge-base HEAD main)...HEAD`.
   If there is no diff at all, say so and stop.

2. **Extract user-facing strings** from added/changed lines only: UI labels,
   buttons, headings, placeholders, error/empty/success messages, tooltips,
   notification and email copy. Skip identifiers, log statements, code
   comments, test fixtures, and non-user-facing literals (URLs, keys, CSS).

3. **Fetch the rules** once with `get_styleguide_rules` (Ditto MCP). If the
   repo has `ditto/config.yml`, results are already scoped to its projects.

4. **Detect specs.** Check for `workspace.ditto.md` at the repo root and any
   `*.ditto.md` covering a changed surface (e.g. an `index.ditto.md` in or near
   a changed component's directory). If any are present, the user is using
   Ditto specs — follow the spec-driven procedure in `reference/spec-audit.md`
   (relative to the plugin root), scoped to the changed surfaces, treating
   specs as the source of truth for the surfaces they cover. Still run the
   styleguide-rules + reuse checks below. If no spec files exist, skip the spec
   procedure and run the checks below as the whole review.

5. **Check each string**:
   - **Rules**: does it violate any styleguide rule? (capitalization, tone,
     terminology, punctuation, formatting — whatever the rules say.)
   - **Reuse**: call `search_ditto_text` for it; if an equivalent string
     exists in Ditto, the diff should use that string verbatim.

6. **Report the fix-list.** One line per finding:

   `<file>:L<line>: <rule|reuse|spec> "<current string>" → "<suggested string>" (<why, ≤10 words>)`

   - `rule:` violates a styleguide rule — name the rule in the why.
   - `reuse:` an equivalent string already exists in Ditto — use it.
   - `spec:` conflicts with a `*.ditto.md` spec file.

   End with one summary line: `N strings checked, M findings.` If everything
   passes, that one line is the whole report.

Do not edit files unless the user asks you to apply the fixes. If the Ditto
MCP tools are unavailable, report that (`DITTO_API_TOKEN` missing?) instead
of guessing at rules.

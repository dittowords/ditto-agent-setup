---
name: ditto-spec-gaps
description: >
  Analyze copy across component instances to find patterns that should be
  style guide rules but aren't, then create approved rules on the Ditto
  platform. Use when the user says "find rule gaps", "what rules are missing",
  "propose styleguide rules", or invokes /ditto-spec-gaps, optionally with a
  component name or path; requires the repo to contain Ditto spec files. To
  check copy against existing rules use ditto-spec-audit instead.
---

# Ditto Spec Gaps

Identify copy patterns in component instances that should be style guide rules
but aren't. Propose new style rules or terminology entries, and create approved
ones on the Ditto platform.

## Input

If a component name or path is given, analyze only that component's instances.
If omitted, analyze all components that have Ditto specs.

---

## Phase 1: Load Existing Rules

1. Read `workspace.ditto.md` for workspace-level rules and tags.
2. Read each relevant component's `index.ditto.md` for component-level and per-surface rules.
3. Run `npx ditto-spec rules` to load the **complete** platform rule set. Ditto spec files only contain rules whose tags match a local component — a platform rule with non-matching tags is invisible in Ditto specs, and proposing a duplicate of it would be a mistake. The output also shows each style guide's sections (name, kind, sectionId), which Phase 4 may need.
4. Build a complete picture of what's already covered — every style rule, terminology entry, and locale-scoped rule on the platform.

---

## Phase 2: Analyze Copy

1. Search the codebase for **instances where each component is used** — find all files that import and render it.
2. For each instance, gather the **actual copy** bound to **every** text surface — inline and externalized alike. Resolve each surface following Phase 2 of the ditto-spec-audit skill (`../ditto-spec-audit/SKILL.md`, "Find & Resolve Instances" plus its "Resolving copy sources" reference): the inline pass is always mandatory, i18n keys resolve across all locales and plural forms, Ditto text items resolve by Developer-ID key match per variant, and unresolvable surfaces are analyzed for whatever is statically knowable. This skill only **reads** those sources; it never modifies catalogs or text items.
3. Analyze the copy across all instances for patterns no existing rule covers:
   - **Terminology inconsistencies**: the same concept referred to with different forms (e.g. "sign up" vs "signup" vs "sign-up"). These should become terminology entries.
   - **Tone mismatches**: some instances formal, others casual. These should become style rules.
   - **Anti-patterns**: passive voice in CTAs, overly long descriptions, redundant words.
   - **Surface-specific conventions** that should be formalized (e.g. "all action buttons start with a verb").

---

## Phase 3: Propose Rules

If **no meaningful gaps** are found, say so and stop.

If gaps are found, propose new rules. Rules come in two shapes:

**Style rules:**
- **name**: short rule name
- **description**: what the rule enforces
- **tags**: which tags it should apply to (determines which surfaces it matches)
- **examples**: `{from, to}` pairs drawn from actual code showing the pattern
- **section**: which existing section of the style guide it belongs in (pick from the sections shown by `npx ditto-spec rules` — e.g. a button rule belongs alongside other UI-pattern rules, not in a generic first section)

**Terminology entries:**
- **term**: the canonical form
- **disallowed**: list of variant forms to reject
- **description**: why this form is preferred
- **tags**: which tags it should apply to
- **section**: which existing wordlist section it belongs in

If any proposed tags don't exist in the workspace yet, warn the user. Only existing workspace tags can be assigned to rules.

**STOP HERE. Present proposals and ask the user which rules (if any) to create.**

---

## Phase 4: Create Rules

Before creating any rules, determine which style guide to target:

1. Check `dittospec.config.json` for a `defaultStyleguide` value.
2. If present, tell the user which style guide will be used and ask for confirmation.
3. If absent (or the user wants a different one), ask the user for the exact style guide name to create the rules in — it must match a style guide that exists in the workspace (visible on the Ditto platform). `create-rules` rejects an unrecognized `--styleguide` value and lists the valid names, so a wrong name fails loudly instead of silently targeting the wrong guide.

Create **all** approved rules in one invocation, piping a JSON array on stdin with a quoted heredoc (the quoted `'EOF'` delimiter keeps apostrophes and quotes in copy examples intact — never inline the JSON as a shell argument):

```
npx ditto-spec create-rules --styleguide "<chosen style guide>" <<'EOF'
[
  {"name": "<rule name>", "description": "<description>", "tags": ["tag1"], "examples": [{"from": "...", "to": "..."}], "section": "<existing section>"},
  {"term": "<canonical form>", "disallowed": ["variant1", "variant2"], "description": "<why>", "tags": ["tag1"], "section": "<existing wordlist section>"}
]
EOF
```

Style rules (`name`) and terminology entries (`term`) can be mixed in one batch. Each rule's `section` (name or sectionId, as shown by `npx ditto-spec rules`) maps it to an existing section of the style guide; a rule's section kind must match its shape (`rules` sections for style rules, `wordlist` sections for terminology). If `section` is omitted, the rule lands in the first section of the matching kind.

If a rule uses tags that don't exist yet, warn the user and omit those tags from the JSON.

After all rules are created:

1. Run `npx ditto-spec pull` to sync the new rules into Ditto spec files.
2. Read the updated `index.ditto.md` files and verify the new rules appear.
3. Report which rules were created and which Ditto specs they landed in.

---

## Reference: Ditto Spec Conventions

- **Rule shapes**: style rules have `name`, `description`, optional `examples`, and `section`. Terminology entries have `term`, `disallowed`, `description`, and `section`.
- **CLI-managed keys**: `rules`, `locales` (and workspace `tags`) — **never write by hand**. Populated by `ditto-spec pull`.
- **Tag matching**: style guide rules match Ditto specs by tag intersection. Any shared tag triggers the match. Rules with no tags are workspace-universal (apply to all surfaces).
- **Rule hierarchy**: workspace rules (apply everywhere) → component-level rules (no `surface` field) → per-surface rules (with `surface: "<key>"`).

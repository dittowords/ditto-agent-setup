---
name: ditto-spec-audit
description: >
  Audit component instances against the style guide rules in their Ditto spec
  files (*.ditto.md). Component-scoped: finds every place a specced component
  is rendered across the codebase and evaluates the copy bound to each surface
  (inline, i18n catalogs, Ditto text items). Use when the user says "spec
  audit", "audit against specs", or invokes /ditto-spec-audit, optionally with
  a component name or path; requires the repo to contain Ditto spec files. For
  a file-scoped string audit use ditto-audit; for the current diff use
  ditto-review.
---

# Ditto Spec Audit

Evaluate user-facing copy in component instances against the style guide rules
in their Ditto spec files. Reports violations with file locations and suggested
corrections.

The unit of audit is the **component**, not the file: a spec governs its
component's surfaces wherever they are bound, so instances are searched
codebase-wide — a path argument selects *which components* to audit, not which
files to scan.

## Input

If a component name or path is given, audit only that component. If omitted,
audit all components that have specs.

---

## Phase 1: Load Specs

1. Read `workspace.ditto.md` at the project root for workspace-level rules,
   tags, and locale-scoped rules.
2. If a specific component was given, find its `index.ditto.md`. If auditing
   all, run `npx ditto-spec list` to discover all specced components, then read
   each `index.ditto.md`.
3. For each component, build the full rule set:
   - Workspace rules (apply to all surfaces)
   - Component-level rules (no `surface` field — apply to all surfaces in this
     component)
   - Per-surface rules (with `surface: "<key>"` — apply only to that surface)
   - Locale-scoped rules from `locales` (if present, at workspace or component
     level)

---

## Phase 2: Find & Resolve Instances

1. Search the codebase for all files that import and render each component
   being audited.
2. For each instance, evaluate the **actual copy** bound to **every** text
   surface. A surface's value may be an inline literal or a reference to a
   string stored elsewhere — and a single instance commonly mixes both. These
   layers are **not** mutually exclusive: evaluate every one that applies, and
   resolving an externalized source never lets you skip the inline copy.

   **a. Inline (always — the baseline).** Read and audit the literal text
   present directly in the code: string literals and template strings passed
   as props, children rendered as text, hardcoded strings in the
   component/JSX, and variables with obvious values (trace one level if
   needed). **This pass is mandatory and is never skipped — auditing hardcoded
   copy is the default job of this skill, so do it for every instance even
   when the component also uses i18n or Ditto.**

   **b. i18n key** — the surface is bound to a translation lookup such as
   `t('dialog.headline')`, `i18n.t(...)`, `$t('key')`,
   `<FormattedMessage id="...">`, `intl.formatMessage({ id })`,
   `<Trans i18nKey="...">`, or a Rails `t('.key')`. Resolve it:
      - Locate the catalog file(s) by convention (see **Resolving copy
        sources** below) and look up the key, supporting nested/dot keys and
        namespaces.
      - Resolve the value in **every** available locale catalog, not just the
        default. Each locale's value is a separate instance to evaluate, and
        it activates that locale's `locales.<code>` rules.
      - Resolve **plural forms** (i18next `_one`/`_other`/`_zero`/`_many`, ICU
        `{count, plural, …}`, `.stringsdict`, Android `<plurals>`) — evaluate
        each form.
      - Treat **interpolation placeholders** (`{{var}}`, `{var}`, `%s`, `%@`,
        `%1$s`, ICU `{name}`) as opaque tokens — audit the copy around them,
        never the token.

   **c. Ditto text item** — the surface resolves to a string Ditto manages,
   fetched through a key-lookup call. **The deciding signal is
   key-resolvability, not the function name:** whenever a surface is bound to
   any lookup-style call passing a string literal (e.g.
   `getDittoText('open-in-figma')`, `t('style-guides')`, `ditto.t(...)`,
   `getText('...')`) that the inline (**a**) and i18n (**b**) branches did not
   already resolve, treat the literal as a candidate Ditto **Developer ID**
   and try to resolve it. An accessor name containing "ditto"
   (case-insensitive — `getDittoText`, `useDittoText`, `dittoText`,
   `ditto.t`) or an import tracing to a Ditto module is a corroborating hint,
   not a requirement.
      - Locate the Ditto output: the `ditto/` folder, or the `outDir` in
        `ditto/config.yml`.
      - **Grep the specific literal id as a key** across the
        `{project}___{variant}.json` and `components__{variant}.json` files —
        do not read whole files or index all keys. Prefer an exact key match;
        only if none exists, try a normalized (kebab/camel) form of the id.
      - If the key is found, it **is** a Ditto text item: resolve its value in
        **every** variant file that contains it (each variant is a separate
        instance, parallel to the every-locale rule in **b**; infer the
        variant/locale from the file name), resolve `_one`/`_other` plural
        forms (evaluate each), and treat `{{variableId}}` placeholders as
        opaque tokens. Record the source as **Ditto**, naming the Developer ID
        and variant.
      - If the id is **not a string literal** (e.g.
        `getDittoText('item-' + type)`) or **no ditto file contains the
        key**, drop to **d** — never log a Ditto source you could not
        key-match.

   **d. Unresolvable / dynamic** — the value is computed at runtime, the key
   is itself a variable (e.g. `t('item.' + type)`), the key or catalog can't
   be found, or the string is assembled from fragments. **Never skip
   silently.** Evaluate whatever is statically knowable (literal fragments,
   the message skeleton) and record an explicit **unresolved — manual review**
   entry naming the surface, the binding you found, and why it could not be
   resolved.

This skill **reads** from every source but **never modifies any of them** —
inline code, i18n catalogs, and Ditto text items are each owned by their own
workflow. Auditing is report-only.

---

## Phase 3: Evaluate

For each instance, evaluate the copy against every applicable rule:

- **Style rules** (`name`/`description`/`examples`): check that copy follows
  the described guidance. Use `examples` (before/after pairs) as concrete
  reference for tone, length, and shape.
- **Terminology entries** (`term`/`disallowed`): check that copy uses the
  `term` form and never uses any `disallowed` alternative. Check all surface
  text, not just exact matches — look for the disallowed forms appearing
  within longer strings.
- **`maxLength`**: flag any text that exceeds the constraint.
- **Locale-scoped rules**: when a resolved string comes from a specific locale
  (identifiable from its catalog file path/name, i18n key, Ditto variant, or
  surrounding context), also evaluate it against the matching `locales.<code>`
  rules, in addition to the base rules.
- **Interpolation placeholders**: treat `{{var}}`, `{var}`, `%s`, `%@`,
  `%1$s`, and ICU `{name}` tokens as opaque — evaluate the copy around them,
  not the token itself.

Each rule carries a `section` field (e.g. "Voice & Tone", "Terminology") — use
this to group violations in the report.

---

## Phase 4: Report

Present violations grouped by component, then by file:

For each violation:
- **File and line** where the instance appears
- **Surface** the text maps to
- **Source** where the copy lives: `inline (code)`,
  `i18n catalog: <file>#<key> [locale]`, or
  `ditto text item: <developer-id> [variant]`
- **Text** that violates the rule
- **Rule** that is violated (name or term, plus section)
- **Suggested correction** — for inline copy this is a code change; for i18n
  catalogs and Ditto text items it is **advisory only**: the string is owned
  by that workflow and must be changed there, not edited in component code.
  Never present it as a code edit, and never modify the catalog or text item.

If no violations are found, say so explicitly — a clean audit is useful
information.

End with a summary: total components audited, total instances checked, total
violations found. If any surfaces could not be resolved (Phase 2d), list them
under **Unresolved surfaces** with their bindings — never let a resolution gap
pass silently.

---

## Reference: Resolving copy sources

Conventions for locating externally-stored copy. Infer the **locale** from the
file path or name (e.g. `de-DE`, `/de/`, `__spanish`, `values-de/`) so
locale-scoped rules apply.

- **Ditto** — `ditto/` (or the `outDir` in `ditto/config.yml`); files
  `{project}___{variant}.json`, `components__{variant}.json`, plus
  `variables.json`. Keys are Developer IDs; plurals use `_one`/`_other`
  suffixes; variables are `{{variableId}}`. Output may also be Android XML or
  iOS `.strings`/`.stringsdict`. **Detect Ditto bindings by key-resolvability,
  not function name:** any string-literal argument to a lookup-style call
  (whatever it's named) that matches a Developer-ID key in these files is a
  Ditto text item. Grep the specific id as a key — never read entire files to
  find it.
- **i18next / react-intl / FormatJS** — `locales/`,
  `public/locales/<lng>/<ns>.json`, `i18n/`, `lang/`, `messages.*.json`.
- **Flutter** — `.arb` files. **gettext** — `.po`/`.pot`. **Rails** —
  `config/locales/*.yml`. **Apple** — `*.strings`, `*.stringsdict`,
  `*.xcstrings`. **Android** — `res/values*/strings.xml`.

When key resolution is ambiguous (e.g. multiple catalogs or namespaces in a
monorepo), prefer the catalog nearest the importing instance or matching the
configured namespace; if still ambiguous, mark the surface unresolved (Phase
2d) rather than guessing. Look copy up by key — do not read entire catalogs
into context.

---

## Reference: Ditto Spec Conventions

- **Rule shapes**: style rules have `name`, `description`, optional
  `examples`, and `section`. Terminology entries have `term`, `disallowed`,
  `description`, and `section`.
- **Locale-scoped rules**: the `locales` key contains rules keyed by locale
  code (e.g. `de-DE`). These apply in addition to base `rules` when writing
  for that locale.
- **Rule hierarchy**: workspace rules (apply everywhere) → component-level
  rules (no `surface` field) → per-surface rules (with `surface: "<key>"`).
  Locale-scoped rules follow the same hierarchy.
- **Tag matching**: style guide rules match Ditto specs by tag intersection.
  Any shared tag triggers the match. If a rule matches both component-level
  and surface-level tags, it emits at component level (broader scope wins).

# Spec-driven audit procedure

Shared procedure for `ditto-audit` and `ditto-review` when the target contains
Ditto spec files (`*.ditto.md`). Specs are the **source of truth** for the
surfaces they cover: evaluate user-facing copy against the style guide rules
declared in them.

Takes a **scope**:
- `ditto-review` → the changed surfaces in the current diff.
- `ditto-audit` → a path argument, or the repo root.

This procedure **reads** from every copy source but **never modifies any of
them** — inline code, i18n catalogs, and Ditto text items are each owned by
their own workflow. It is report-only.

---

## 1. Load specs

1. Read `workspace.ditto.md` at the repo root for workspace-level rules, tags,
   and locale-scoped rules.
2. Discover specced components: run `npx ditto-spec list`, or glob
   `**/index.ditto.md`. Read each `index.ditto.md` in scope.
3. For each component, build the rule set in hierarchy order (broader scope
   first, narrower overrides):
   - **Workspace rules** — apply to all surfaces.
   - **Component-level rules** — no `surface` field; apply to every surface in
     the component.
   - **Per-surface rules** — `surface: "<key>"`; apply only to that surface.
   - **Locale-scoped rules** — from `locales.<code>` (at workspace or component
     level); apply in addition to the base rules when writing for that locale.

---

## 2. Find & resolve instances (within scope)

Find the files that render each specced component. For each instance, evaluate
the **actual copy** bound to **every** text surface. A surface's value may be an
inline literal or a reference to a string stored elsewhere — and a single
instance commonly mixes both. These layers are **not** mutually exclusive:
evaluate every one that applies. Resolving an externalized source never lets you
skip the inline copy.

**a. Inline (always — the baseline).** Audit the literal text directly in the
code: string literals and template strings passed as props, children rendered
as text, hardcoded strings in the component/JSX, and variables with obvious
values (trace one level if needed). This pass is **mandatory and never
skipped** — hardcoded copy is the default job.

**b. i18n key** — the surface is bound to a translation lookup such as
`t('dialog.headline')`, `i18n.t(...)`, `$t('key')`, `<FormattedMessage id>`,
`intl.formatMessage({ id })`, `<Trans i18nKey>`, or a Rails `t('.key')`.
Resolve it:
- Locate the catalog(s) by convention (see **Resolving copy sources**) and look
  up the key (nested/dot keys and namespaces supported).
- Resolve the value in **every** locale catalog, not just the default. Each
  locale's value is a separate instance and activates that locale's
  `locales.<code>` rules.
- Resolve **plural forms** (i18next `_one`/`_other`/`_zero`/`_many`, ICU
  `{count, plural, …}`, `.stringsdict`, Android `<plurals>`) — evaluate each.
- Treat **interpolation placeholders** (`{{var}}`, `{var}`, `%s`, `%@`,
  `%1$s`, ICU `{name}`) as opaque tokens — audit the copy around them.

**c. Ditto text item** — the surface resolves to a string Ditto manages,
fetched through a key-lookup call. The deciding signal is **key-resolvability,
not the function name**: whenever a surface is bound to any lookup-style call
passing a string literal (e.g. `getDittoText('open-in-figma')`, `t('...')`,
`ditto.t(...)`, `getText('...')`) that (a) and (b) did not resolve, treat the
literal as a candidate Ditto **Developer ID** and try to resolve it. A name
containing "ditto" or an import tracing to a Ditto module is a corroborating
hint, not a requirement.
- Locate the Ditto output: the `ditto/` folder, or the `outDir` in
  `ditto/config.yml`.
- **Grep the specific literal id as a key** across `{project}___{variant}.json`
  and `components__{variant}.json` — do not read whole files. Prefer an exact
  key match; only if none, try a normalized (kebab/camel) form.
- If found, it **is** a Ditto text item: resolve its value in **every** variant
  file that contains it (each variant is a separate instance, parallel to the
  every-locale rule in **b** — infer variant/locale from the file name),
  resolve `_one`/`_other` plural forms, and treat `{{variableId}}` placeholders
  as opaque. Record the source as **Ditto**, naming the Developer ID and
  variant.
- If the id is **not a string literal** (e.g. `getDittoText('item-' + type)`)
  or **no ditto file contains the key**, drop to **d** — never log a Ditto
  source you could not key-match.

**d. Unresolvable / dynamic** — the value is computed at runtime, the key is
itself a variable (`t('item.' + type)`), the key/catalog can't be found, or the
string is assembled from fragments. **Never skip silently.** Evaluate whatever
is statically knowable (literal fragments, the message skeleton) and record an
explicit **unresolved — manual review** entry naming the surface, the binding
you found, and why it could not be resolved.

---

## 3. Evaluate

For each resolved instance, check the copy against every applicable rule:

- **Style rules** (`name`/`description`/`examples`): check the copy follows the
  guidance. Use `examples` (before/after pairs) as concrete reference for tone,
  length, and shape.
- **Terminology entries** (`term`/`disallowed`): check the copy uses the `term`
  form and never any `disallowed` alternative. Check **all** surface text, not
  just exact matches — look for disallowed forms appearing inside longer
  strings.
- **`maxLength`**: flag any text exceeding the constraint.
- **Locale-scoped rules**: when a resolved string comes from a specific locale
  (from its catalog path/name, i18n key, Ditto variant, or context), also
  evaluate it against the matching `locales.<code>` rules, in addition to the
  base rules.
- **Interpolation placeholders**: treat `{{var}}`, `{var}`, `%s`, `%@`,
  `%1$s`, ICU `{name}` as opaque — evaluate the copy around them, not the
  token.

Each rule carries a `section` field (e.g. "Voice & Tone", "Terminology").

---

## 4. Report

Emit findings into the **same fix-list line format the calling skill uses**, so
spec findings sit alongside its rule/reuse findings. Use the `spec:` finding
type and name the surface and source:

```
<file>:L<line>: spec [<surface>, <source>] "<current>" → "<suggested>" (<rule/term + section, ≤10 words>)
```

- **source** is one of: `inline`, `i18n:<file>#<key> [locale]`, or
  `ditto:<developer-id> [variant]`.
- **Suggested correction**: for **inline** copy this is a code change; for
  **i18n catalogs and Ditto text items it is advisory only** — the string is
  owned by that workflow and must be changed there, never edited in component
  code. Never present those as a code edit, and never modify the catalog or
  text item.

If any surfaces could not be resolved (2d), list them under **Unresolved
surfaces** with their bindings — never let a resolution gap pass silently.

---

## Reference: Resolving copy sources

Conventions for locating externally-stored copy. Infer the **locale** from the
file path or name (e.g. `de-DE`, `/de/`, `__spanish`, `values-de/`) so
locale-scoped rules apply.

- **Ditto** — `ditto/` (or the `outDir` in `ditto/config.yml`); files
  `{project}___{variant}.json`, `components__{variant}.json`, plus
  `variables.json`. Keys are Developer IDs; plurals use `_one`/`_other`;
  variables are `{{variableId}}`. Output may also be Android XML or iOS
  `.strings`/`.stringsdict`. Detect Ditto bindings by key-resolvability, not
  function name; grep the specific id as a key — never read entire files.
- **i18next / react-intl / FormatJS** — `locales/`,
  `public/locales/<lng>/<ns>.json`, `i18n/`, `lang/`, `messages.*.json`.
- **Flutter** — `.arb`. **gettext** — `.po`/`.pot`. **Rails** —
  `config/locales/*.yml`. **Apple** — `*.strings`, `*.stringsdict`,
  `*.xcstrings`. **Android** — `res/values*/strings.xml`.

When key resolution is ambiguous (multiple catalogs/namespaces in a monorepo),
prefer the catalog nearest the importing instance or matching the configured
namespace; if still ambiguous, mark the surface unresolved (2d) rather than
guessing. Look copy up by key — do not read entire catalogs into context.

---

## Reference: Ditto spec conventions

- **Rule shapes**: style rules have `name`, `description`, optional `examples`,
  and `section`. Terminology entries have `term`, `disallowed`, `description`,
  and `section`.
- **Locale-scoped rules**: the `locales` key contains rules keyed by locale
  code (e.g. `de-DE`); they apply in addition to base `rules` for that locale.
- **Rule hierarchy**: workspace → component-level (no `surface`) → per-surface
  (`surface: "<key>"`). Locale-scoped rules follow the same hierarchy.
- **Tag matching**: style guide rules match specs by tag intersection — any
  shared tag triggers the match. A rule matching both component-level and
  surface-level tags emits at component level (broader scope wins).

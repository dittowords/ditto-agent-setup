---
name: ditto-spec-component
description: >
  Analyze a design system component, create Ditto spec files (index.ditto.md)
  for it and any child components that lack one, auto-fill surfaces and tags,
  and sync style guide rules from the platform. Use when the user says "spec
  this component", "create a ditto spec", "add a spec for", or invokes
  /ditto-spec-component with a component name or path; requires the repo to be
  set up for Ditto specs. To audit instances of an already-specced component
  use ditto-spec-audit.
---

# Ditto Spec Component

Analyze a design system component, scaffold Ditto spec files (including child
components that lack specs), auto-fill surfaces and tags, and sync style guide
rules from the platform.

## Input

Accept either a component name (e.g. `Button`) or a file path (e.g.
`src/components/Button/index.tsx`). If a name is given, search the codebase to
find the component. If multiple matches exist, ask the user to clarify.

---

## Phase 1: Discovery

Find the target component and map its dependencies.

1. Locate the component source file.
2. Read the component code. Walk imports to find **child components that render user-facing text** (components that accept string props, children rendered as text, or contain hardcoded strings). Skip utility imports, style imports, icon imports, and non-text components.
3. Check which components already have a Ditto spec (`index.ditto.md`) by looking for the file in each component's directory.
4. Read `workspace.ditto.md` at the project root (if it exists) for existing platform tags and universal style guide rules.
5. Report:
   - Target component and its location
   - Whether the target already has a Ditto spec (and what surfaces it declares)
   - Child components needing Ditto specs (no existing `index.ditto.md`)
   - Existing Ditto specs found (already covered)

---

## Phase 2: Surface Analysis

For each component that needs a new Ditto spec (target + unspecced children):

1. Read the TypeScript interface / props type definition.
2. Identify every **text surface** — each piece of user-facing copy the component renders:
   - **String props** rendered in JSX → use the prop name as the surface key
   - **`children`** when used as text → use `$children` as the surface key
   - **Nested props** → use dot notation (e.g. `primaryAction.label`)
   - **Hardcoded strings** in JSX → use a descriptive role name (e.g. `headline`, `submitLabel`, `bodyText`)
3. For each surface, suggest **tags** from the `workspace.ditto.md` tag inventory, matched by semantic role (e.g. `heading`, `body`, `button`, `call-to-action`). Prefer reusing existing tags. Only propose a new tag if nothing fits — and note it will be new.
4. Estimate **`maxLength`** where layout context provides constraints (e.g. single-line headings, button widths). Omit if no clear constraint.

**If the component already has a Ditto spec**, compare the existing surfaces against what the code declares. Report any new surfaces that aren't in the Ditto spec yet, and any Ditto spec surfaces that no longer exist in the code. Propose additions/removals.

Present the proposed Ditto spec for each component in exact YAML format:

```yaml
---
component: ComponentName
tags: [relevant-tags]
surfaces:
  surfaceKey:
    tags: [semantic-tags]
    maxLength: 60
# Managed by Ditto — do not edit below
rules: []
---
```

**STOP HERE. Ask the user to review and approve the proposed surfaces before creating or modifying any files.** Let them add, remove, or modify surfaces and tags.

---

## Phase 3: Create or Update Specs

After user approval:

**For new specs:**

1. Run:
   ```
   npx ditto-spec scaffold <ComponentName> --path <component-directory>
   ```
2. Edit each created `index.ditto.md` to replace the empty `surfaces: {}` and `tags: []` with the approved values. Only edit developer-owned keys (`component`, `tags`, `surfaces`). Never write `rules` or `locales` by hand.

**For existing specs getting new surfaces:**

1. Edit the existing `index.ditto.md` to add the approved new surfaces and tags.

**Then for all specs (new and updated):**

3. Run `npx ditto-spec pull` to populate the `rules` and `locales` sections from the platform.
4. Run `npx ditto-spec check` to validate all Ditto spec files.

Report which Ditto specs were created/updated and how many rules were pulled.

---

## Reference: Ditto Spec Conventions

- **Surface keys**: prop name for props, `$children` for children text, dot-notation for nested props (`primaryAction.label`), descriptive role for hardcoded strings (`headline`, `bodyText`, `submitLabel`).
- **Tags**: lowercase, hyphenated. Match semantic role (e.g. `heading`, `body`, `button`, `call-to-action`, `dialog-title`). Check `workspace.ditto.md` `tags` key for the full inventory.
- **Developer-owned keys**: `component`, `tags`, `surfaces` — edit freely.
- **CLI-managed keys**: `rules`, `locales` (and workspace `tags`) — **never write by hand**. Populated by `ditto-spec pull`.
- **Rule shapes**: style rules have `name`, `description`, optional `examples`, and `section`. Terminology entries have `term`, `disallowed`, `description`, and `section`.
- **Locale-scoped rules**: the `locales` key contains rules keyed by locale code (e.g. `de-DE`). These apply in addition to base `rules` when writing for that locale.
- **Rule hierarchy**: workspace rules (apply everywhere) → component-level rules (no `surface` field) → per-surface rules (with `surface: "<key>"`). Locale-scoped rules follow the same hierarchy.
- **Parent-child layering**: if a parent passes text to a child, the parent declares a surface in its own Ditto spec. A child having its own Ditto spec does NOT exempt the parent from declaring surfaces for text it provides.
- **Tag matching**: style guide rules match Ditto specs by tag intersection. Any shared tag triggers the match.

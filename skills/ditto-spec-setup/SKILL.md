---
name: ditto-spec-setup
description: >
  Set up Ditto Specs in the current repo: install the specs CLI if missing,
  run init, fill in dittospec.config.json, scaffold workspace.ditto.md and
  component index.ditto.md files, and verify API tokens. Use when the user
  says "set up ditto specs", "specs setup", asks to enable Ditto spec files,
  or invokes /ditto-spec-setup. Also offer this during or right after plugin
  install as an optional step. Safe to re-run: detects an existing setup and
  updates it instead of duplicating.
---

Set up Ditto Specs in this repo. Specs are an optional add-on: `*.ditto.md`
files co-locate copy rules with components. Once present, `/ditto-review` and
`/ditto-audit` treat them as the source of truth, and `/ditto-spec-audit`,
`/ditto-spec-component`, and `/ditto-spec-gaps` become usable.

## Steps

1. **Confirm.** Ask the user whether to set up Ditto Specs, with one line on
   what it unlocks (spec-driven review/audit plus the three `/ditto-spec-*`
   skills). If they decline, stop; skip everything below.

2. **Detect an existing setup.** Look for `dittospec.config.json` at the repo
   root or an ancestor directory. If found, this is an update, not a fresh
   install: skip `init`, keep the existing config and `workspace.ditto.md`,
   and only fill gaps (missing config keys, missing workspace spec, unspecced
   components, failing token check). Never create a second config that
   shadows the existing one.

3. **Check the specs CLI.** Run `npx ditto-spec --version`. If the CLI is not
   installed (locally or globally), install it only then:
   `npm install --save-dev @dittowords/spec-cli`.

4. **Verify tokens.** Check that `DITTO_API_TOKEN` is set; if not, point the
   user to https://app.dittowords.com/account/user and pause until it is set.
   The specs CLI reads `DITTO_API_KEY`, not `DITTO_API_TOKEN`. If only
   `DITTO_API_TOKEN` is set, run CLI commands with
   `DITTO_API_KEY="$DITTO_API_TOKEN"` prefixed rather than writing the token
   to a file.

5. **Run init** (fresh installs only): `npx ditto-spec init`. This creates
   `dittospec.config.json` and `workspace.ditto.md` in the current directory,
   so run it from the repo root.

6. **Fill in the config.** Edit `dittospec.config.json`:
   - `apiBase`: `https://api.dittowords.com` (the init default).
   - `workspaceId`: ask the user; it cannot be guessed.
   - `roots`: repo-relative directories the CLI scans for `.ditto.md` files.
     Detect where components live (e.g. `src`, `design-system`); default to
     `["."]` if unclear.

7. **Scaffold component specs.** `workspace.ditto.md` was created by init (or
   already exists). For component specs, list the main components that render
   user-facing text and ask the user which to spec. For each approved
   component, run `npx ditto-spec scaffold <ComponentName> --path <dir>` to
   create its `index.ditto.md`, then fill in its `surfaces` and `tags` keys
   (or run the ditto-spec-component skill per component for full surface
   analysis). Never write the `rules` or `locales` keys by hand.

8. **Pull rules and validate.** Run `npx ditto-spec pull` to populate rules
   from the platform, then `npx ditto-spec check` to validate every spec
   file. If pull fails on auth, revisit step 4.

9. **Report.** List what was created or updated (config, workspace spec,
   component specs, rules pulled) and what the user can run next
   (`/ditto-spec-component` for more components, `/ditto-spec-audit` to
   audit).

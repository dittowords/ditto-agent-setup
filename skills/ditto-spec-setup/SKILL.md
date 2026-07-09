---
name: ditto-spec-setup
description: >
  Set up Ditto Specs in the current repo: install the specs CLI if missing and
  run init. Only invoke with /ditto-spec-setup. Safe to re-run: detects and
  existing setup and skips if found.
---

Set up Ditto Specs in this repo. Once installed, `/ditto-spec-audit`,
`/ditto-spec-component`, and `/ditto-spec-gaps` become usable.

## Steps

1. **Detect an existing setup.** Look for `dittospec.config.json` at the repo
   root or an ancestor directory. If found, skip all steps below.

2. **Check the specs CLI.** Run `npx ditto-spec --version`. If the CLI is not
   installed (locally or globally), install it only then:
   `npm install --save-dev @dittowords/spec-cli`.

3. **Verify tokens.** Check that `DITTO_API_TOKEN` is set; if not, point the
   user to https://app.dittowords.com/account/user and pause until it is set.
   The specs CLI reads `DITTO_API_KEY`, not `DITTO_API_TOKEN`. If only
   `DITTO_API_TOKEN` is set, run CLI commands with
   `DITTO_API_KEY="$DITTO_API_TOKEN"` prefixed rather than writing the token
   to a file.

4. **Run init** (fresh installs only): `npx ditto-spec init`. This creates
   `dittospec.config.json` and `workspace.ditto.md` in the current directory,
   so run it from the repo root.

5. **Scaffold component specs.** `workspace.ditto.md` was created by init. 
   For component specs, list the main components that render
   user-facing text and ask the user which to spec. For each approved
   component, run `npx ditto-spec scaffold <ComponentName> --path <dir>` to
   create its `index.ditto.md`, then fill in its `surfaces` key. Never write
   the `rules`, `tags` or `locales` keys by hand.

6. **Pull rules and validate.** Run `npx ditto-spec pull` to populate rules
   from the platform, then `npx ditto-spec check` to validate every spec
   file. If pull fails on auth, revisit step 4.

7. **Report.** List what was created or updated (config, workspace spec,
   component specs, rules pulled) and what the user can run next
   (`/ditto-spec-component` for more components, `/ditto-spec-audit` to
   audit).

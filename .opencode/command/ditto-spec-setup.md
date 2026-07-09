---
description: Set up Ditto Specs in this repo (specs CLI, config, workspace and component spec files)
---

Use the bundled ditto-spec-setup skill: ask before doing anything, then set up Ditto Specs in this repo. Detect an existing setup and update it instead of duplicating; install the specs CLI only if missing; run npx ditto-spec init; fill in dittospec.config.json (apiBase, workspaceId, roots); scaffold workspace.ditto.md and component index.ditto.md files; verify DITTO_API_TOKEN is set (the CLI reads DITTO_API_KEY, bridge with DITTO_API_KEY="$DITTO_API_TOKEN"); then run npx ditto-spec pull and npx ditto-spec check.

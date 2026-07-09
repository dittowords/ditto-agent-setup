---
description: Audit component instances against the rules in their Ditto spec files (*.ditto.md)
---

Use the bundled ditto-spec-audit skill: audit every instance of $ARGUMENTS (default: all specced components) across the codebase against the rules in their *.ditto.md spec files, resolving inline copy, i18n keys, and Ditto text items, and report violations with file locations and suggested corrections. Report-only; do not modify code, catalogs, or text items.

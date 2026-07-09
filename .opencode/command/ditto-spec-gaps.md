---
description: Find copy patterns that should be styleguide rules but aren't, and create approved ones on the platform
---

Use the bundled ditto-spec-gaps skill: load the full platform rule set with npx ditto-spec rules, analyze copy across instances of $ARGUMENTS (default: all specced components) for patterns no existing rule covers, propose style rules and terminology entries for approval, then create approved ones with npx ditto-spec create-rules and sync with npx ditto-spec pull.

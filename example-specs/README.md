# Example (with specs)

Same frontend source files as `example/`, but with [Ditto specs](https://developer.dittowords.com/ditto-specs-cli-reference/overview) integrated:

- `workspace.ditto.md` — workspace-level rules and tag inventory
- `src/<Component>/index.ditto.md` — per-component surfaces, rules, and terminology
- `dittospec.config.json` — spec CLI config (placeholder workspace id)

Run `/ditto-audit example-specs` to see the skills take the spec-driven path: the copy in `src/` deliberately violates the spec rules (exclamation marks, Title Case, "E-Mail", "Log In", over-length error messages).

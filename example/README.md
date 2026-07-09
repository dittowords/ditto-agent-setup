# Example

An example frontend repo to try the skills on. The copy is deliberately bad
(shouty errors, Title Case, "E-Mail", "Log In" vs "sign in").

- `src/` — feature components with hardcoded copy. Try `/ditto-audit example`
  for the file-scoped audit against your styleguide rules.
- `design-system/` — a shared `Button` atom with a [Ditto
  spec](https://developer.dittowords.com/ditto-specs-cli-reference/overview)
  (`index.ditto.md`). Its copy lives at the call sites in `src/`, so try
  `/ditto-spec-audit Button` for the component-scoped audit: it finds every
  `<Button>` instance and checks the labels ("Try Again", "SIGN UP NOW")
  against the spec's rules.
- `workspace.ditto.md` / `dittospec.config.json` — workspace-level rules and
  spec CLI config (placeholder workspace id).

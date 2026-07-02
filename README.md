# Ditto Agent Package

Ditto's bundled agent integration:

- [Ditto MCP server](https://developer.dittowords.com/mcp-reference/overview)
- Session hooks: every session starts with instructions to consult Ditto for user-facing copy,
  without you prompting it.
- `/ditto-review`: check the current diff's user-facing strings against your
  styleguide rules and existing Ditto text; returns a fix-list.
- `/ditto-audit [path]`: the same check across a directory or the whole
  codebase.

## Install

In Claude Code:

```
/plugin marketplace add dittowords/ditto-agent-setup
/plugin install ditto@ditto
```

Then set your Ditto API token (from [your Ditto account
settings](https://app.dittowords.com/account/user)) in the environment Claude
Code runs in:

```bash
export DITTO_API_TOKEN=<your-api-token>
```

Restart Claude Code (or run `/mcp`) and approve the `ditto` MCP server.

## Project scoping

Add a `ditto/config.yml` to your repo root to scope Ditto results to specific
projects:

```yaml
projects:
  - id: "your-project-developer-id"
```

More information can be found in the [Ditto MCP docs](https://developer.dittowords.com/mcp-reference/overview).

## Try it on the example

The [`example/`](example) directory contains sample components seeded with
copy problems (inconsistent casing, "Log in" vs "sign in", shouty errors).
From this repo:

```
> /ditto-audit example

⏺ Fetching styleguide rules from Ditto…
⏺ Scanning example/ for user-facing strings…

  example/src/SignupForm.jsx:L4: rule "Create Your Account!" → "Create your account"
    (sentence case for headings; no exclamation points)
  example/src/SignupForm.jsx:L5: rule "E-Mail Address" → "Email address"
    (terminology: "email", never "e-mail")
  example/src/SignupForm.jsx:L9: rule "SIGN UP NOW" → "Sign up"
    (no all caps; buttons are verb-first, concise)
  example/src/SignupForm.jsx:L11: reuse "Log In" → "Sign in"
    (existing Ditto text: auth.signIn)
  example/src/ErrorBanner.jsx:L2: rule "Whoops!! Something went wrong…" → "Something went wrong. Try again later."
    (error tone: calm, no interjections)
  example/src/ErrorBanner.jsx:L5: dupe "Session timed out, please log in again" → "Your session expired. Please sign in again."
    (two variants of the same message; L4 matches Ditto)

  2 files scanned, 9 strings checked, 6 findings.
```

And `/ditto-review` does the same for just your working diff, useful right
before a commit:

```
> /ditto-review

⏺ Collecting diff… 1 file changed.
⏺ Checking 2 new strings against styleguide rules and Ditto text…

  src/Settings.tsx:L48: reuse "Save Changes" → "Save changes"
    (existing Ditto text: common.save; sentence case)

  2 strings checked, 1 finding.
```


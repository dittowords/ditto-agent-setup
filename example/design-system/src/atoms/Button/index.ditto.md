---
component: Button
tags: [button]
surfaces:
  $children:
    tags: [button, call-to-action]
    maxLength: 25
rules:
  - surface: $children
    name: Sentence case for button labels
    description: Capitalize only the first word and proper nouns, never Title Case or ALL CAPS
    examples:
      - from: "Try Again"
        to: "Try again"
      - from: "SIGN UP NOW"
        to: "Sign up now"
    section: UI Patterns
  - surface: $children
    name: Use verb + noun pattern
    description: Pair ambiguous verbs with a noun; common actions (Save, Delete, Cancel, Dismiss) are fine alone
    examples:
      - from: "Your settings"
        to: "Open settings"
    section: UI Patterns
  - term: sign in
    disallowed:
      - log in
      - login
    description: Always use "sign in" for the authentication action
    section: Terminology
---

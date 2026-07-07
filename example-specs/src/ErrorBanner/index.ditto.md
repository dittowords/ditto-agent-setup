---
component: ErrorBanner
tags: [error]
surfaces:
  message:
    tags: [body, error]
    maxLength: 50
  dismissLabel:
    tags: [button]
    maxLength: 20
rules:
  - surface: message
    name: Error messages say what happened and what to do
    description: State the problem plainly and give the user a next step; never blame the user or the "system"
    examples:
      - from: "An unexpected error has occurred in the system."
        to: "Something went wrong. Try again."
    section: Voice & Tone
  - term: sign in
    disallowed:
      - log in
      - login
    description: Always use "sign in" for the authentication action
    section: Terminology
---

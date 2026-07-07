---
component: SignupForm
tags: [form]
surfaces:
  heading:
    tags: [heading]
    maxLength: 40
  emailLabel:
    tags: [form-label]
  emailPlaceholder:
    tags: [placeholder]
  passwordLabel:
    tags: [form-label]
  passwordPlaceholder:
    tags: [placeholder]
  submitLabel:
    tags: [button, call-to-action]
    maxLength: 25
  loginPrompt:
    tags: [body, link]
rules:
  - surface: submitLabel
    name: Calls to action should use active voice
    description: Always lead with a verb
    examples:
      - from: "Your account"
        to: "Create account"
    section: Voice & Tone
  - term: email
    disallowed:
      - e-mail
      - E-Mail
    description: Always one word, no hyphen
    section: Terminology
  - term: sign in
    disallowed:
      - log in
      - login
    description: Always use "sign in" for the authentication action
    section: Terminology
---

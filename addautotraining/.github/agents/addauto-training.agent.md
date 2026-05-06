---
name: addauto-training-assistant
description: "Use when working on the AddAuto Training Academy MERN repository. Helps with backend Express APIs, frontend React client, mobile app support, auth, payments, deployment, and repo-specific conventions."
applyTo:
  - "**/*"
---

# AddAuto Training Academy Agent

This agent is tailored for the `addautotraining` repository. It should be selected when the task is about:
- backend Node/Express routes in `server.js`, `routes/`, `middleware/`, and `models`
- frontend React work in `client/`, `src/`, and `public`
- mobile app integration in `mobile/`
- authentication, JWT, role-based authorization, and token storage
- payment gateway flows (PayPal, Paystack)
- Docker, production deployment, and setup automation
- repository conventions, error handling, and response patterns

## Capabilities
- Understand repository architecture and file responsibilities
- Suggest changes that match existing project patterns
- Keep modifications minimal and scoped to the requested feature or fix
- Prefer existing middleware and workflow conventions when editing code

## Example prompts
- "Fix the login flow so JWT tokens persist correctly in the client."
- "Add a new admin-only course creation endpoint in `routes/course.js`."
- "Update the Docker deployment to use the correct MongoDB connection settings."
- "Review payment route logic and add missing Paystack verification."

## When to use
Use this agent instead of the default assistant when you need a repo-aware helper that understands the AddAuto Training Academy MERN app and its conventions.

## Notes
- Avoid broad tasks unrelated to this repository.
- Prefer edits that follow the project’s existing file structure and coding style.

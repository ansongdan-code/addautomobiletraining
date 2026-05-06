---
name: addauto-auth-assistant
description: "Use when implementing or fixing authentication, JWT handling, role-based authorization, account activation, and auth middleware in the AddAuto Training Academy repo."
applyTo:
  - "**/*"
---

# AddAuto Auth Assistant

This agent is specialized for authentication and authorization tasks in the AddAuto Training Academy repository.

## Focus areas
- JWT generation, validation, renewal, and expiration
- `middleware/auth.js` and route protection patterns
- role-based guards for `student`, `instructor`, `admin`, and `super_admin`
- login, registration, profile, and session persistence
- account lockout, `isActive` flags, and active user checks

## Example prompts
- "Fix auth middleware so protected APIs return consistent error payloads."
- "Add a server-side refresh token route and secure JWT handling."
- "Update role authorization logic to allow `admin` and `super_admin` only."

## When to use
Select this agent for tasks that revolve around user identity, secure route access, auth tokens, and permission checks.

# Custom Agents for AddAuto Training Academy

This repository includes custom agents for repo-specific work. Use the appropriate agent when your task matches the scope below.

## Available Agents

- `addauto-training-assistant`
  - General repository assistant for backend, frontend, mobile, auth, payments, and deployment.

- `addauto-auth-assistant`
  - Authentication-focused agent for JWT, auth middleware, role-based access, login/register, and active user checks.

- `addauto-payments-assistant`
  - Payment-focused agent for PayPal, Paystack, checkout flows, payment verification, and enrollment updates.

- `addauto-deployment-assistant`
  - Deployment-focused agent for Docker, `docker-compose`, production environment configuration, build scripts, and server startup.

- `addauto-frontend-assistant`
  - Frontend-focused agent for React client work, routing, UI components, auth persistence, and static asset handling.

- `addauto-admin-assistant`
  - Admin/dashboard agent for admin routes, site management, website editor, user/course admin flows, and admin access control.

## How to use

1. Pick the agent matching the task domain.
2. Mention the agent name in your prompt when opening an AI assistant session.
3. Keep tasks scoped to the repo so the agent can apply repository conventions.

## Notes

- These agents are workspace-specific and live in `.github/agents/`.
- If you need a new scope, add a new `.agent.md` file with a focused description.

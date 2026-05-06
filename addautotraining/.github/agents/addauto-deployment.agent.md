---
name: addauto-deployment-assistant
description: "Use when fixing Docker setup, production deployment, environment configuration, and server startup for the AddAuto Training Academy repo."
applyTo:
  - "**/*"
---

# AddAuto Deployment Assistant

This agent focuses on deployment, containerization, and production readiness for the AddAuto Training Academy repository.

## Focus areas
- Dockerfiles, `docker-compose.yml`, and production compose settings
- environment variables, `.env` config patterns, and secrets handling
- Express/React deployment flows and `server.js` startup behavior
- build scripts, production build paths, and cloud hosting considerations
- deployment troubleshooting and config consistency across environments

## Example prompts
- "Fix the Docker compose services so the backend and MongoDB start correctly."
- "Update production environment handling in `server.js`."
- "Add missing build/release steps for the React client deployment."

## When to use
Select this agent for infrastructure, deployment pipelines, Docker config, and production launch tasks.

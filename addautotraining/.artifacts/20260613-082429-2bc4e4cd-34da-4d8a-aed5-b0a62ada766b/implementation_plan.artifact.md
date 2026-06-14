# Implementation Plan - Resolve Build and Configuration Errors

This plan addresses several critical build and configuration issues that prevent successful deployment and containerization of the AddAuto Training Academy platform.

## Proposed Changes

### Build Scripts and Docker Configuration

#### [Dockerfile](file:///C:/Users/HP/OneDrive/Documents/addautomobiletraining/addautotraining/Dockerfile)

- Copy `build-wrapper.js` into the build stage to ensure `npm run build` succeeds.
- Alternatively, change `npm run build` to `npx react-scripts build` to avoid dependency on the wrapper script during container build.

#### [Dockerfile.backend](file:///C:/Users/HP/OneDrive/Documents/addautomobiletraining/addautotraining/Dockerfile.backend)

- Update the `HEALTHCHECK` command to use the `/health` endpoint instead of `/api/settings`.
- Ensure it points to the correct port (5000).

---

### Backend Entry Point

#### [server.js](file:///C:/Users/HP/OneDrive/Documents/addautomobiletraining/addautotraining/server.js)

- Fix the `module.exports` to be compatible with both Vercel and the existing wrapper scripts (`client/server.js`, `server/server.js`).
- Export the `app` directly while also attaching `app` and `startServer` as properties.

```javascript
// Before
module.exports = { app, startServer };

// After
app.app = app;
app.startServer = startServer;
module.exports = app;
```

---

### Redundant and Broken Directories

#### [client/package.json](file:///C:/Users/HP/OneDrive/Documents/addautomobiletraining/addautotraining/client/package.json)
#### [server/package.json](file:///C:/Users/HP/OneDrive/Documents/addautomobiletraining/addautotraining/server/package.json)

- Remove the broken `build` scripts or update them to be no-ops/warnings, as these directories lack the necessary `src/` folder for `react-scripts build`.
- Align `bcryptjs` version with root (2.4.3) to avoid confusion.

---

### GitHub Integration

- **Branch Management**: Continue working on `chore/full-remediation`.
- **Push Changes**: Once verified, commit and push changes to origin.
- **Pull Request**: Prepare the PR details as suggested by the user.

## Verification Plan

### Automated Tests
- Run `node build-wrapper.js` to ensure root build still works.
- Run `cmd /c npm run test:server` to ensure tests still pass with the modified `server.js` exports.

### Manual Verification
- Simulate the Docker build environment (or check the file list in Dockerfile).
- Verify the `server.js` export manually by requiring it in a script and checking the properties.
- Check if `npm run build:client` still fails or is now a no-op.

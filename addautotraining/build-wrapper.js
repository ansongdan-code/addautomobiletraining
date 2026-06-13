// build-wrapper.js
// Detects whether to run root react build or client build and invokes the appropriate command.
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function run(cmd, args, opts = {}) {
  console.log(`Running: ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, Object.assign({ stdio: 'inherit', shell: true }, opts));
  if (r.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(r.status || 1);
  }
}

const root = process.cwd();
const rootSrc = path.join(root, 'src');
const clientPkg = path.join(root, 'client', 'package.json');

if (fs.existsSync(path.join(root, 'package.json')) && fs.existsSync(path.join(rootSrc, 'index.js')))
{
  // Root React app detected
  console.log('Detected root React app (src/index.js). Running root build...');
  // Use npx to ensure local react-scripts is used when available
  run('npx', ['react-scripts', 'build']);
} else if (fs.existsSync(clientPkg)) {
  console.log('Detected client package. Running client build...');
  run('npm', ['--prefix', 'client', 'run', 'build']);
} else {
  console.error('No build target found. Ensure there is a root React app (src/) or a client/ package.');
  process.exit(1);
}


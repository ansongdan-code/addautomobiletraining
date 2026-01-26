#!/usr/bin/env node

/**
 * Secure Credentials Generator
 * Generates production-ready credentials for Auto Training Academy
 * 
 * Usage: node generate-credentials.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 SECURE CREDENTIALS GENERATOR');
console.log('=' .repeat(50));
console.log('Auto Training Academy - Production Credentials\n');

// Generate credentials
const jwtSecret = crypto.randomBytes(32).toString('hex');
const mongoPassword = crypto.randomBytes(16).toString('base64');
const adminPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);

console.log('✅ Credentials Generated\n');
console.log('=' .repeat(50));

// Display credentials
console.log('\n📋 GENERATED CREDENTIALS:\n');

console.log('1️⃣  JWT_SECRET (for auth tokens):');
console.log(`   ${jwtSecret}\n`);

console.log('2️⃣  MONGO_PASSWORD (for database):');
console.log(`   ${mongoPassword}\n`);

console.log('3️⃣  ADMIN_PASSWORD (new admin account):');
console.log(`   ${adminPassword}\n`);

console.log('=' .repeat(50));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:\n');

console.log('1. SAVE THESE CREDENTIALS SECURELY');
console.log('   - Store in a secure password manager');
console.log('   - Never commit to version control\n');

console.log('2. UPDATE YOUR ENVIRONMENT FILE');
console.log('   Create .env.production with:\n');
console.log('   [.env.production]');
console.log(`   JWT_SECRET=${jwtSecret}`);
console.log(`   MONGO_PASSWORD=${mongoPassword}`);
console.log('   FRONTEND_URL=https://yourdomain.com');
console.log('   NODE_ENV=production\n');

console.log('3. UPDATE DATABASE CREDENTIALS');
console.log('   - Change MongoDB admin password in docker-compose.yml');
console.log('   - Use: MONGO_PASSWORD=${MONGO_PASSWORD}\n');

console.log('4. CHANGE ADMIN ACCOUNT PASSWORD');
console.log('   - Log in with: admin@test.com / admin123');
console.log(`   - Change password to: ${adminPassword}`);
console.log('   - Or create new admin account\n');

console.log('5. ENABLE HTTPS');
console.log('   - Obtain SSL certificate from Let\'s Encrypt');
console.log('   - Configure nginx for HTTPS');
console.log('   - See HTTPS_SETUP_GUIDE.md\n');

console.log('=' .repeat(50));
console.log('\n📁 CREDENTIAL FILE OPTIONS:\n');

// Option 1: Save to .env.production
const envContent = `# === PRODUCTION CREDENTIALS ===
# Generated: ${new Date().toISOString()}
# DO NOT COMMIT TO VERSION CONTROL

# JWT Secret for authentication tokens
JWT_SECRET=${jwtSecret}

# MongoDB root password
MONGO_PASSWORD=${mongoPassword}

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Node environment
NODE_ENV=production

# Optional: Database name
MONGO_DB=addautotraining

# Optional: API endpoint (for frontend)
REACT_APP_API_URL=https://yourdomain.com/api
`;

console.log('Option 1: Save to .env.production file');
console.log('   File: .env.production');
console.log('   Permissions: 600 (read-write owner only)\n');

console.log('Option 2: Use environment variables directly');
console.log('   export JWT_SECRET=' + jwtSecret);
console.log('   export MONGO_PASSWORD=' + mongoPassword);
console.log('   docker-compose --env-file .env.production up\n');

console.log('Option 3: Pass to docker-compose');
console.log('   docker-compose -e JWT_SECRET=' + jwtSecret);
console.log('   -e MONGO_PASSWORD=' + mongoPassword);
console.log('   up --build\n');

console.log('=' .repeat(50));
console.log('\n🔒 SECURITY CHECKLIST:\n');

const checklist = [
  '[ ] Generated new JWT_SECRET',
  '[ ] Generated new MONGO_PASSWORD',
  '[ ] Created .env.production file',
  '[ ] Set file permissions to 600 (chmod 600 .env.production)',
  '[ ] Added .env.production to .gitignore',
  '[ ] Updated docker-compose.yml to use environment variables',
  '[ ] Changed default admin credentials',
  '[ ] Enabled HTTPS with SSL certificate',
  '[ ] Configured CORS to production domain',
  '[ ] Disabled debug logging in production',
  '[ ] Backed up old credentials (if migrating)',
  '[ ] Tested authentication with new credentials',
  '[ ] Ran security assessment (node quick-security-test.js)',
  '[ ] Updated FRONTEND_URL in .env.production'
];

checklist.forEach(item => console.log(item));

console.log('\n' + '=' .repeat(50));
console.log('\n💾 SAVE CREDENTIALS FILE (Optional):\n');

// Ask if user wants to save to file
const args = process.argv.slice(2);
const saveFile = args.includes('--save') || args.includes('-s');

if (saveFile) {
  const filePath = path.join(process.cwd(), '.env.production');
  try {
    fs.writeFileSync(filePath, envContent, { mode: 0o600 });
    console.log(`✅ Saved to ${filePath}`);
    console.log(`   Permissions: 600 (owner read-write only)\n`);
    console.log('⚠️  DO NOT COMMIT THIS FILE TO VERSION CONTROL\n');
  } catch (error) {
    console.error(`❌ Error saving file: ${error.message}`);
  }
} else {
  console.log('To save credentials to .env.production file:');
  console.log('   node generate-credentials.js --save\n');
  console.log('Or manually create .env.production with:');
  console.log(envContent);
}

console.log('=' .repeat(50));
console.log('\n📚 NEXT STEPS:\n');
console.log('1. Save these credentials securely');
console.log('2. Update .env.production with the values above');
console.log('3. Read SECURITY_FIX_GUIDE.md for detailed instructions');
console.log('4. Read HTTPS_SETUP_GUIDE.md to enable HTTPS');
console.log('5. Run: npm run test:security\n');

console.log('🎉 Credentials Generated Successfully!\n');
console.log('=' .repeat(50) + '\n');

// Additional security recommendations
console.log('\n🔐 ADDITIONAL SECURITY RECOMMENDATIONS:\n');

console.log('Password Management:');
console.log('  - Store in: 1Password, LastPass, or Vault');
console.log('  - Enable: 2FA on your password manager');
console.log('  - Backup: Secure offline backup\n');

console.log('Credential Rotation:');
console.log('  - Monthly: Review who has access');
console.log('  - Quarterly: Rotate secrets');
console.log('  - On incident: Immediately rotate all secrets\n');

console.log('Audit & Logging:');
console.log('  - Log all authentication attempts');
console.log('  - Monitor failed logins');
console.log('  - Alert on suspicious activity\n');

console.log('Regular Updates:');
console.log('  - npm audit regularly');
console.log('  - Update Docker images');
console.log('  - Security patches immediately\n');

console.log('=' .repeat(50));
console.log('Generated: ' + new Date().toISOString());
console.log('Status: ✅ READY FOR PRODUCTION DEPLOYMENT');
console.log('=' .repeat(50) + '\n');

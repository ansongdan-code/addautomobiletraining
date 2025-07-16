#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Production Setup for AddAutoTraining');
console.log('========================================');
console.log('');

function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const result = execSync(command, { stdio: 'pipe' });
    console.log('✅ Success');
    return result.toString();
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupProduction() {
  console.log('Step 1: MongoDB Atlas Connection String');
  console.log('---------------------------------------');
  
  const mongoUri = await promptUser('Enter your MongoDB Atlas connection string: ');
  
  if (!mongoUri.startsWith('mongodb+srv://')) {
    console.log('❌ Invalid connection string. Please ensure it starts with mongodb+srv://');
    process.exit(1);
  }

  // Ensure database name is included
  let updatedMongoUri = mongoUri;
  if (!mongoUri.includes('/addautotraining')) {
    updatedMongoUri = mongoUri.replace('mongodb.net/', 'mongodb.net/addautotraining');
  }

  console.log('');
  console.log('Step 2: Updating Environment Variables');
  console.log('--------------------------------------');

  // Remove existing MONGO_URI
  console.log('Removing existing MONGO_URI...');
  runCommand('vercel env rm MONGO_URI production');

  // Add new MONGO_URI
  console.log('Adding new MONGO_URI...');
  fs.writeFileSync('temp-mongo.txt', updatedMongoUri);
  
  console.log('');
  console.log('Step 3: Generate Production JWT Secret');
  console.log('--------------------------------------');
  
  // Generate a secure JWT secret
  const jwtSecret = require('crypto').randomBytes(64).toString('hex');
  console.log('Generated secure JWT secret');
  
  // Update JWT_SECRET
  runCommand('vercel env rm JWT_SECRET production');
  fs.writeFileSync('temp-jwt.txt', jwtSecret);

  console.log('');
  console.log('Step 4: Set NODE_ENV to production');
  console.log('----------------------------------');
  
  runCommand('vercel env rm NODE_ENV production');
  fs.writeFileSync('temp-node-env.txt', 'production');

  console.log('');
  console.log('Step 5: Manual Environment Variable Setup');
  console.log('----------------------------------------');
  console.log('Please run the following commands manually:');
  console.log('');
  console.log('1. Set MONGO_URI:');
  console.log('   vercel env add MONGO_URI production');
  console.log(`   Paste: ${updatedMongoUri}`);
  console.log('');
  console.log('2. Set JWT_SECRET:');
  console.log('   vercel env add JWT_SECRET production');
  console.log(`   Paste: ${jwtSecret}`);
  console.log('');
  console.log('3. Set NODE_ENV:');
  console.log('   vercel env add NODE_ENV production');
  console.log('   Paste: production');
  console.log('');
  console.log('4. Deploy to production:');
  console.log('   vercel --prod');
  console.log('');
  
  // Save all values to files for easy copy-paste
  fs.writeFileSync('production-env-values.txt', `MONGO_URI=${updatedMongoUri}\nJWT_SECRET=${jwtSecret}\nNODE_ENV=production\n`);
  console.log('✅ All values saved to production-env-values.txt');
  
  rl.close();
}

setupProduction().catch(console.error);

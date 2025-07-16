// MongoDB Atlas Connection String Helper
// Run this script after you get your connection string from MongoDB Atlas

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Atlas Connection String Setup');
console.log('=====================================');
console.log('');
console.log('1. Go to MongoDB Atlas Dashboard');
console.log('2. Go to Database -> Click "Connect" on your cluster');
console.log('3. Choose "Connect your application"');
console.log('4. Copy the connection string (it looks like: mongodb+srv://username:password@cluster.mongodb.net/database)');
console.log('');

rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString.startsWith('mongodb+srv://')) {
    console.log('Error: Please enter a valid MongoDB Atlas connection string starting with mongodb+srv://');
    rl.close();
    return;
  }

  // Update the connection string to include the database name
  let updatedConnectionString = connectionString;
  if (!connectionString.includes('/addautotraining')) {
    updatedConnectionString = connectionString.replace('mongodb.net/', 'mongodb.net/addautotraining');
  }

  console.log('');
  console.log('Updated connection string:', updatedConnectionString);
  console.log('');
  console.log('Now updating Vercel environment variables...');
  
  // Save to a temporary file for the update script
  fs.writeFileSync('temp-mongo-uri.txt', updatedConnectionString);
  
  console.log('Connection string saved to temp-mongo-uri.txt');
  console.log('Run the following command to update Vercel:');
  console.log('');
  console.log('vercel env rm MONGO_URI production');
  console.log('vercel env add MONGO_URI production');
  console.log('');
  console.log('When prompted, paste the connection string from temp-mongo-uri.txt');
  
  rl.close();
});

require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Successfully connected to MongoDB!');
        
        // Test database operations
        const collections = await mongoose.connection.db.collections();
        console.log('\nAvailable collections:');
        for (let collection of collections) {
            console.log(`- ${collection.collectionName}`);
        }
        
        console.log('\nConnection test completed successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testConnection();
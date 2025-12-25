const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/payment', require('./routes/payment'));
// app.use('/api/v1/paypal', require('./routes/paypal')); // Temporarily disabled due to SDK issues
app.use('/api/v1/paystack', require('./routes/paystack'));
app.use('/api/v1/videos', require('./routes/video'));
app.use('/api/v1/admin', require('./routes/admin'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve blog.html
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// Serve contact.html
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    res.status(500).json({
        success: false,
        error: 'Server error'
    });
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-training-academy';
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
        
        // Start server only after successful database connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Database: ${mongoURI}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Make sure MongoDB is running locally or set MONGODB_URI in .env file');
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});

// Start the application
connectDB();
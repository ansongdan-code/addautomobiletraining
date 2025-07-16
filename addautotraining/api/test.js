export default function handler(req, res) {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    HAS_MONGO_URI: !!process.env.MONGO_URI,
    HAS_JWT_SECRET: !!process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE,
    MONGO_URI_LENGTH: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  };
  
  res.status(200).json({
    message: 'API Test Endpoint',
    environment: env,
    timestamp: new Date().toISOString()
  });
}

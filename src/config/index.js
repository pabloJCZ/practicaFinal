import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bildyapp',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
};

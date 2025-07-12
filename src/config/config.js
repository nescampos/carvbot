require('dotenv').config();

const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    name: process.env.BOT_NAME || 'CarV AI Assistant',
    description: process.env.BOT_DESCRIPTION || 'AI-powered assistant for CARV SVM Chain ecosystem'
  },
  
  ai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  carv: {
    authToken: process.env.CARV_AUTH_TOKEN
  },
  
  bot: {
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 4096,
    rateLimitPerUser: parseInt(process.env.RATE_LIMIT_PER_USER) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn if CARV auth token is missing (optional but recommended)
  if (!process.env.CARV_AUTH_TOKEN) {
    console.warn('⚠️  CARV_AUTH_TOKEN not set. News functionality may be limited.');
  }
};

module.exports = { config, validateConfig }; 
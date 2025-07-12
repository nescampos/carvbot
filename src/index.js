const TelegramBot = require('node-telegram-bot-api');
const { config, validateConfig } = require('./config/config');
const MessageHandler = require('./handlers/messageHandler');
const logger = require('./utils/logger');
const rateLimiter = require('./utils/rateLimiter');
const aiService = require('./services/aiService');

class CarVAIBot {
  constructor() {
    this.bot = null;
    this.messageHandler = null;
    this.isRunning = false;
  }

  /**
   * Initialize the bot
   */
  async initialize() {
    try {
      // Validate configuration
      validateConfig();
      
      logger.info('Starting CarV AI Bot initialization...');

      // Create bot instance
      this.bot = new TelegramBot(config.telegram.token, { polling: true });
      
      // Initialize message handler
      this.messageHandler = new MessageHandler(this.bot);

      // Set up event handlers
      this.setupEventHandlers();

      // Set bot commands
      await this.setBotCommands();

      this.isRunning = true;
      logger.info('CarV AI Bot initialized successfully!', {
        botName: config.telegram.name,
        aiModel: config.ai.model
      });

    } catch (error) {
      logger.error('Failed to initialize bot:', error);
      throw error;
    }
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Handle incoming messages
    this.bot.on('message', async (msg) => {
      try {
        await this.messageHandler.handleMessage(msg);
      } catch (error) {
        logger.error('Error in message handler:', error);
      }
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      logger.error('Polling error:', error);
    });

    // Handle webhook errors
    this.bot.on('webhook_error', (error) => {
      logger.error('Webhook error:', error);
    });

    // Handle errors
    this.bot.on('error', (error) => {
      logger.error('Bot error:', error);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });
  }

  /**
   * Set bot commands
   */
  async setBotCommands() {
    try {
      const commands = [
        { command: 'start', description: 'Start the bot' },
        { command: 'help', description: 'Show help message' },
        { command: 'clear', description: 'Clear conversation history' },
        { command: 'stats', description: 'Show usage statistics' },
        { command: 'about', description: 'About CARV SVM Chain' }
      ];

      await this.bot.setMyCommands(commands);
      logger.info('Bot commands set successfully');
    } catch (error) {
      logger.error('Failed to set bot commands:', error);
    }
  }

  /**
   * Start the bot
   */
  async start() {
    try {
      await this.initialize();
      
      logger.info('🚀 CarV AI Bot is now running!', {
        botName: config.telegram.name,
        aiModel: config.ai.model,
        rateLimit: config.bot.rateLimitPerUser
      });

      // Log startup statistics
      this.logStartupStats();

    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  /**
   * Shutdown the bot gracefully
   */
  async shutdown() {
    if (!this.isRunning) {
      return;
    }

    logger.info('Shutting down CarV AI Bot...');

    try {
      // Stop rate limiter
      rateLimiter.stop();

      // Stop bot polling
      if (this.bot) {
        this.bot.stopPolling();
      }

      this.isRunning = false;
      logger.info('CarV AI Bot shutdown complete');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Log startup statistics
   */
  logStartupStats() {
    const stats = {
      botName: config.telegram.name,
      aiModel: config.ai.model,
      aiBaseURL: config.ai.baseURL,
      rateLimit: config.bot.rateLimitPerUser,
      maxMessageLength: config.bot.maxMessageLength,
      logLevel: config.logging.level
    };

    logger.info('Bot configuration:', stats);
  }

  /**
   * Get bot status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      botName: config.telegram.name,
      aiModel: config.ai.model,
      conversationStats: aiService.getConversationStats(),
      rateLimitStats: rateLimiter.getStats()
    };
  }
}

// Create and start the bot
const bot = new CarVAIBot();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
bot.start().catch((error) => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});

module.exports = CarVAIBot; 
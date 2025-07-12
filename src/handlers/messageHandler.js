const aiService = require('../services/aiService');
const rateLimiter = require('../utils/rateLimiter');
const logger = require('../utils/logger');
const { config } = require('../config/config');

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Handle incoming messages
   * @param {Object} msg - Telegram message object
   */
  async handleMessage(msg) {
    const userId = msg.from.id.toString();
    const username = msg.from.username;
    const messageText = msg.text;
    const chatId = msg.chat.id;

    logger.info(`Received message from user ${userId}`, {
      username,
      messageLength: messageText?.length || 0,
      chatType: msg.chat.type
    });

    try {
      // Check rate limiting
      if (rateLimiter.isRateLimited(userId)) {
        const timeUntilReset = rateLimiter.getTimeUntilReset(userId);
        const minutesUntilReset = Math.ceil(timeUntilReset / 60000);
        
        await this.bot.sendMessage(chatId, 
          `⚠️ Rate limit exceeded! Please wait ${minutesUntilReset} minute(s) before sending another message.`
        );
        return;
      }

      // Record the request
      rateLimiter.recordRequest(userId);

      // Handle different message types
      if (!messageText) {
        await this.handleNonTextMessage(chatId);
        return;
      }

      // Handle commands
      if (messageText.startsWith('/')) {
        await this.handleCommand(chatId, userId, messageText, username);
        return;
      }

      // Handle regular messages with AI
      await this.handleAIMessage(chatId, userId, messageText, username);

    } catch (error) {
      logger.error('Error handling message:', error);
      await this.bot.sendMessage(chatId, 
        '❌ Sorry, something went wrong. Please try again later.'
      );
    }
  }

  /**
   * Handle AI-powered responses
   * @param {number} chatId - Chat ID
   * @param {string} userId - User ID
   * @param {string} messageText - User's message
   * @param {string} username - User's username
   */
  async handleAIMessage(chatId, userId, messageText, username) {
    try {
      // Send typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Generate AI response
      const response = await aiService.generateResponse(userId, messageText, username);

      // Split long responses if needed
      const messages = this.splitMessage(response, config.bot.maxMessageLength);
      
      for (const message of messages) {
        await this.bot.sendMessage(chatId, message);
      }

      logger.info(`AI response sent to user ${userId}`, {
        responseLength: response.length,
        messageCount: messages.length
      });

    } catch (error) {
      logger.error('Error generating AI response:', error);
      await this.bot.sendMessage(chatId, 
        '🤖 Sorry, I\'m having trouble processing your request. Please try again.'
      );
    }
  }

  /**
   * Handle bot commands
   * @param {number} chatId - Chat ID
   * @param {string} userId - User ID
   * @param {string} messageText - Command text
   * @param {string} username - User's username
   */
  async handleCommand(chatId, userId, messageText, username) {
    const command = messageText.toLowerCase().split(' ')[0];

    switch (command) {
      case '/start':
        await this.handleStartCommand(chatId, username);
        break;
      
      case '/help':
        await this.handleHelpCommand(chatId);
        break;
      
      case '/clear':
        await this.handleClearCommand(chatId, userId);
        break;
      
      case '/stats':
        await this.handleStatsCommand(chatId, userId);
        break;
      
      case '/about':
        await this.handleAboutCommand(chatId);
        break;
      
      default:
        await this.bot.sendMessage(chatId, 
          '❓ Unknown command. Use /help to see available commands.'
        );
    }
  }

  /**
   * Handle /start command
   * @param {number} chatId - Chat ID
   * @param {string} username - User's username
   */
  async handleStartCommand(chatId, username) {
    const welcomeMessage = `🤖 Welcome to CarV AI Assistant${username ? `, @${username}` : ''}!

I'm your AI-powered assistant for the CARV SVM Chain ecosystem. I can help you with:

🔹 Understanding CARV SVM Chain and blockchain technology
🔹 Smart contract development and Solana programming
🔹 DeFi concepts and Web3 applications
🔹 Educational content and tutorials
🔹 General AI and technology questions

Just send me a message and I'll help you out!

Use /help to see all available commands.`;

    await this.bot.sendMessage(chatId, welcomeMessage);
  }

  /**
   * Handle /help command
   * @param {number} chatId - Chat ID
   */
  async handleHelpCommand(chatId) {
    const helpMessage = `📚 **Available Commands:**

/start - Start the bot and get welcome message
/help - Show this help message
/clear - Clear conversation history
/stats - Show your usage statistics
/about - Learn more about CARV SVM Chain

💡 **Tips:**
• Just send me any message to chat with AI
• I remember our conversation context
• Use /clear to start fresh
• I'm specialized in CARV SVM Chain topics

🚀 **Ready to explore the future of blockchain?**`;

    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /clear command
   * @param {number} chatId - Chat ID
   * @param {string} userId - User ID
   */
  async handleClearCommand(chatId, userId) {
    aiService.clearConversationHistory(userId);
    await this.bot.sendMessage(chatId, 
      '🧹 Conversation history cleared! Starting fresh.'
    );
  }

  /**
   * Handle /stats command
   * @param {number} chatId - Chat ID
   * @param {string} userId - User ID
   */
  async handleStatsCommand(chatId, userId) {
    const remainingRequests = rateLimiter.getRemainingRequests(userId);
    const timeUntilReset = rateLimiter.getTimeUntilReset(userId);
    const minutesUntilReset = Math.ceil(timeUntilReset / 60000);

    const statsMessage = `📊 **Your Statistics:**

🔄 Remaining requests: ${remainingRequests}/${config.bot.rateLimitPerUser}
⏰ Rate limit resets in: ${minutesUntilReset} minute(s)

💬 I'm here to help with CARV SVM Chain and blockchain topics!`;

    await this.bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle /about command
   * @param {number} chatId - Chat ID
   */
  async handleAboutCommand(chatId) {
    const aboutMessage = `🌐 **About CARV SVM Chain**

CARV SVM Chain is a high-performance blockchain built on the SVM (Solana Virtual Machine) framework, enabling:

⚡ **High Performance**: Fast transaction processing
🔧 **Developer Friendly**: Solana-compatible programming
🌍 **Scalable**: Built for mass adoption
🤖 **AI Ready**: Perfect for AI-powered applications

This bot is part of the CARV hackathon project, demonstrating AI + Web3 integration for real-world use cases.

Learn more: [CARV Documentation](https://docs.carv.io)`;

    await this.bot.sendMessage(chatId, aboutMessage, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  /**
   * Handle non-text messages
   * @param {number} chatId - Chat ID
   */
  async handleNonTextMessage(chatId) {
    await this.bot.sendMessage(chatId, 
      '📝 I can only process text messages. Please send me a text message to chat!'
    );
  }

  /**
   * Split long messages to comply with Telegram limits
   * @param {string} message - Message to split
   * @param {number} maxLength - Maximum length per message
   * @returns {Array} Array of message parts
   */
  splitMessage(message, maxLength) {
    if (message.length <= maxLength) {
      return [message];
    }

    const parts = [];
    let currentPart = '';
    const sentences = message.split('. ');

    for (const sentence of sentences) {
      if ((currentPart + sentence).length > maxLength) {
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = sentence + '. ';
        } else {
          // Single sentence is too long, split by words
          const words = sentence.split(' ');
          for (const word of words) {
            if ((currentPart + word + ' ').length > maxLength) {
              if (currentPart) {
                parts.push(currentPart.trim());
                currentPart = word + ' ';
              } else {
                parts.push(word);
              }
            } else {
              currentPart += word + ' ';
            }
          }
          currentPart += '. ';
        }
      } else {
        currentPart += sentence + '. ';
      }
    }

    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }
}

module.exports = MessageHandler; 
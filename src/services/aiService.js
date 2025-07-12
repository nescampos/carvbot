const { AIProviderFactory } = require('./aiProviders');
const { config } = require('../config/config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    // Detect and create AI provider
    const providerType = AIProviderFactory.detectProvider(config.ai);
    this.provider = AIProviderFactory.createProvider(providerType, config.ai);
    
    this.conversationHistory = new Map(); // Store conversation history per user
    this.maxHistoryLength = 10; // Keep last 10 messages for context
    
    logger.info(`AI Service initialized with provider: ${providerType}`, {
      baseURL: config.ai.baseURL,
      model: config.ai.model
    });
  }

  /**
   * Generate AI response for user message
   * @param {string} userId - Telegram user ID
   * @param {string} message - User's message
   * @param {string} username - User's username (optional)
   * @returns {Promise<string>} AI response
   */
  async generateResponse(userId, message, username = null) {
    try {
      // Get conversation history for this user
      const history = this.getConversationHistory(userId);
      
      // Prepare system prompt with CARV context
      const systemPrompt = this.getSystemPrompt(username);
      
      // Prepare messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ];

      logger.info(`Generating AI response for user ${userId}`, {
        messageLength: message.length,
        historyLength: history.length
      });

      const response = await this.provider.generateResponse(messages, {
        model: config.ai.model,
        maxTokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });
      
      // Update conversation history
      this.updateConversationHistory(userId, message, response);
      
      return response;
      
    } catch (error) {
      logger.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again later.');
    }
  }

  /**
   * Get system prompt with CARV context
   * @param {string} username - User's username
   * @returns {string} System prompt
   */
  getSystemPrompt(username) {
    return `You are CarV AI Assistant, an intelligent bot designed to help users with the CARV SVM Chain ecosystem. 

CARV SVM Chain is a blockchain built on the SVM (Solana Virtual Machine) framework, enabling high-performance decentralized applications.

Key capabilities:
- Help users understand CARV SVM Chain and its features
- Provide guidance on blockchain development and DeFi
- Assist with smart contract concepts and Solana programming
- Answer questions about Web3, AI, and blockchain technology
- Support educational content and tutorials

User: ${username || 'Anonymous'}

Please provide helpful, accurate, and engaging responses. Keep responses concise but informative. If you're unsure about something, acknowledge the limitation and suggest where they might find more information.

Current conversation context: This is a Telegram bot interaction.`;
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - Telegram user ID
   * @returns {Array} Conversation history
   */
  getConversationHistory(userId) {
    const history = this.conversationHistory.get(userId) || [];
    return history.slice(-this.maxHistoryLength * 2); // Keep last N exchanges (user + assistant messages)
  }

  /**
   * Update conversation history for a user
   * @param {string} userId - Telegram user ID
   * @param {string} userMessage - User's message
   * @param {string} assistantResponse - AI's response
   */
  updateConversationHistory(userId, userMessage, assistantResponse) {
    const history = this.getConversationHistory(userId);
    
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantResponse }
    );

    // Keep only the last N exchanges
    const maxExchanges = this.maxHistoryLength;
    if (history.length > maxExchanges * 2) {
      history.splice(0, history.length - maxExchanges * 2);
    }

    this.conversationHistory.set(userId, history);
  }

  /**
   * Clear conversation history for a user
   * @param {string} userId - Telegram user ID
   */
  clearConversationHistory(userId) {
    this.conversationHistory.delete(userId);
    logger.info(`Cleared conversation history for user ${userId}`);
  }

  /**
   * Get conversation statistics
   * @returns {Object} Statistics about conversations
   */
  getConversationStats() {
    return {
      activeUsers: this.conversationHistory.size,
      totalConversations: Array.from(this.conversationHistory.values())
        .reduce((total, history) => total + history.length, 0)
    };
  }
}

module.exports = new AIService(); 
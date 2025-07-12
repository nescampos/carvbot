const { AIProviderFactory } = require('./aiProviders');
const newsService = require('./newsService');
const investmentAnalyzer = require('./investmentAnalyzer');
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
      // Check if user is asking for investment analysis
      const investmentResponse = await this.handleInvestmentRequest(message);
      if (investmentResponse) {
        return investmentResponse;
      }

      // Check if user is asking for news
      const newsResponse = await this.handleNewsRequest(message);
      if (newsResponse) {
        return newsResponse;
      }

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
   * Handle investment and news-related requests
   * @param {string} message - User's message
   * @returns {Promise<string|null>} Response or null if not a relevant request
   */
  async handleInvestmentRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for investment-related keywords
    const investmentKeywords = [
      'invertir', 'invest', 'comprar', 'buy', 'vender', 'sell', 'recomendación',
      'recommendation', 'análisis', 'analysis', 'mercado', 'market', 'trading',
      'precio', 'price', 'tendencia', 'trend', 'oportunidad', 'opportunity',
      'portfolio', 'cartera', 'estrategia', 'strategy', 'predicción', 'prediction'
    ];

    const isInvestmentRequest = investmentKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!isInvestmentRequest) {
      return null;
    }

    try {
      logger.info('Processing investment request:', { message });

      // Check for specific asset analysis
      const assets = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot'];
      const mentionedAsset = assets.find(asset => lowerMessage.includes(asset));
      
      if (mentionedAsset) {
        // Get specific asset recommendation
        const assetName = this.normalizeAssetName(mentionedAsset);
        return await investmentAnalyzer.getAssetRecommendation(assetName);
      }

      // General investment analysis
      return await investmentAnalyzer.analyzeInvestmentOpportunities();

    } catch (error) {
      logger.error('Error handling investment request:', error);
      return '📊 Sorry, I\'m having trouble analyzing investment opportunities right now. Please try again later.';
    }
  }

  /**
   * Handle news-related requests
   * @param {string} message - User's message
   * @returns {Promise<string|null>} News response or null if not a news request
   */
  async handleNewsRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for news-related keywords
    const newsKeywords = [
      'noticias', 'news', 'crypto', 'bitcoin', 'ethereum', 'blockchain', 
      'mercado', 'market', 'precio', 'price', 'trading', 'defi', 'nft',
      'tendencias', 'trending', 'últimas', 'latest', 'actualidad'
    ];

    const isNewsRequest = newsKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!isNewsRequest) {
      return null;
    }

    try {
      logger.info('Processing news request:', { message });

      // Check for specific categories or search terms
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        const news = await newsService.getNewsByCategory('bitcoin');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        const news = await newsService.getNewsByCategory('ethereum');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('solana') || lowerMessage.includes('sol')) {
        const news = await newsService.getNewsByCategory('solana');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('defi') || lowerMessage.includes('decentralized')) {
        const news = await newsService.getNewsByCategory('defi');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('nft')) {
        const news = await newsService.getNewsByCategory('nft');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('regulation') || lowerMessage.includes('sec') || lowerMessage.includes('regulación')) {
        const news = await newsService.getNewsByCategory('regulation');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('market') || lowerMessage.includes('mercado') || lowerMessage.includes('price') || lowerMessage.includes('precio')) {
        const news = await newsService.getNewsByCategory('markets');
        return newsService.formatNewsForDisplay(news);
      }
      
      if (lowerMessage.includes('trending') || lowerMessage.includes('tendencias')) {
        const trending = await newsService.getTrendingTopics();
        let response = '🔥 **Trending Topics in Crypto & Blockchain:**\n\n';
        trending.forEach((topic, index) => {
          response += `${index + 1}. **${topic.keyword}** (${topic.count} mentions)\n`;
        });
        return response;
      }

      // Default: get latest news
      const news = await newsService.getLatestNews();
      return newsService.formatNewsForDisplay(news);

    } catch (error) {
      logger.error('Error handling news request:', error);
      return '📰 Sorry, I\'m having trouble fetching the latest news right now. Please try again later.';
    }
  }

  /**
   * Normalize asset names for consistent analysis
   * @param {string} asset - Asset name or symbol
   * @returns {string} Normalized asset name
   */
  normalizeAssetName(asset) {
    const assetMap = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'sol': 'solana',
      'ada': 'cardano',
      'dot': 'polkadot',
      'link': 'chainlink',
      'uni': 'uniswap'
    };

    return assetMap[asset.toLowerCase()] || asset.toLowerCase();
  }

  /**
   * Get system prompt with CARV context
   * @param {string} username - User's username
   * @returns {string} System prompt
   */
  getSystemPrompt(username) {
    return `You are CarV AI Investment Assistant, an intelligent bot designed to provide investment recommendations based on cryptocurrency and blockchain news analysis.

CARV SVM Chain is a blockchain built on the SVM (Solana Virtual Machine) framework, enabling high-performance decentralized applications.

Key capabilities:
- Provide investment recommendations based on news sentiment analysis
- Analyze market trends and opportunities
- Offer buy/sell/hold recommendations for crypto assets
- Explain blockchain technology and DeFi concepts
- Support educational content about crypto investing
- Provide latest cryptocurrency and blockchain news from CARV API

Investment Features:
- Sentiment analysis of crypto news
- Asset-specific recommendations (Bitcoin, Ethereum, Solana, etc.)
- Market overview and trend analysis
- Risk assessment and timeframe suggestions
- Portfolio strategy guidance

News Features:
- Latest crypto and blockchain news
- Category-specific news (Bitcoin, Ethereum, Solana, DeFi, NFT, etc.)
- Market updates and price movements
- Regulatory news and compliance updates
- Trending topics in the crypto space

User: ${username || 'Anonymous'}

IMPORTANT: Always include disclaimers that this is not financial advice and users should do their own research. Focus on providing educational insights and market analysis rather than specific investment advice.

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
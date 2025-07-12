const axios = require('axios');
const logger = require('../utils/logger');
const { config } = require('../config/config');

class NewsService {
  constructor() {
    this.baseURL = 'https://interface.carv.io';
    this.newsEndpoint = '/ai-agent-backend/news';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Fetch latest cryptocurrency and blockchain news
   * @param {string} authToken - Authorization token
   * @returns {Promise<Array>} Array of news articles
   */
  async getLatestNews(authToken = null) {
    try {
      // Check cache first
      const cacheKey = 'latest_news';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info('Returning cached news data');
        return cached;
      }

      logger.info('Fetching latest news from CARV API');

      const headers = {
        'Content-Type': 'application/json'
      };

      // Add authorization header if provided
      if (authToken) {
        headers['Authorization'] = authToken;
      }

      const response = await axios.get(`${this.baseURL}${this.newsEndpoint}`, {
        headers,
        timeout: 10000 // 10 second timeout
      });

      if (response.status === 200 && response.data.code === 0) {
        const news = response.data.data.infos || [];
        
        // Cache the results
        this.setCache(cacheKey, news);
        
        logger.info(`Successfully fetched ${news.length} news articles`);
        return news;
      } else {
        throw new Error(`API returned status ${response.status}: ${response.data.msg || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error('Error fetching news:', error.message);
      
      // Return cached data if available, even if expired
      const cached = this.cache.get('latest_news');
      if (cached && cached.data) {
        logger.info('Returning expired cached news data due to API error');
        return cached.data;
      }
      
      throw new Error('Failed to fetch news. Please try again later.');
    }
  }

  /**
   * Search news by keywords
   * @param {string} query - Search query
   * @param {string} authToken - Authorization token
   * @returns {Promise<Array>} Filtered news articles
   */
  async searchNews(query, authToken = null) {
    try {
      const allNews = await this.getLatestNews(authToken);
      
      if (!query || query.trim() === '') {
        return allNews;
      }

      const searchTerms = query.toLowerCase().split(' ');
      const filteredNews = allNews.filter(article => {
        const title = article.title.toLowerCase();
        const cardText = article.card_text.toLowerCase();
        
        return searchTerms.some(term => 
          title.includes(term) || cardText.includes(term)
        );
      });

      logger.info(`Search for "${query}" returned ${filteredNews.length} results`);
      return filteredNews;

    } catch (error) {
      logger.error('Error searching news:', error.message);
      throw error;
    }
  }

  /**
   * Get news by category (cryptocurrency, blockchain, markets, etc.)
   * @param {string} category - News category
   * @param {string} authToken - Authorization token
   * @returns {Promise<Array>} Category-specific news
   */
  async getNewsByCategory(category, authToken = null) {
    try {
      const allNews = await this.getLatestNews(authToken);
      
      const categoryKeywords = {
        'bitcoin': ['bitcoin', 'btc', 'satoshi'],
        'ethereum': ['ethereum', 'eth', 'ether'],
        'solana': ['solana', 'sol'],
        'defi': ['defi', 'decentralized finance', 'yield farming', 'liquidity'],
        'nft': ['nft', 'non-fungible', 'digital art'],
        'regulation': ['sec', 'regulation', 'legal', 'compliance'],
        'markets': ['price', 'market', 'trading', 'volume'],
        'security': ['hack', 'exploit', 'security', 'breach'],
        'adoption': ['adoption', 'partnership', 'enterprise', 'institutional']
      };

      const keywords = categoryKeywords[category.toLowerCase()] || [category.toLowerCase()];
      
      const filteredNews = allNews.filter(article => {
        const title = article.title.toLowerCase();
        const cardText = article.card_text.toLowerCase();
        
        return keywords.some(keyword => 
          title.includes(keyword) || cardText.includes(keyword)
        );
      });

      logger.info(`Category "${category}" returned ${filteredNews.length} results`);
      return filteredNews;

    } catch (error) {
      logger.error('Error getting news by category:', error.message);
      throw error;
    }
  }

  /**
   * Get trending topics from news
   * @param {string} authToken - Authorization token
   * @returns {Promise<Array>} Trending topics
   */
  async getTrendingTopics(authToken = null) {
    try {
      const allNews = await this.getLatestNews(authToken);
      
      // Extract common keywords from titles
      const keywords = {};
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
      
      allNews.forEach(article => {
        const words = article.title.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(' ')
          .filter(word => word.length > 3 && !commonWords.includes(word));
        
        words.forEach(word => {
          keywords[word] = (keywords[word] || 0) + 1;
        });
      });

      // Get top 10 trending keywords
      const trending = Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      logger.info(`Extracted ${trending.length} trending topics`);
      return trending;

    } catch (error) {
      logger.error('Error getting trending topics:', error.message);
      throw error;
    }
  }

  /**
   * Format news for display
   * @param {Array} news - News articles
   * @param {number} limit - Maximum number of articles to show
   * @returns {string} Formatted news string
   */
  formatNewsForDisplay(news, limit = 5) {
    if (!news || news.length === 0) {
      return '📰 No news found for your query.';
    }

    const limitedNews = news.slice(0, limit);
    let formatted = `📰 **Latest News** (${limitedNews.length} of ${news.length} articles)\n\n`;

    limitedNews.forEach((article, index) => {
      formatted += `${index + 1}. **${article.title}**\n`;
      formatted += `   ${article.card_text}\n`;
      formatted += `   [Read more](${article.url})\n\n`;
    });

    if (news.length > limit) {
      formatted += `... and ${news.length - limit} more articles available.`;
    }

    return formatted;
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('News cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

module.exports = new NewsService(); 
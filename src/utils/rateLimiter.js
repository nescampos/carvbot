const logger = require('./logger');
const { config } = require('../config/config');

class RateLimiter {
  constructor() {
    this.userRequests = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, config.bot.rateLimitWindowMs);
  }

  /**
   * Check if user is rate limited
   * @param {string} userId - Telegram user ID
   * @returns {boolean} True if user is rate limited
   */
  isRateLimited(userId) {
    const now = Date.now();
    const userRequests = this.userRequests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < config.bot.rateLimitWindowMs
    );
    
    // Update user requests
    this.userRequests.set(userId, validRequests);
    
    // Check if user has exceeded rate limit
    if (validRequests.length >= config.bot.rateLimitPerUser) {
      logger.warn(`User ${userId} is rate limited`, {
        requests: validRequests.length,
        limit: config.bot.rateLimitPerUser
      });
      return true;
    }
    
    return false;
  }

  /**
   * Record a request for a user
   * @param {string} userId - Telegram user ID
   */
  recordRequest(userId) {
    const now = Date.now();
    const userRequests = this.userRequests.get(userId) || [];
    userRequests.push(now);
    this.userRequests.set(userId, userRequests);
    
    logger.debug(`Recorded request for user ${userId}`, {
      totalRequests: userRequests.length
    });
  }

  /**
   * Get remaining requests for a user
   * @param {string} userId - Telegram user ID
   * @returns {number} Remaining requests
   */
  getRemainingRequests(userId) {
    const now = Date.now();
    const userRequests = this.userRequests.get(userId) || [];
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < config.bot.rateLimitWindowMs
    );
    
    return Math.max(0, config.bot.rateLimitPerUser - validRequests.length);
  }

  /**
   * Get time until rate limit resets for a user
   * @param {string} userId - Telegram user ID
   * @returns {number} Milliseconds until reset
   */
  getTimeUntilReset(userId) {
    const now = Date.now();
    const userRequests = this.userRequests.get(userId) || [];
    
    if (userRequests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...userRequests);
    const resetTime = oldestRequest + config.bot.rateLimitWindowMs;
    return Math.max(0, resetTime - now);
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - config.bot.rateLimitWindowMs;
    
    for (const [userId, requests] of this.userRequests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      
      if (validRequests.length === 0) {
        this.userRequests.delete(userId);
      } else {
        this.userRequests.set(userId, validRequests);
      }
    }
    
    logger.debug('Rate limiter cleanup completed', {
      activeUsers: this.userRequests.size
    });
  }

  /**
   * Get rate limiter statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      activeUsers: this.userRequests.size,
      totalRequests: Array.from(this.userRequests.values())
        .reduce((total, requests) => total + requests.length, 0)
    };
  }

  /**
   * Stop the cleanup interval
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = new RateLimiter(); 
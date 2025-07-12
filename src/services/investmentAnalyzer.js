const newsService = require('./newsService');
const logger = require('../utils/logger');

class InvestmentAnalyzer {
  constructor() {
    this.sentimentKeywords = {
      positive: [
        'bullish', 'surge', 'rally', 'gain', 'rise', 'up', 'positive', 'growth',
        'adoption', 'partnership', 'launch', 'success', 'profit', 'earnings',
        'approval', 'greenlight', 'breakthrough', 'innovation', 'upgrade',
        'bullish', 'subida', 'ganancia', 'crecimiento', 'éxito', 'beneficio',
        'aprobación', 'innovación', 'mejora', 'alianza', 'lanzamiento'
      ],
      negative: [
        'bearish', 'crash', 'drop', 'fall', 'decline', 'down', 'negative', 'loss',
        'hack', 'exploit', 'breach', 'security', 'regulation', 'ban', 'restriction',
        'failure', 'bankruptcy', 'scam', 'fraud', 'investigation', 'lawsuit',
        'bajista', 'caída', 'pérdida', 'hackeo', 'exploit', 'brecha', 'seguridad',
        'regulación', 'prohibición', 'restricción', 'fracaso', 'quiebra', 'estafa',
        'fraude', 'investigación', 'demanda'
      ],
      neutral: [
        'announcement', 'update', 'release', 'statement', 'report', 'analysis',
        'announcement', 'actualización', 'lanzamiento', 'declaración', 'informe', 'análisis'
      ]
    };

    this.assetKeywords = {
      'bitcoin': ['bitcoin', 'btc', 'satoshi'],
      'ethereum': ['ethereum', 'eth', 'ether'],
      'solana': ['solana', 'sol'],
      'cardano': ['cardano', 'ada'],
      'polkadot': ['polkadot', 'dot'],
      'chainlink': ['chainlink', 'link'],
      'uniswap': ['uniswap', 'uni'],
      'aave': ['aave', 'aave'],
      'defi': ['defi', 'decentralized finance', 'yield farming'],
      'nft': ['nft', 'non-fungible', 'digital art']
    };
  }

  /**
   * Analyze news and provide investment recommendations
   * @param {string} query - User query (optional asset focus)
   * @returns {Promise<Object>} Investment analysis and recommendations
   */
  async analyzeInvestmentOpportunities(query = '') {
    try {
      logger.info('Starting investment analysis', { query });

      // Get latest news
      const news = await newsService.getLatestNews();
      
      // Analyze sentiment and identify assets
      const analysis = this.analyzeNewsSentiment(news, query);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(analysis);
      
      // Format response
      const response = this.formatInvestmentResponse(analysis, recommendations);
      
      logger.info('Investment analysis completed', {
        assetsAnalyzed: Object.keys(analysis.assets).length,
        recommendationsCount: recommendations.length
      });

      return response;

    } catch (error) {
      logger.error('Error in investment analysis:', error);
      throw new Error('Failed to analyze investment opportunities. Please try again later.');
    }
  }

  /**
   * Analyze sentiment of news articles
   * @param {Array} news - News articles
   * @param {string} query - Optional asset focus
   * @returns {Object} Sentiment analysis results
   */
  analyzeNewsSentiment(news, query = '') {
    const analysis = {
      overall: { positive: 0, negative: 0, neutral: 0 },
      assets: {},
      timeframes: {
        short: { positive: 0, negative: 0 },
        medium: { positive: 0, negative: 0 },
        long: { positive: 0, negative: 0 }
      }
    };

    news.forEach(article => {
      const title = article.title.toLowerCase();
      const content = article.card_text.toLowerCase();
      const text = `${title} ${content}`;

      // Analyze sentiment
      const sentiment = this.calculateSentiment(text);
      
      // Update overall sentiment
      analysis.overall[sentiment]++;

      // Identify assets mentioned
      const mentionedAssets = this.identifyAssets(text);
      
      mentionedAssets.forEach(asset => {
        if (!analysis.assets[asset]) {
          analysis.assets[asset] = { positive: 0, negative: 0, neutral: 0, mentions: 0 };
        }
        analysis.assets[asset][sentiment]++;
        analysis.assets[asset].mentions++;
      });

      // Analyze timeframes based on keywords
      if (text.includes('short') || text.includes('immediate') || text.includes('urgent')) {
        analysis.timeframes.short[sentiment]++;
      }
      if (text.includes('medium') || text.includes('weeks') || text.includes('months')) {
        analysis.timeframes.medium[sentiment]++;
      }
      if (text.includes('long') || text.includes('years') || text.includes('future')) {
        analysis.timeframes.long[sentiment]++;
      }
    });

    return analysis;
  }

  /**
   * Calculate sentiment score for text
   * @param {string} text - Text to analyze
   * @returns {string} 'positive', 'negative', or 'neutral'
   */
  calculateSentiment(text) {
    let positiveScore = 0;
    let negativeScore = 0;

    // Count positive keywords
    this.sentimentKeywords.positive.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        positiveScore += matches.length;
      }
    });

    // Count negative keywords
    this.sentimentKeywords.negative.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        negativeScore += matches.length;
      }
    });

    // Determine sentiment
    if (positiveScore > negativeScore) {
      return 'positive';
    } else if (negativeScore > positiveScore) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Identify assets mentioned in text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of asset names
   */
  identifyAssets(text) {
    const mentionedAssets = [];

    Object.entries(this.assetKeywords).forEach(([asset, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          mentionedAssets.push(asset);
        }
      });
    });

    return [...new Set(mentionedAssets)]; // Remove duplicates
  }

  /**
   * Generate investment recommendations
   * @param {Object} analysis - Sentiment analysis results
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Analyze overall market sentiment
    const overallSentiment = this.getDominantSentiment(analysis.overall);
    const marketRecommendation = this.getMarketRecommendation(overallSentiment);
    recommendations.push(marketRecommendation);

    // Analyze individual assets
    Object.entries(analysis.assets)
      .filter(([asset, data]) => data.mentions >= 2) // Only assets with multiple mentions
      .forEach(([asset, data]) => {
        const sentiment = this.getDominantSentiment(data);
        const recommendation = this.getAssetRecommendation(asset, sentiment, data.mentions);
        recommendations.push(recommendation);
      });

    // Sort by confidence (mention count)
    recommendations.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get dominant sentiment from data
   * @param {Object} data - Sentiment data
   * @returns {string} Dominant sentiment
   */
  getDominantSentiment(data) {
    if (data.positive > data.negative && data.positive > data.neutral) {
      return 'positive';
    } else if (data.negative > data.positive && data.negative > data.neutral) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Get market recommendation based on sentiment
   * @param {string} sentiment - Market sentiment
   * @returns {Object} Market recommendation
   */
  getMarketRecommendation(sentiment) {
    const recommendations = {
      positive: {
        action: 'BUY',
        reasoning: 'Overall market sentiment is positive. Consider increasing exposure to crypto assets.',
        confidence: 'medium',
        timeframe: 'short to medium term'
      },
      negative: {
        action: 'SELL',
        reasoning: 'Overall market sentiment is negative. Consider reducing exposure or hedging positions.',
        confidence: 'medium',
        timeframe: 'short term'
      },
      neutral: {
        action: 'HOLD',
        reasoning: 'Market sentiment is mixed. Maintain current positions and monitor for clearer signals.',
        confidence: 'low',
        timeframe: 'short term'
      }
    };

    return {
      type: 'market',
      asset: 'Overall Market',
      ...recommendations[sentiment]
    };
  }

  /**
   * Get asset-specific recommendation
   * @param {string} asset - Asset name
   * @param {string} sentiment - Asset sentiment
   * @param {number} mentions - Number of mentions
   * @returns {Object} Asset recommendation
   */
  getAssetRecommendation(asset, sentiment, mentions) {
    const confidence = mentions >= 5 ? 'high' : mentions >= 3 ? 'medium' : 'low';
    
    const recommendations = {
      positive: {
        action: 'BUY',
        reasoning: `Recent news about ${asset} is predominantly positive. Consider accumulating positions.`,
        timeframe: 'short to medium term'
      },
      negative: {
        action: 'SELL',
        reasoning: `Recent news about ${asset} is predominantly negative. Consider reducing exposure.`,
        timeframe: 'short term'
      },
      neutral: {
        action: 'HOLD',
        reasoning: `News about ${asset} is mixed. Monitor for clearer signals before making changes.`,
        timeframe: 'short term'
      }
    };

    return {
      type: 'asset',
      asset: asset.toUpperCase(),
      confidence,
      mentions,
      ...recommendations[sentiment]
    };
  }

  /**
   * Format investment response for display
   * @param {Object} analysis - Sentiment analysis
   * @param {Array} recommendations - Investment recommendations
   * @returns {string} Formatted response
   */
  formatInvestmentResponse(analysis, recommendations) {
    let response = '📊 **Investment Analysis & Recommendations**\n\n';
    
    // Market overview
    const overallSentiment = this.getDominantSentiment(analysis.overall);
    response += `🌍 **Market Overview:**\n`;
    response += `Overall sentiment: ${overallSentiment.toUpperCase()}\n`;
    response += `Positive news: ${analysis.overall.positive}\n`;
    response += `Negative news: ${analysis.overall.negative}\n`;
    response += `Neutral news: ${analysis.overall.neutral}\n\n`;

    // Asset analysis
    if (Object.keys(analysis.assets).length > 0) {
      response += `📈 **Asset Analysis:**\n`;
      Object.entries(analysis.assets)
        .sort(([,a], [,b]) => b.mentions - a.mentions)
        .slice(0, 5)
        .forEach(([asset, data]) => {
          const sentiment = this.getDominantSentiment(data);
          const emoji = sentiment === 'positive' ? '🟢' : sentiment === 'negative' ? '🔴' : '🟡';
          response += `${emoji} ${asset.toUpperCase()}: ${sentiment} (${data.mentions} mentions)\n`;
        });
      response += '\n';
    }

    // Recommendations
    response += `💡 **Recommendations:**\n\n`;
    recommendations.forEach((rec, index) => {
      const actionEmoji = rec.action === 'BUY' ? '🟢' : rec.action === 'SELL' ? '🔴' : '🟡';
      const confidenceEmoji = rec.confidence === 'high' ? '🔥' : rec.confidence === 'medium' ? '⚡' : '💡';
      
      response += `${index + 1}. ${actionEmoji} **${rec.action} ${rec.asset}** ${confidenceEmoji}\n`;
      response += `   ${rec.reasoning}\n`;
      response += `   Timeframe: ${rec.timeframe}\n`;
      if (rec.mentions) {
        response += `   Based on ${rec.mentions} recent mentions\n`;
      }
      response += '\n';
    });

    // Disclaimer
    response += `⚠️ **Disclaimer:**\n`;
    response += `This analysis is based on recent news sentiment and should not be considered as financial advice. Always do your own research and consider consulting with a financial advisor before making investment decisions.`;

    return response;
  }

  /**
   * Get specific asset recommendation
   * @param {string} asset - Asset to analyze
   * @returns {Promise<string>} Asset-specific recommendation
   */
  async getAssetRecommendation(asset) {
    try {
      const news = await newsService.getNewsByCategory(asset);
      const analysis = this.analyzeNewsSentiment(news, asset);
      const recommendations = this.generateRecommendations(analysis);
      
      const assetRec = recommendations.find(r => r.asset.toLowerCase() === asset.toLowerCase());
      
      if (assetRec) {
        return this.formatAssetRecommendation(assetRec, analysis.assets[asset]);
      } else {
        return `📊 **${asset.toUpperCase()} Analysis:**\n\nNot enough recent news data for ${asset.toUpperCase()}. Consider checking back later for updated analysis.`;
      }

    } catch (error) {
      logger.error('Error getting asset recommendation:', error);
      return `📊 **${asset.toUpperCase()} Analysis:**\n\nUnable to analyze ${asset.toUpperCase()} at this time. Please try again later.`;
    }
  }

  /**
   * Format asset-specific recommendation
   * @param {Object} recommendation - Recommendation object
   * @param {Object} assetData - Asset sentiment data
   * @returns {string} Formatted recommendation
   */
  formatAssetRecommendation(recommendation, assetData) {
    const actionEmoji = recommendation.action === 'BUY' ? '🟢' : recommendation.action === 'SELL' ? '🔴' : '🟡';
    const confidenceEmoji = recommendation.confidence === 'high' ? '🔥' : recommendation.confidence === 'medium' ? '⚡' : '💡';
    
    let response = `📊 **${recommendation.asset} Investment Analysis**\n\n`;
    response += `${actionEmoji} **Recommendation: ${recommendation.action}** ${confidenceEmoji}\n\n`;
    response += `**Reasoning:**\n${recommendation.reasoning}\n\n`;
    response += `**Timeframe:** ${recommendation.timeframe}\n`;
    response += `**Confidence:** ${recommendation.confidence.toUpperCase()}\n`;
    response += `**Based on:** ${recommendation.mentions} recent news mentions\n\n`;
    
    if (assetData) {
      response += `**Sentiment Breakdown:**\n`;
      response += `🟢 Positive: ${assetData.positive}\n`;
      response += `🔴 Negative: ${assetData.negative}\n`;
      response += `🟡 Neutral: ${assetData.neutral}\n\n`;
    }

    response += `⚠️ **Disclaimer:** This analysis is based on news sentiment and should not be considered as financial advice. Always do your own research.`;

    return response;
  }
}

module.exports = new InvestmentAnalyzer(); 
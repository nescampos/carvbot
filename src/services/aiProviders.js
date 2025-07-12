const OpenAI = require('openai');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Base AI Provider class
 */
class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }

  async generateResponse(messages, options = {}) {
    throw new Error('generateResponse must be implemented by subclass');
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async generateResponse(messages, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || this.config.model,
        messages: messages,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw error;
    }
  }
}

/**
 * Anthropic Claude Provider
 */
class AnthropicProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.anthropic.com';
  }

  async generateResponse(messages, options = {}) {
    try {
      // Convert OpenAI format to Anthropic format
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');

      let prompt = '';
      if (systemMessage) {
        prompt += `\n\nHuman: ${systemMessage.content}\n\nAssistant: I understand. I'll help you with that.`;
      }

      // Combine messages in Anthropic format
      for (let i = 0; i < Math.max(userMessages.length, assistantMessages.length); i++) {
        if (userMessages[i]) {
          prompt += `\n\nHuman: ${userMessages[i].content}`;
        }
        if (assistantMessages[i]) {
          prompt += `\n\nAssistant: ${assistantMessages[i].content}`;
        }
      }

      prompt += '\n\nAssistant:';

      const response = await axios.post(
        `${this.baseURL}/v1/messages`,
        {
          model: options.model || 'claude-3-sonnet-20240229',
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      logger.error('Anthropic API error:', error);
      throw error;
    }
  }
}

/**
 * Custom OpenAI-compatible Provider
 */
class CustomProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async generateResponse(messages, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || this.config.model,
        messages: messages,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('Custom AI API error:', error);
      throw error;
    }
  }
}

/**
 * AI Provider Factory
 */
class AIProviderFactory {
  static createProvider(type, config) {
    switch (type.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(config);
      
      case 'anthropic':
        return new AnthropicProvider(config);
      
      case 'custom':
        return new CustomProvider(config);
      
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }

  /**
   * Detect provider type from configuration
   */
  static detectProvider(config) {
    if (config.apiKey && config.baseURL) {
      if (config.baseURL.includes('anthropic')) {
        return 'anthropic';
      } else if (config.baseURL.includes('openai') || config.baseURL === 'https://api.openai.com/v1') {
        return 'openai';
      } else {
        return 'custom';
      }
    }
    
    // Default to OpenAI
    return 'openai';
  }
}

module.exports = {
  BaseAIProvider,
  OpenAIProvider,
  AnthropicProvider,
  CustomProvider,
  AIProviderFactory
}; 
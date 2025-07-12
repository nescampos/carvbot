const { config, validateConfig } = require('../src/config/config');
const aiService = require('../src/services/aiService');
const logger = require('../src/utils/logger');

/**
 * Test script for CarV AI Bot
 * Run with: node test/test-bot.js
 */

async function testAIService() {
  console.log('🧪 Testing AI Service...');
  
  try {
    // Test configuration
    console.log('📋 Testing configuration...');
    validateConfig();
    console.log('✅ Configuration is valid');
    
    // Test AI response generation
    console.log('🤖 Testing AI response generation...');
    const testUserId = 'test-user-123';
    const testMessage = 'Hello! Can you tell me about CARV SVM Chain?';
    
    const response = await aiService.generateResponse(testUserId, testMessage, 'testuser');
    console.log('✅ AI response generated successfully');
    console.log('📝 Response:', response.substring(0, 200) + '...');
    
    // Test conversation history
    console.log('💬 Testing conversation history...');
    const history = aiService.getConversationHistory(testUserId);
    console.log(`✅ Conversation history has ${history.length} messages`);
    
    // Test conversation stats
    console.log('📊 Testing conversation stats...');
    const stats = aiService.getConversationStats();
    console.log('✅ Conversation stats:', stats);
    
    // Test clearing history
    console.log('🧹 Testing history clearing...');
    aiService.clearConversationHistory(testUserId);
    const clearedHistory = aiService.getConversationHistory(testUserId);
    console.log(`✅ History cleared, remaining messages: ${clearedHistory.length}`);
    
    console.log('\n🎉 All tests passed! The bot is ready to run.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testConfiguration() {
  console.log('🔧 Testing configuration...');
  
  console.log('Bot Configuration:');
  console.log('- Name:', config.telegram.name);
  console.log('- AI Model:', config.ai.model);
  console.log('- AI Base URL:', config.ai.baseURL);
  console.log('- Rate Limit:', config.bot.rateLimitPerUser);
  console.log('- Max Message Length:', config.bot.maxMessageLength);
  
  console.log('✅ Configuration test completed');
}

async function runTests() {
  console.log('🚀 Starting CarV AI Bot Tests\n');
  
  try {
    await testConfiguration();
    console.log('');
    await testAIService();
    
    console.log('\n✨ All tests completed successfully!');
    console.log('\nTo start the bot, run: npm start');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testAIService, testConfiguration, runTests }; 
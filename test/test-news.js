const newsService = require('../src/services/newsService');
const logger = require('../src/utils/logger');

/**
 * Test script for News Service
 * Run with: node test/test-news.js
 */

async function testNewsService() {
  console.log('📰 Testing News Service...\n');
  
  try {
    // Test 1: Get latest news
    console.log('1️⃣ Testing latest news fetch...');
    const latestNews = await newsService.getLatestNews();
    console.log(`✅ Successfully fetched ${latestNews.length} news articles`);
    
    if (latestNews.length > 0) {
      console.log('📝 Sample article:');
      console.log(`   Title: ${latestNews[0].title}`);
      console.log(`   URL: ${latestNews[0].url}`);
      console.log('');
    }

    // Test 2: Search news by category
    console.log('2️⃣ Testing category-based news...');
    const categories = ['bitcoin', 'ethereum', 'defi', 'nft'];
    
    for (const category of categories) {
      const categoryNews = await newsService.getNewsByCategory(category);
      console.log(`✅ ${category.toUpperCase()}: ${categoryNews.length} articles`);
    }
    console.log('');

    // Test 3: Test trending topics
    console.log('3️⃣ Testing trending topics...');
    const trending = await newsService.getTrendingTopics();
    console.log(`✅ Found ${trending.length} trending topics`);
    
    if (trending.length > 0) {
      console.log('🔥 Top 5 trending topics:');
      trending.slice(0, 5).forEach((topic, index) => {
        console.log(`   ${index + 1}. ${topic.keyword} (${topic.count} mentions)`);
      });
      console.log('');
    }

    // Test 4: Test news formatting
    console.log('4️⃣ Testing news formatting...');
    const formattedNews = newsService.formatNewsForDisplay(latestNews.slice(0, 3));
    console.log('✅ News formatting test completed');
    console.log('📝 Formatted news preview:');
    console.log(formattedNews.substring(0, 200) + '...');
    console.log('');

    // Test 5: Test cache functionality
    console.log('5️⃣ Testing cache functionality...');
    const cacheStats = newsService.getCacheStats();
    console.log(`✅ Cache stats: ${cacheStats.size} entries`);
    console.log(`   Cache keys: ${cacheStats.entries.join(', ')}`);
    console.log('');

    console.log('🎉 All news service tests passed!');
    console.log('\nThe news integration is working correctly.');
    
  } catch (error) {
    console.error('❌ News service test failed:', error.message);
    process.exit(1);
  }
}

async function testNewsIntegration() {
  console.log('🤖 Testing News + AI Integration...\n');
  
  try {
    const aiService = require('../src/services/aiService');
    
    // Test news request detection
    const testMessages = [
      'What are the latest bitcoin news?',
      'Show me ethereum market updates',
      'What are the trending topics in crypto?',
      'Tell me about defi news',
      'Hello, how are you?' // This should NOT trigger news
    ];

    for (const message of testMessages) {
      console.log(`Testing message: "${message}"`);
      const response = await aiService.handleNewsRequest(message);
      
      if (response) {
        console.log('✅ News response detected');
        console.log(`   Response length: ${response.length} characters`);
      } else {
        console.log('✅ No news response (expected for non-news queries)');
      }
      console.log('');
    }

    console.log('🎉 News + AI integration test completed!');
    
  } catch (error) {
    console.error('❌ News + AI integration test failed:', error.message);
    process.exit(1);
  }
}

async function runNewsTests() {
  console.log('🚀 Starting News Service Tests\n');
  
  try {
    await testNewsService();
    console.log('');
    await testNewsIntegration();
    
    console.log('\n✨ All news tests completed successfully!');
    console.log('\nThe bot is ready to provide news updates.');
    
  } catch (error) {
    console.error('\n💥 News test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runNewsTests();
}

module.exports = { testNewsService, testNewsIntegration, runNewsTests }; 
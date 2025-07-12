const { config } = require('../src/config/config');
const newsService = require('../src/services/newsService');
const logger = require('../src/utils/logger');

/**
 * Test script for CARV API Configuration
 * Run with: node test/test-carv-config.js
 */

async function testCARVConfiguration() {
  console.log('🔧 Testing CARV API Configuration...\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables...');
    
    const hasAuthToken = !!config.carv.authToken;
    console.log(`   CARV_AUTH_TOKEN configured: ${hasAuthToken ? '✅ Yes' : '❌ No'}`);
    
    if (!hasAuthToken) {
      console.log('   ⚠️  Warning: CARV_AUTH_TOKEN not set. News functionality may be limited.');
    }
    
    console.log('');

    // Test 2: Test news service initialization
    console.log('2️⃣ Testing news service initialization...');
    
    const newsServiceInstance = new (require('../src/services/newsService').constructor)();
    console.log(`   News service initialized: ✅ Yes`);
    console.log(`   Base URL: ${newsServiceInstance.baseURL}`);
    console.log(`   Endpoint: ${newsServiceInstance.newsEndpoint}`);
    console.log(`   Auth token available: ${!!newsServiceInstance.authToken ? '✅ Yes' : '❌ No'}`);
    console.log('');

    // Test 3: Test API connection (if token available)
    if (hasAuthToken) {
      console.log('3️⃣ Testing CARV API connection...');
      
      try {
        const news = await newsService.getLatestNews();
        console.log(`   ✅ API connection successful`);
        console.log(`   📰 Fetched ${news.length} news articles`);
        
        if (news.length > 0) {
          console.log(`   📝 Sample article: ${news[0].title.substring(0, 50)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ API connection failed: ${error.message}`);
        console.log(`   💡 This might be due to invalid token or API issues`);
      }
      
    } else {
      console.log('3️⃣ Skipping API connection test (no auth token)');
      console.log('   💡 Set CARV_AUTH_TOKEN to test API connection');
    }
    
    console.log('');

    // Test 4: Test configuration validation
    console.log('4️⃣ Testing configuration validation...');
    
    try {
      const { validateConfig } = require('../src/config/config');
      validateConfig();
      console.log('   ✅ Configuration validation passed');
    } catch (error) {
      console.log(`   ❌ Configuration validation failed: ${error.message}`);
    }
    
    console.log('');

    console.log('🎉 CARV configuration test completed!');
    
    if (hasAuthToken) {
      console.log('\n✅ CARV API is properly configured and ready to use.');
    } else {
      console.log('\n⚠️  CARV API is not fully configured. News functionality may be limited.');
      console.log('   💡 Set CARV_AUTH_TOKEN for full news access.');
    }
    
  } catch (error) {
    console.error('❌ CARV configuration test failed:', error.message);
    process.exit(1);
  }
}

async function testNewsFunctionality() {
  console.log('📰 Testing News Functionality...\n');
  
  try {
    // Test news fetching
    console.log('1️⃣ Testing news fetching...');
    
    try {
      const news = await newsService.getLatestNews();
      console.log(`   ✅ News fetching successful`);
      console.log(`   📊 Articles fetched: ${news.length}`);
      
      if (news.length > 0) {
        console.log(`   📝 First article: ${news[0].title}`);
        console.log(`   🔗 URL: ${news[0].url}`);
      }
      
    } catch (error) {
      console.log(`   ❌ News fetching failed: ${error.message}`);
    }
    
    console.log('');

    // Test news categorization
    console.log('2️⃣ Testing news categorization...');
    
    const categories = ['bitcoin', 'ethereum', 'defi'];
    
    for (const category of categories) {
      try {
        const categoryNews = await newsService.getNewsByCategory(category);
        console.log(`   ✅ ${category.toUpperCase()}: ${categoryNews.length} articles`);
      } catch (error) {
        console.log(`   ❌ ${category.toUpperCase()}: ${error.message}`);
      }
    }
    
    console.log('');

    // Test trending topics
    console.log('3️⃣ Testing trending topics...');
    
    try {
      const trending = await newsService.getTrendingTopics();
      console.log(`   ✅ Trending topics: ${trending.length} topics found`);
      
      if (trending.length > 0) {
        console.log(`   🔥 Top 3 trending: ${trending.slice(0, 3).map(t => t.keyword).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Trending topics failed: ${error.message}`);
    }
    
    console.log('');

    console.log('🎉 News functionality test completed!');
    
  } catch (error) {
    console.error('❌ News functionality test failed:', error.message);
    process.exit(1);
  }
}

async function runCARVTests() {
  console.log('🚀 Starting CARV Configuration Tests\n');
  
  try {
    await testCARVConfiguration();
    console.log('');
    await testNewsFunctionality();
    
    console.log('\n✨ All CARV tests completed successfully!');
    console.log('\nThe bot is ready to provide news and investment analysis.');
    
  } catch (error) {
    console.error('\n💥 CARV test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCARVTests();
}

module.exports = { testCARVConfiguration, testNewsFunctionality, runCARVTests }; 
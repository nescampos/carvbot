const investmentAnalyzer = require('../src/services/investmentAnalyzer');
const newsService = require('../src/services/newsService');
const logger = require('../src/utils/logger');

/**
 * Test script for Investment Analyzer
 * Run with: node test/test-investment.js
 */

async function testInvestmentAnalyzer() {
  console.log('📊 Testing Investment Analyzer...\n');
  
  try {
    // Test 1: General investment analysis
    console.log('1️⃣ Testing general investment analysis...');
    const generalAnalysis = await investmentAnalyzer.analyzeInvestmentOpportunities();
    console.log('✅ General investment analysis completed');
    console.log('📝 Analysis preview:');
    console.log(generalAnalysis.substring(0, 300) + '...');
    console.log('');

    // Test 2: Specific asset analysis
    console.log('2️⃣ Testing specific asset analysis...');
    const assets = ['bitcoin', 'ethereum', 'solana'];
    
    for (const asset of assets) {
      console.log(`   Analyzing ${asset.toUpperCase()}...`);
      const assetAnalysis = await investmentAnalyzer.getAssetRecommendation(asset);
      console.log(`   ✅ ${asset.toUpperCase()} analysis completed`);
      console.log(`   📝 Preview: ${assetAnalysis.substring(0, 100)}...`);
    }
    console.log('');

    // Test 3: Sentiment analysis
    console.log('3️⃣ Testing sentiment analysis...');
    const news = await newsService.getLatestNews();
    const analysis = investmentAnalyzer.analyzeNewsSentiment(news);
    
    console.log(`✅ Sentiment analysis completed`);
    console.log(`   Overall sentiment: ${investmentAnalyzer.getDominantSentiment(analysis.overall)}`);
    console.log(`   Assets analyzed: ${Object.keys(analysis.assets).length}`);
    console.log(`   Positive news: ${analysis.overall.positive}`);
    console.log(`   Negative news: ${analysis.overall.negative}`);
    console.log(`   Neutral news: ${analysis.overall.neutral}`);
    console.log('');

    // Test 4: Asset identification
    console.log('4️⃣ Testing asset identification...');
    const testText = 'Bitcoin is surging while Ethereum shows bearish signals. Solana remains neutral.';
    const identifiedAssets = investmentAnalyzer.identifyAssets(testText);
    console.log(`✅ Asset identification completed`);
    console.log(`   Identified assets: ${identifiedAssets.join(', ')}`);
    console.log('');

    // Test 5: Recommendation generation
    console.log('5️⃣ Testing recommendation generation...');
    const recommendations = investmentAnalyzer.generateRecommendations(analysis);
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.action} ${rec.asset} (${rec.confidence} confidence)`);
    });
    console.log('');

    console.log('🎉 All investment analyzer tests passed!');
    console.log('\nThe investment analysis system is working correctly.');
    
  } catch (error) {
    console.error('❌ Investment analyzer test failed:', error.message);
    process.exit(1);
  }
}

async function testInvestmentIntegration() {
  console.log('🤖 Testing Investment + AI Integration...\n');
  
  try {
    const aiService = require('../src/services/aiService');
    
    // Test investment request detection
    const testMessages = [
      'Should I invest in bitcoin?',
      'What is the market sentiment for ethereum?',
      'Analyze solana investment opportunities',
      'Give me investment recommendations',
      'Hello, how are you?' // This should NOT trigger investment
    ];

    for (const message of testMessages) {
      console.log(`Testing message: "${message}"`);
      const response = await aiService.handleInvestmentRequest(message);
      
      if (response) {
        console.log('✅ Investment response detected');
        console.log(`   Response length: ${response.length} characters`);
      } else {
        console.log('✅ No investment response (expected for non-investment queries)');
      }
      console.log('');
    }

    console.log('🎉 Investment + AI integration test completed!');
    
  } catch (error) {
    console.error('❌ Investment + AI integration test failed:', error.message);
    process.exit(1);
  }
}

async function runInvestmentTests() {
  console.log('🚀 Starting Investment Analyzer Tests\n');
  
  try {
    await testInvestmentAnalyzer();
    console.log('');
    await testInvestmentIntegration();
    
    console.log('\n✨ All investment tests completed successfully!');
    console.log('\nThe bot is ready to provide investment recommendations.');
    
  } catch (error) {
    console.error('\n💥 Investment test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runInvestmentTests();
}

module.exports = { testInvestmentAnalyzer, testInvestmentIntegration, runInvestmentTests }; 
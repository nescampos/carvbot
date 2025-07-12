#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Setup script for CarV AI Telegram Bot
 * Run with: node scripts/setup.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupBot() {
  console.log('🤖 CarV AI Telegram Bot Setup\n');
  console.log('This script will help you configure your bot.\n');

  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    const envExists = fs.existsSync(envPath);

    if (envExists) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('\n📋 Required Configuration:\n');

    // Get Telegram Bot Token
    console.log('1. Telegram Bot Token');
    console.log('   Get this from @BotFather on Telegram');
    console.log('   Visit: https://t.me/botfather\n');
    
    const telegramToken = await question('Enter your Telegram Bot Token: ');
    if (!telegramToken.trim()) {
      throw new Error('Telegram Bot Token is required');
    }

    // Get AI Service Configuration
    console.log('\n2. AI Service Configuration');
    console.log('   Choose your AI provider:\n');
    console.log('   a) OpenAI (default)');
    console.log('   b) Anthropic Claude');
    console.log('   c) Custom OpenAI-compatible service\n');

    const aiChoice = await question('Choose AI provider (a/b/c): ');
    
    // Get CARV API Configuration
    console.log('\n3. CARV API Configuration');
    console.log('   This is for accessing cryptocurrency news from CARV API');
    console.log('   Leave empty if you don\'t have a CARV auth token\n');
    
    const carvToken = await question('Enter your CARV Auth Token: ');
    
    let aiConfig = {};
    
    switch (aiChoice.toLowerCase()) {
      case 'a':
      case '':
        console.log('\n📝 OpenAI Configuration:');
        const openaiKey = await question('Enter your OpenAI API Key: ');
        if (!openaiKey.trim()) {
          throw new Error('OpenAI API Key is required');
        }
        
        const openaiModel = await question('Enter model name (default: gpt-3.5-turbo): ') || 'gpt-3.5-turbo';
        
        aiConfig = {
          apiKey: openaiKey.trim(),
          baseURL: 'https://api.openai.com/v1',
          model: openaiModel.trim()
        };
        break;

      case 'b':
        console.log('\n📝 Anthropic Configuration:');
        const anthropicKey = await question('Enter your Anthropic API Key: ');
        if (!anthropicKey.trim()) {
          throw new Error('Anthropic API Key is required');
        }
        
        aiConfig = {
          apiKey: anthropicKey.trim(),
          baseURL: 'https://api.anthropic.com',
          model: 'claude-3-sonnet-20240229'
        };
        break;

      case 'c':
        console.log('\n📝 Custom AI Service Configuration:');
        const customKey = await question('Enter your API Key: ');
        if (!customKey.trim()) {
          throw new Error('API Key is required');
        }
        
        const customURL = await question('Enter your API Base URL: ');
        if (!customURL.trim()) {
          throw new Error('API Base URL is required');
        }
        
        const customModel = await question('Enter model name: ');
        if (!customModel.trim()) {
          throw new Error('Model name is required');
        }
        
        aiConfig = {
          apiKey: customKey.trim(),
          baseURL: customURL.trim(),
          model: customModel.trim()
        };
        break;

      default:
        throw new Error('Invalid choice. Please select a, b, or c.');
    }

    // Optional configuration
    console.log('\n4. Optional Configuration:\n');
    
    const botName = await question('Bot name (default: CarV AI Investment Assistant): ') || 'CarV AI Investment Assistant';
    const rateLimit = await question('Rate limit per user (default: 10): ') || '10';
    const maxMessageLength = await question('Max message length (default: 4096): ') || '4096';

    // Generate .env content
    const envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${telegramToken.trim()}

# AI Service Configuration
OPENAI_API_KEY=${aiConfig.apiKey}
OPENAI_API_BASE_URL=${aiConfig.baseURL}
OPENAI_MODEL=${aiConfig.model}

# CARV API Configuration
CARV_AUTH_TOKEN=${carvToken.trim()}

# Bot Configuration
BOT_NAME=${botName.trim()}
BOT_DESCRIPTION=AI-powered investment assistant for CARV SVM Chain ecosystem
MAX_MESSAGE_LENGTH=${maxMessageLength.trim()}
RATE_LIMIT_PER_USER=${rateLimit.trim()}
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env file');

    // Create logs directory
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ Created logs directory');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Test the bot: node test/test-bot.js');
    console.log('3. Start the bot: npm start');
    console.log('\nFor help, see README.md');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupBot();
}

module.exports = { setupBot }; 
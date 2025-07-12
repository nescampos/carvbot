# CARV AI Telegram Bot

🤖 An intelligent AI-powered Telegram bot for the [CARV SVM Chain](https://carv.io/) ecosystem, providing investment analysis, news insights, and blockchain assistance.

## 🎯 Overview

The CARV AI Telegram Bot is a sophisticated chatbot that combines artificial intelligence with blockchain technology to provide real-world value. Built specifically for the CARV SVM Chain ecosystem, this bot offers intelligent investment analysis, real-time news insights, and comprehensive blockchain assistance.

## 🚀 Key Features

### **AI-Powered Investment Analysis**
- **Conversation Memory**: Maintains context across messages for personalized interactions
- **Sentiment Analysis**: Analyzes news sentiment for investment insights
- **Investment Recommendations**: Provides BUY/SELL/HOLD recommendations based on market analysis
- **Multi-Provider Support**: Compatible with OpenAI, Anthropic, or custom endpoints
- **News Integration**: Real-time cryptocurrency and blockchain news from CARV API

### **Advanced User Experience**
- **Intuitive Commands**: Easy-to-use command system for all features
- **Typing Indicators**: Shows when AI is processing requests
- **Message Splitting**: Handles long responses automatically
- **Rate Limiting**: Prevents abuse while ensuring fair access
- **Error Recovery**: Graceful error handling and recovery

### **Technical Excellence**
- **Modular Architecture**: Easy to extend and maintain
- **Comprehensive Logging**: Winston-based structured logging
- **Configuration Management**: Environment-based configuration
- **Security Features**: Input validation and sanitization
- **Scalable Design**: Ready for high-traffic deployment

## 📋 Available Commands

- `/start` - Start the bot and get welcome message
- `/help` - Show help message and available commands
- `/clear` - Clear conversation history
- `/stats` - Show your usage statistics
- `/about` - Learn more about CARV SVM Chain
- `/invest` - Get investment analysis and recommendations
- `/analyze <asset>` - Analyze specific asset (e.g., `/analyze bitcoin`)
- `/news` - Get latest cryptocurrency and blockchain news
- `/trending` - Show trending topics in crypto space

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram API  │◄──►│   Message       │◄──►│   AI Service    │
│                 │    │   Handler       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Rate Limiter  │    │   Conversation  │
                       │                 │    │   History       │
                       └─────────────────┘    └─────────────────┘
```

## 🎨 Use Cases

### **Investment Analysis & Guidance**
- **Market Sentiment Analysis**: Analyzes news sentiment for investment insights
- **Investment Recommendations**: Provides BUY/SELL/HOLD recommendations
- **Asset-Specific Analysis**: Detailed analysis for individual cryptocurrencies
- **Risk Assessment**: Evaluates market conditions and potential risks

### **Developer Support**
- **Smart Contract Help**: Assistance with Solana programming
- **Best Practices**: Code review and optimization suggestions
- **Debugging Support**: Help with common development issues

### **Community Engagement**
- **24/7 Availability**: Always-on support for global community
- **Consistent Responses**: Standardized information delivery
- **Scalable Support**: Handles multiple users simultaneously

### **Future Extensions**
- **DeFi Integration**: Real-time price and portfolio tracking
- **NFT Support**: NFT creation and management guidance
- **Governance Participation**: DAO voting and proposal assistance
- **Advanced Investment Features**: Portfolio optimization and risk management

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+ installed
- Telegram Bot Token (get from [@BotFather](https://t.me/botfather))
- OpenAI API Key (or compatible AI service)
- CARV API Token

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd carv-ai-telegram-bot

# Install dependencies
npm install

# Run setup script
npm run setup
```

### 3. Configuration

```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo

# CARV API Configuration
CARV_AUTH_TOKEN=your_carv_auth_token_here

# Rate Limiting
RATE_LIMIT_PER_USER=10
RATE_LIMIT_WINDOW_MS=60000
```

### 4. Testing Configuration

```bash
# Test CARV API configuration
npm run test-carv

# Test news functionality
npm run test-news

# Test investment analyzer
npm run test-investment

# Test complete bot
npm run test-bot
```

### 5. Running the Bot

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ⚙️ Configuration Options

### AI Service Configuration

The bot is compatible with any OpenAI-compatible API. You can configure:

- **OpenAI**: Default configuration
- **Anthropic Claude**: Use Claude API
- **Custom Endpoints**: Any OpenAI-compatible service
- **Local Models**: Self-hosted models

### CARV API Configuration

For accessing cryptocurrency news from CARV API:

- **CARV_AUTH_TOKEN**: Authentication token for CARV API access
- **Recommended**: Get your token from CARV platform for full news access
- **How to get**: Visit [CARV Documentation](https://docs.carv.io) for API access instructions

### Rate Limiting

Configure rate limiting in `.env`:

```env
RATE_LIMIT_PER_USER=10
RATE_LIMIT_WINDOW_MS=60000
```

### Logging

Logs are stored in the `logs/` directory:

- `combined.log` - All logs
- `error.log` - Error logs only

## 🔧 Technical Implementation

### **AI Integration**
- **OpenAI-Compatible API**: Works with any OpenAI-compatible service
- **Provider Factory Pattern**: Easy switching between AI providers
- **Conversation Context**: Maintains user conversation history
- **Error Handling**: Robust error recovery and fallback mechanisms

### **Telegram Bot Features**
- **Command System**: Built-in commands for bot management
- **Message Handling**: Supports text, commands, and media
- **User Management**: Tracks user interactions and preferences
- **Rate Limiting**: Prevents abuse and ensures fair usage

### **Scalability Features**
- **Memory Management**: Automatic cleanup of old conversations
- **Resource Optimization**: Efficient data structures and algorithms
- **Modular Design**: Easy to extend with new features
- **Configuration-Driven**: Environment-based settings

## 📁 Project Structure

```
src/
├── config/
│   └── config.js          # Configuration management
├── services/
│   ├── aiService.js       # AI service integration
│   ├── newsService.js     # News fetching service
│   └── investmentService.js # Investment analysis service
├── handlers/
│   └── messageHandler.js  # Message handling logic
├── utils/
│   ├── logger.js          # Logging utility
│   └── rateLimiter.js     # Rate limiting
└── index.js               # Main application entry
```

## 🛠️ Development

### Adding New Commands

1. Add command logic in `src/handlers/messageHandler.js`
2. Update command list in `src/index.js`
3. Update help message

### Adding New AI Features

1. Extend `src/services/aiService.js`
2. Add new methods for specific AI capabilities
3. Update message handler to use new features

### Adding New Services

1. Create new service file in `src/services/`
2. Implement service interface
3. Add configuration options
4. Update main application to use new service

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production Deployment

1. Set up environment variables
2. Install dependencies: `npm install --production`
3. Start the bot: `npm start`

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
# Required
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here

CARV_AUTH_TOKEN=your_carv_auth_token_here

# Performance tuning
RATE_LIMIT_PER_USER=10
RATE_LIMIT_WINDOW_MS=60000
LOG_LEVEL=info
```

## 🔮 Future Roadmap

### **Phase 1: Core Features** ✅
- Basic AI conversation
- Command system
- Rate limiting
- Logging and monitoring

### **Phase 2: Enhanced Features** 🚧
- **Multi-language Support**: International user base
- **Voice Messages**: Audio input/output support
- **File Sharing**: Document and code sharing
- **Group Chat Support**: Community discussions

### **Phase 3: Web3 Integration** 🔮
- **Wallet Integration**: Direct blockchain interactions
- **DeFi Tracking**: Portfolio and price monitoring
- **NFT Management**: NFT creation and trading
- **Governance Participation**: DAO voting and proposals

### **Phase 4: Advanced AI** 🔮
- **Multi-Agent Coordination**: Multiple AI agents working together
- **Federated Learning**: Distributed AI training
- **Custom Models**: Specialized blockchain AI models
- **Predictive Analytics**: Market and trend analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Development Guidelines

- Follow existing code style and patterns
- Add comprehensive error handling
- Include logging for new features
- Write tests for new functionality
- Update documentation for new features

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support or questions:

- **Documentation**: [CARV Documentation](https://docs.carv.io)

## 🙏 Acknowledgments

- Built for the CARV SVM Chain ecosystem
- Powered by OpenAI-compatible AI services
- Integrated with CARV API for real-time news and data
- Community-driven development and feedback

---

**Built with ❤️ for the CARV ecosystem** 
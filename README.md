# CarV AI Telegram Bot

🤖 An AI-powered Telegram bot for the CARV SVM Chain ecosystem, built for the CARV hackathon.

## Features

- **AI-Powered Conversations**: Chat with an AI assistant specialized in CARV SVM Chain and blockchain topics
- **Conversation Memory**: The bot remembers your conversation context
- **Rate Limiting**: Prevents spam and abuse
- **Multiple AI Providers**: Compatible with any OpenAI-compatible API
- **Comprehensive Logging**: Structured logging with Winston
- **Error Handling**: Robust error handling and graceful shutdown

## Commands

- `/start` - Start the bot and get welcome message
- `/help` - Show help message and available commands
- `/clear` - Clear conversation history
- `/stats` - Show your usage statistics
- `/about` - Learn more about CARV SVM Chain

## Quick Start

### 1. Prerequisites

- Node.js 16+ installed
- Telegram Bot Token (get from [@BotFather](https://t.me/botfather))
- OpenAI API Key (or compatible AI service)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd carv-ai-telegram-bot

# Install dependencies
npm install
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
```

### 4. Running the Bot

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Configuration Options

### AI Service Configuration

The bot is compatible with any OpenAI-compatible API. You can configure:

- **OpenAI**: Default configuration
- **Anthropic Claude**: Use Claude API
- **Custom Endpoints**: Any OpenAI-compatible service
- **Local Models**: Self-hosted models

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

## Architecture

```
src/
├── config/
│   └── config.js          # Configuration management
├── services/
│   └── aiService.js       # AI service integration
├── handlers/
│   └── messageHandler.js  # Message handling logic
├── utils/
│   ├── logger.js          # Logging utility
│   └── rateLimiter.js     # Rate limiting
└── index.js               # Main application entry
```

## Features in Detail

### AI Integration

- **Conversation Memory**: Maintains context across messages
- **System Prompts**: Specialized prompts for CARV SVM Chain topics
- **Error Handling**: Graceful handling of AI service errors
- **Multiple Providers**: Easy switching between AI services

### Telegram Bot Features

- **Command Handling**: Built-in commands for bot management
- **Message Splitting**: Handles long responses automatically
- **Typing Indicators**: Shows when AI is processing
- **Error Recovery**: Graceful error handling

### Security & Performance

- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: Validates all user inputs
- **Memory Management**: Automatic cleanup of old data
- **Graceful Shutdown**: Proper cleanup on exit

## Development

### Project Structure

```
├── src/                   # Source code
│   ├── config/           # Configuration
│   ├── services/         # External services
│   ├── handlers/         # Message handlers
│   └── utils/           # Utilities
├── logs/                # Log files
├── tests/              # Test files
├── package.json         # Dependencies
├── env.example         # Environment template
└── README.md          # This file
```

### Adding New Commands

1. Add command logic in `src/handlers/messageHandler.js`
2. Update command list in `src/index.js`
3. Update help message

### Adding New AI Features

1. Extend `src/services/aiService.js`
2. Add new methods for specific AI capabilities
3. Update message handler to use new features

## Deployment

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions about CARV SVM Chain:

- [CARV Documentation](https://docs.carv.io)
- [CARV Community](https://t.me/carvcommunity)
- [GitHub Issues](https://github.com/your-repo/issues)

---

Built with ❤️ for the CARV hackathon - AI × Web3 for Real-World Use Cases 
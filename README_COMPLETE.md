# HCV Training System - Complete Voice + Visual Integration

This is a complete HCV (Housing Choice Voucher) training system that combines a LiveKit voice agent with real-time visual slides. The system provides interactive voice conversations with automatic slide generation for enhanced learning.

## 🎯 What You Get

- 🎤 **LiveKit Voice Agent**: Real-time voice conversations with Cartesia TTS
- 📊 **Dynamic Visual Slides**: Automatic slide generation with charts, processes, and content
- 🔄 **Real-time Integration**: Slides update automatically as the agent speaks
- 🎯 **Structured Lessons**: 7 comprehensive HCV training modules
- 🖥️ **Modern Web Interface**: Responsive LiveKit client with slide display
- ☁️ **LiveKit Cloud Ready**: Easy deployment to LiveKit Cloud

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\DevE\chatHCV3\agent-starter-node
pnpm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file:
```env
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Required: LiveKit Cloud Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Optional: Web Interface URL (for slide updates)
WEB_INTERFACE_URL=http://localhost:3000

# Optional: Cartesia API Key (if using Cartesia TTS)
CARTESIA_API_KEY=your_cartesia_api_key
```

### 3. Start the Complete System
```bash
pnpm run complete-system
```

### 4. Access the Interface
- Open http://localhost:3000/livekit in your browser
- Click "Connect to LiveKit Agent"
- Select a lesson and start learning!

## 🎮 How It Works

### Voice + Visual Integration
1. **Agent Speaks**: Uses Cartesia TTS for natural voice responses
2. **Slides Generate**: Agent automatically creates visual slides
3. **Real-time Updates**: Slides appear instantly in the web interface
4. **Synchronized Learning**: Voice and visuals work together seamlessly

### Available Commands

- `pnpm run complete-system` - Start everything (agent + visual interface)
- `pnpm run enhanced-agent` - Start only the enhanced LiveKit agent
- `pnpm run socketio-server` - Start only the visual interface server
- `pnpm run deploy` - Deploy agent to LiveKit Cloud

## 🎯 LiveKit Cloud Deployment

### 1. Set Up LiveKit Cloud
1. Go to https://cloud.livekit.io/
2. Create a new project
3. Get your project URL, API Key, and API Secret

### 2. Deploy Your Agent
```bash
# Install LiveKit CLI
npm install -g @livekit/cli

# Login to LiveKit Cloud
livekit-cli login

# Deploy your agent
pnpm run deploy
```

### 3. Update Environment Variables
Update your `.env.local` with production values:
```env
LIVEKIT_URL=wss://your-production-project.livekit.cloud
LIVEKIT_API_KEY=your_production_api_key
LIVEKIT_API_SECRET=your_production_api_secret
WEB_INTERFACE_URL=https://your-domain.com
```

## 📚 Lesson Modules

1. **Welcome to HCV Training** - Introduction and overview
2. **HCV Eligibility Requirements** - Income limits and qualifications
3. **Application Process** - How to apply for assistance
4. **Income and Asset Calculations** - Understanding HCV math
5. **Payment Standards and Rent** - Rent calculation methods
6. **Voucher Process** - Using your HCV voucher
7. **Tenant Rights and Responsibilities** - Legal obligations and protections

## 🎨 Visual Features

### Slide Types
- **Title Slides**: Lesson overview with key points
- **Content Slides**: Detailed bullet points and information
- **Chart Slides**: Data visualizations (income limits, etc.)
- **Process Slides**: Step-by-step workflows

### Real-time Updates
- Slides generate automatically when starting lessons
- Visual content updates as you progress through topics
- Agent messages appear in real-time
- Socket.IO enables instant communication

## 🔧 System Architecture

### Components

1. **Enhanced LiveKit Agent** (`src/agent-enhanced.ts`)
   - Voice AI with OpenAI GPT-4
   - Cartesia TTS for natural speech
   - Automatic slide generation
   - Real-time web interface communication

2. **LiveKit Client** (`public/livekit-client.html`)
   - Modern web interface
   - Real-time slide display
   - Socket.IO integration
   - Lesson navigation controls

3. **Socket.IO Server** (`server-socketio.js`)
   - Real-time communication
   - Slide update broadcasting
   - Agent message handling
   - Room management

4. **Slide Generator** (`src/slide-generator.ts`)
   - HTML-based slide generation
   - Multiple slide types
   - Professional styling
   - Responsive design

## 🎤 Voice Interaction

The agent provides:
- Natural voice responses using Cartesia TTS
- Structured lesson progression
- Interactive Q&A capabilities
- HCV-specific knowledge and tools
- Automatic slide generation during conversations

## 🔄 Real-time Features

### Automatic Slide Updates
- Agent generates slides when starting lessons
- Slides update as you progress through topics
- Different slide types for different content
- Real-time synchronization with voice

### Socket.IO Communication
- Instant slide updates
- Agent message broadcasting
- Room-based communication
- Connection status monitoring

## 🛠️ Development

### Project Structure
```
agent-starter-node/
├── src/
│   ├── agent-enhanced.ts      # Enhanced LiveKit agent
│   ├── slide-generator.ts     # Slide generation logic
│   └── agent.ts              # Original agent
├── public/
│   ├── livekit-client.html   # LiveKit client interface
│   └── index.html            # Basic visual interface
├── server-socketio.js        # Socket.IO server
├── start-complete-system.js  # Complete system startup
├── LIVEKIT_DEPLOYMENT.md     # Deployment guide
└── package.json             # Dependencies and scripts
```

### Adding New Features
1. Modify `src/agent-enhanced.ts` for agent changes
2. Update `public/livekit-client.html` for UI changes
3. Extend `src/slide-generator.ts` for new slide types
4. Test with `pnpm run complete-system`

## 🐛 Troubleshooting

### Common Issues

1. **Agent Won't Connect**
   - Check LIVEKIT_URL format (should start with wss://)
   - Verify API keys in `.env.local`
   - Check agent logs

2. **Slides Not Updating**
   - Ensure Socket.IO server is running
   - Check WEB_INTERFACE_URL in agent environment
   - Verify browser console for errors

3. **Voice Issues**
   - Check OpenAI API key
   - Verify Cartesia API key (if using Cartesia TTS)
   - Test with different browsers

### Debug Mode
```bash
# Run individual components
pnpm run enhanced-agent    # Agent only
pnpm run socketio-server   # Visual interface only
```

## 📊 Performance

### Optimization Tips
1. **Agent Scaling**: Configure auto-scaling in LiveKit Cloud
2. **Resource Limits**: Set appropriate CPU/memory limits
3. **Monitoring**: Use LiveKit Cloud metrics dashboard
4. **Caching**: Implement slide caching for better performance

## 🔒 Security

### Best Practices
1. **API Keys**: Never commit to version control
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly
4. **Rate Limiting**: Implement API rate limiting

## 💰 Cost Optimization

1. **Agent Scaling**: Configure auto-scaling
2. **Resource Limits**: Set appropriate limits
3. **Monitoring**: Monitor usage and costs
4. **Efficient Slides**: Optimize slide generation

## 🎉 Success!

You now have a complete HCV training system with:
- ✅ LiveKit voice agent with Cartesia TTS
- ✅ Real-time visual slide generation
- ✅ Automatic slide updates during conversations
- ✅ Modern web interface with Socket.IO
- ✅ LiveKit Cloud deployment ready
- ✅ 7 comprehensive HCV lesson modules

**Start learning with voice + visual slides!** 🎤📊

---

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review LiveKit documentation
- Check agent logs in LiveKit Cloud dashboard
- Open an issue in the repository

**Happy HCV Training!** 🏠📚

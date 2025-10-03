# LiveKit Cloud Deployment Configuration for HCV Training Agent

## Environment Variables (.env.local)
```env
# OpenAI API Key (required for LLM)
OPENAI_API_KEY=your_openai_api_key_here

# LiveKit Cloud Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Web Interface URL (for slide updates)
WEB_INTERFACE_URL=http://localhost:3000

# Optional: Cartesia API Key (if using Cartesia TTS)
CARTESIA_API_KEY=your_cartesia_api_key
```

## LiveKit Cloud Setup Steps

### 1. Create LiveKit Cloud Project
1. Go to https://cloud.livekit.io/
2. Sign up/Login to your account
3. Create a new project
4. Note down your project URL, API Key, and API Secret

### 2. Configure Environment Variables
1. Copy the `.env.local` template above
2. Replace the placeholder values with your actual API keys
3. Save the file in your project root

### 3. Deploy Agent to LiveKit Cloud

#### Option A: Using LiveKit CLI (Recommended)
```bash
# Install LiveKit CLI
npm install -g @livekit/cli

# Login to LiveKit Cloud
livekit-cli login

# Deploy your agent
livekit-cli deploy --source . --name hcv-training-agent
```

#### Option B: Using Docker
```bash
# Build Docker image
docker build -t hcv-training-agent .

# Tag for LiveKit Cloud
docker tag hcv-training-agent your-registry/hcv-training-agent

# Push to registry
docker push your-registry/hcv-training-agent

# Deploy via LiveKit Cloud dashboard
```

### 4. Start Web Interface
```bash
# Start the visual interface server
pnpm run visual

# Or start with Socket.IO support
node server-socketio.js
```

### 5. Connect to Your Agent
1. Open http://localhost:3000/livekit in your browser
2. Click "Connect to LiveKit Agent"
3. The system will connect to your deployed agent
4. Start a lesson and see real-time slides!

## Testing the Integration

### 1. Test Voice Agent
- Deploy agent to LiveKit Cloud
- Connect via LiveKit client
- Verify voice responses work

### 2. Test Visual Slides
- Start web interface server
- Connect to agent
- Request slides and verify they display

### 3. Test Real-time Updates
- Start lesson in agent
- Verify slides update automatically
- Check Socket.IO communication

## Troubleshooting

### Agent Won't Connect
- Check LIVEKIT_URL format (should start with wss://)
- Verify API keys are correct
- Check agent logs in LiveKit Cloud dashboard

### Slides Not Updating
- Ensure web interface server is running
- Check WEB_INTERFACE_URL in agent environment
- Verify Socket.IO connection

### Voice Issues
- Check OpenAI API key
- Verify Cartesia API key (if using Cartesia TTS)
- Test with different browsers

## Production Deployment

### 1. Use Production Environment Variables
```env
# Production LiveKit Cloud
LIVEKIT_URL=wss://your-production-project.livekit.cloud
LIVEKIT_API_KEY=your_production_api_key
LIVEKIT_API_SECRET=your_production_api_secret

# Production Web Interface
WEB_INTERFACE_URL=https://your-domain.com
```

### 2. Deploy Web Interface
- Deploy to Vercel, Netlify, or your preferred hosting
- Update WEB_INTERFACE_URL in agent environment
- Ensure HTTPS for production

### 3. Monitor Performance
- Use LiveKit Cloud metrics dashboard
- Monitor agent performance
- Check web interface logs

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly for production
4. **Rate Limiting**: Implement rate limiting for API endpoints

## Cost Optimization

1. **Agent Scaling**: Configure auto-scaling in LiveKit Cloud
2. **Resource Limits**: Set appropriate CPU/memory limits
3. **Monitoring**: Monitor usage and costs in LiveKit dashboard

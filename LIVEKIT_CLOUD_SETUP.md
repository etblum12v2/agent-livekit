# LiveKit Cloud Setup Guide

## Step 1: Create LiveKit Cloud Account

1. Go to https://cloud.livekit.io/
2. Sign up or login
3. Click "Create Project"
4. Name it "HCV Training Agent"
5. Choose a region close to you

## Step 2: Get Your Credentials

From your LiveKit Cloud project dashboard, copy these values:

- **Project URL**: `wss://your-project-name.livekit.cloud`
- **API Key**: Starts with `API` followed by letters/numbers
- **API Secret**: Long string of letters/numbers

## Step 3: Create .env.local File

Create a file called `.env.local` in your project directory with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# LiveKit Cloud Configuration
LIVEKIT_URL=wss://your-project-name.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here

# Web Interface URL
WEB_INTERFACE_URL=http://localhost:3000
```

## Step 4: Test the System

1. Start the visual interface:
   ```bash
   pnpm run socketio-server
   ```

2. In another terminal, start the agent:
   ```bash
   pnpm run enhanced-agent
   ```

3. Open http://localhost:3000/livekit in your browser

## Step 5: Deploy to LiveKit Cloud

1. Install LiveKit CLI:
   ```bash
   npm install -g @livekit/cli
   ```

2. Login to LiveKit Cloud:
   ```bash
   livekit-cli login
   ```

3. Deploy your agent:
   ```bash
   pnpm run deploy
   ```

## What's Different from Sandbox?

- **Sandbox**: Limited testing environment, no real deployment
- **LiveKit Cloud**: Full production environment with:
  - Real voice agents
  - Scalable infrastructure
  - Production-ready features
  - Custom domains
  - Analytics and monitoring

## Troubleshooting

- **Connection Issues**: Check your LIVEKIT_URL format (must start with wss://)
- **API Errors**: Verify your API keys are correct
- **Agent Not Starting**: Check the agent logs in LiveKit Cloud dashboard

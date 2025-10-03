# HCV Training System with Visual Interface

This is a complete HCV (Housing Choice Voucher) training system that combines a LiveKit voice agent with dynamic visual slides. The system provides interactive voice conversations with real-time slide generation for enhanced learning.

## Features

- 🎤 **Voice Agent**: LiveKit-powered AI agent with Cartesia TTS
- 📊 **Dynamic Slides**: Real-time slide generation with charts, processes, and content
- 🎯 **Structured Lessons**: 7 comprehensive HCV training modules
- 🖥️ **Web Interface**: Modern, responsive web interface for slide display
- 🔄 **Real-time Updates**: Slides update as you progress through lessons

## Quick Start

### Prerequisites

- Node.js 22+ 
- pnpm 10+
- LiveKit Cloud account (for voice features)

### Installation

1. **Install dependencies:**
   ```bash
pnpm install
```

2. **Set up environment variables:**
   Create a `.env.local` file with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_key
   LIVEKIT_URL=your_livekit_url
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   ```

3. **Start the complete system:**
```bash
   pnpm run full-system
   ```

4. **Access the interface:**
   - Open http://localhost:3000 in your browser
   - Select a lesson from the dropdown
   - Click "Connect to Agent" to start voice interaction
   - Use "Generate Slide" to create visual content

## Available Scripts

- `pnpm run full-system` - Start both agent and visual interface
- `pnpm run visual` - Start only the visual web interface
- `pnpm run dev` - Start only the LiveKit agent
- `pnpm run build` - Build the TypeScript agent
- `pnpm run test` - Run tests

## System Architecture

### Components

1. **LiveKit Agent** (`src/agent.ts`)
   - Voice AI powered by OpenAI GPT-4
   - Cartesia TTS for natural speech
   - Structured HCV lesson system
   - Slide generation tools

2. **Visual Interface** (`public/index.html`)
   - Modern web interface
   - Real-time slide display
   - Lesson navigation
   - Connection management

3. **Web Server** (`server.js`)
   - Express.js server
   - API endpoints for slide data
   - Static file serving

4. **Slide Generator** (`src/slide-generator.ts`)
   - HTML-based slide generation
   - Multiple slide types (title, content, chart, process)
   - Responsive design

### Lesson Modules

1. **Welcome to HCV Training** - Introduction and overview
2. **HCV Eligibility Requirements** - Income limits and qualifications
3. **Application Process** - How to apply for assistance
4. **Income and Asset Calculations** - Understanding HCV math
5. **Payment Standards and Rent** - Rent calculation methods
6. **Voucher Process** - Using your HCV voucher
7. **Tenant Rights and Responsibilities** - Legal obligations and protections

## Usage Guide

### Basic Workflow

1. **Start the System**
   ```bash
   pnpm run full-system
   ```

2. **Open Web Interface**
   - Navigate to http://localhost:3000
   - You'll see the visual interface with lesson controls

3. **Select a Lesson**
   - Choose from the dropdown menu
   - Each lesson has structured topics

4. **Connect to Agent**
   - Click "Connect to Agent" 
   - The system will establish voice connection

5. **Generate Slides**
   - Click "Generate Slide" to create visual content
   - Slides will display in the main panel
   - Different slide types: title, content, chart, process

6. **Navigate Topics**
   - Use "Next Topic" to progress through lesson content
   - Each topic can generate its own slide

### Slide Types

- **Title Slides**: Lesson overview with key points
- **Content Slides**: Detailed bullet points and information
- **Chart Slides**: Data visualizations (income limits, etc.)
- **Process Slides**: Step-by-step workflows

### Voice Interaction

The agent provides:
- Natural voice responses using Cartesia TTS
- Structured lesson progression
- Interactive Q&A capabilities
- HCV-specific knowledge and tools

## Development

### Project Structure

```
agent-starter-node/
├── src/
│   ├── agent.ts              # Main LiveKit agent
│   ├── slide-generator.ts    # Slide generation logic
│   └── agent.test.ts         # Tests
├── public/
│   └── index.html           # Visual web interface
├── server.js                # Express web server
├── start-visual-system.js   # System startup script
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### Adding New Lessons

1. Update lesson data in `src/agent.ts`
2. Add lesson content in `server.js`
3. Update the web interface dropdown
4. Test slide generation for new content

### Customizing Slides

Modify `src/slide-generator.ts` to:
- Change slide styling and colors
- Add new slide types
- Customize layouts and animations
- Integrate with external charting libraries

## Troubleshooting

### Common Issues

1. **Agent won't connect**
   - Check LiveKit credentials in `.env.local`
   - Ensure LiveKit Cloud account is active
   - Verify network connectivity

2. **Slides not displaying**
   - Check browser console for errors
   - Ensure web server is running on port 3000
   - Try refreshing the page

3. **Voice not working**
   - Check microphone permissions
   - Verify Cartesia API key
   - Test with different browsers

### Debug Mode

Run individual components for debugging:
```bash
# Visual interface only
pnpm run visual

# Agent only  
pnpm run dev
```

## API Reference

### Web Server Endpoints

- `GET /` - Main visual interface
- `GET /api/lessons` - Get all available lessons
- `GET /api/lesson/:lesson` - Get specific lesson data
- `GET /api/slide/:lesson/:type` - Generate slide data

### Agent Tools

The agent includes these tools:
- `checkEligibility` - Check HCV eligibility
- `calculateRent` - Calculate rent amounts
- `explainHCVTerm` - Explain HCV terminology
- `startLesson` - Begin a lesson
- `nextTopic` - Progress to next topic
- `generateSlide` - Create visual slide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review LiveKit documentation
- Open an issue in the repository

---

**Happy HCV Training! 🏠📚**
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store active connections
const activeConnections = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);
  
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    activeConnections.set(socket.id, { roomName, connected: true });
    console.log(`🏠 Client ${socket.id} joined room: ${roomName}`);
    
    // Send welcome message
    socket.emit('agent-message', {
      type: 'welcome',
      message: 'Welcome to HCV Training! I\'m your AI assistant. Let\'s start learning about Housing Choice Vouchers.',
      timestamp: Date.now()
    });
  });

  socket.on('request-slide', (data) => {
    const { lesson, topic, slideType } = data;
    console.log(`📊 Slide requested: ${lesson} - ${topic} (${slideType})`);
    
    // Generate slide data
    const slideData = generateSlideData(lesson, topic, slideType);
    
    // Send slide to client
    socket.emit('slide-update', {
      type: 'slide-generated',
      slideData,
      timestamp: Date.now()
    });
  });

  socket.on('start-lesson', (data) => {
    const { lesson } = data;
    console.log(`📚 Lesson started: ${lesson}`);
    
    // Send lesson start confirmation
    socket.emit('agent-message', {
      type: 'lesson-started',
      message: `Great! Let's begin the ${getLessonTitle(lesson)} lesson. I'll be showing you visual slides as we go through each topic.`,
      lesson,
      timestamp: Date.now()
    });
  });

  socket.on('next-topic', (data) => {
    const { lesson, currentTopic } = data;
    console.log(`➡️ Next topic requested for: ${lesson}`);
    
    // Send topic progression
    socket.emit('agent-message', {
      type: 'topic-progress',
      message: `Moving to the next topic in ${getLessonTitle(lesson)}. Let me explain this in detail...`,
      lesson,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log(`📱 Client disconnected: ${socket.id}`);
    activeConnections.delete(socket.id);
  });
});

// API endpoint to get slide data
app.get('/api/slide/:lesson/:type', (req, res) => {
  const { lesson, type } = req.params;
  
  try {
    const slideData = generateSlideData(lesson, type);
    res.json(slideData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get lesson information
app.get('/api/lesson/:lesson', (req, res) => {
  const { lesson } = req.params;
  
  try {
    const lessonData = getLessonData(lesson);
    res.json(lessonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get all available lessons
app.get('/api/lessons', (req, res) => {
  try {
    const lessons = getAllLessons();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for LiveKit agent to send slide updates
app.post('/api/agent/slide-update', (req, res) => {
  const { roomName, slideData } = req.body;
  
  try {
    console.log(`📊 Agent sending slide update to room: ${roomName}`);
    
    // Broadcast slide update to all clients in the room
    io.to(roomName).emit('slide-update', {
      type: 'agent-slide',
      slideData,
      timestamp: Date.now()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting slide update:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for LiveKit agent to send messages
app.post('/api/agent/message', (req, res) => {
  const { roomName, message, type = 'agent-speech' } = req.body;
  
  try {
    console.log(`💬 Agent sending message to room: ${roomName}`);
    
    // Broadcast message to all clients in the room
    io.to(roomName).emit('agent-message', {
      type,
      message,
      timestamp: Date.now()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the LiveKit client interface
app.get('/livekit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'livekit-client.html'));
});

// Serve the main interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function generateSlideData(lesson, type, topic = null) {
  const lessonData = getLessonData(lesson);
  
  const slideData = {
    type: type,
    title: lessonData.title,
    content: lessonData.topics.slice(0, 4),
    timestamp: Date.now()
  };

  if (type === 'chart') {
    slideData.chartData = [
      { label: 'Family of 1', value: 35000 },
      { label: 'Family of 2', value: 40000 },
      { label: 'Family of 3', value: 45000 },
      { label: 'Family of 4', value: 50000 }
    ];
  }

  if (type === 'process') {
    slideData.processSteps = lessonData.topics.slice(0, 5);
  }

  return slideData;
}

function getLessonData(lessonKey) {
  const lessons = {
    'welcome': {
      title: 'Welcome to HCV Training',
      description: 'Introduction to Housing Choice Voucher program',
      topics: [
        'What is HCV and why it exists',
        'Who administers the program',
        'Basic program overview'
      ]
    },
    'eligibility': {
      title: 'HCV Eligibility Requirements',
      description: 'Understanding who qualifies for HCV assistance',
      topics: [
        'Income limits and calculations',
        'Family composition requirements',
        'Citizenship and immigration status',
        'Background check requirements'
      ]
    },
    'application': {
      title: 'Application Process',
      description: 'How to apply for HCV assistance',
      topics: [
        'Finding your local PHA',
        'Required documents',
        'Waiting list process',
        'Application timeline'
      ]
    },
    'income': {
      title: 'Income and Asset Calculations',
      description: 'Understanding HCV income calculations',
      topics: [
        'Annual income definition',
        'Asset calculations',
        'Income exclusions',
        'Reporting requirements'
      ]
    },
    'payment': {
      title: 'Payment Standards and Rent',
      description: 'How HCV rent calculations work',
      topics: [
        'Payment standards',
        'Utility allowances',
        'Rent calculation methods',
        'Minimum rent requirements'
      ]
    },
    'voucher': {
      title: 'Voucher Process',
      description: 'Using your HCV voucher',
      topics: [
        'Voucher issuance',
        'Housing search process',
        'HQS inspections',
        'Lease requirements'
      ]
    },
    'rights': {
      title: 'Tenant Rights and Responsibilities',
      description: 'Understanding your HCV obligations',
      topics: [
        'Tenant responsibilities',
        'Landlord obligations',
        'Program violations',
        'Appeal processes'
      ]
    }
  };
  
  return lessons[lessonKey] || { title: lessonKey, description: '', topics: [] };
}

function getLessonTitle(lessonKey) {
  const lessonData = getLessonData(lessonKey);
  return lessonData.title;
}

function getAllLessons() {
  return {
    'welcome': getLessonData('welcome'),
    'eligibility': getLessonData('eligibility'),
    'application': getLessonData('application'),
    'income': getLessonData('income'),
    'payment': getLessonData('payment'),
    'voucher': getLessonData('voucher'),
    'rights': getLessonData('rights')
  };
}

server.listen(PORT, () => {
  console.log(`🚀 HCV Training Visual Interface running on http://localhost:${PORT}`);
  console.log(`📚 Visual slides available for all HCV lessons`);
  console.log(`🎤 Socket.IO server ready for LiveKit agent integration`);
  console.log(`🔗 LiveKit Client: http://localhost:${PORT}/livekit`);
  console.log(`🔗 Agent API: http://localhost:${PORT}/api/agent/slide-update`);
});

export default app;

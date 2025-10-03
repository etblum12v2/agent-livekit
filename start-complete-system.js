#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting HCV Training System with LiveKit Agent + Visual Interface...');
console.log('');

// Start the Socket.IO web server
console.log('1️⃣ Starting Visual Web Interface with Socket.IO...');
const serverProcess = spawn('node', ['server-socketio.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

// Wait a moment for server to start
setTimeout(() => {
    console.log('');
    console.log('2️⃣ Starting Enhanced LiveKit Agent...');
    
    // Start the enhanced LiveKit agent
    const agentProcess = spawn('pnpm', ['run', 'enhanced-agent'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    // Handle process cleanup
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down HCV Training System...');
        serverProcess.kill();
        agentProcess.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down HCV Training System...');
        serverProcess.kill();
        agentProcess.kill();
        process.exit(0);
    });

}, 3000);

console.log('');
console.log('🎉 HCV Training System Starting!');
console.log('');
console.log('📋 Access Points:');
console.log('   Visual Interface: http://localhost:3000');
console.log('   LiveKit Client: http://localhost:3000/livekit');
console.log('   Enhanced Agent: Running with slide updates');
console.log('');
console.log('📚 Instructions:');
console.log('1. Open http://localhost:3000/livekit in your browser');
console.log('2. Click "Connect to LiveKit Agent"');
console.log('3. Select a lesson from the dropdown');
console.log('4. Click "Start Lesson" to begin');
console.log('5. The agent will speak AND show visual slides!');
console.log('');
console.log('🔧 For LiveKit Cloud Deployment:');
console.log('1. Set up your .env.local with LiveKit Cloud credentials');
console.log('2. Run: pnpm run deploy');
console.log('3. Update WEB_INTERFACE_URL in agent environment');
console.log('');
console.log('❌ To stop: Press Ctrl+C');
console.log('');
console.log('🎤 Enjoy your HCV training with voice + visual slides!');

#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting HCV Training System with Visual Interface...');
console.log('');

// Start the visual web server
console.log('1️⃣ Starting Visual Web Interface...');
const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

// Wait a moment for server to start
setTimeout(() => {
    console.log('');
    console.log('2️⃣ Starting LiveKit Agent...');
    
    // Start the LiveKit agent
    const agentProcess = spawn('pnpm', ['run', 'dev'], {
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

}, 2000);

console.log('');
console.log('🎉 HCV Training System Starting!');
console.log('');
console.log('📋 Access Points:');
console.log('   Visual Interface: http://localhost:3000');
console.log('   LiveKit Agent: Running in console');
console.log('');
console.log('📚 Instructions:');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Select a lesson from the dropdown');
console.log('3. Click "Connect to Agent" to start');
console.log('4. Use "Generate Slide" to create visual content');
console.log('5. The agent will provide voice responses while slides display');
console.log('');
console.log('❌ To stop: Press Ctrl+C');
console.log('');
console.log('🎤 Enjoy your HCV training with visual slides!');

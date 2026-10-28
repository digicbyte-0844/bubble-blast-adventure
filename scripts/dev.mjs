import { spawn } from 'child_process';

console.log('🚀 Starting Bubble Blast Adventure Full-Stack Environment...\n');

// 1. Start Backend API Server
const server = spawn('npm', ['run', 'dev'], {
  cwd: './server',
  shell: true,
  stdio: 'inherit'
});

// 2. Start Frontend Vite Dev Server
const client = spawn('npm', ['run', 'dev'], {
  cwd: './client',
  shell: true,
  stdio: 'inherit'
});

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

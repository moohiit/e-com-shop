import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { setupSocket } from './config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  setupSocket(server, app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

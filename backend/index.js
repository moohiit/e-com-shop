import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import path from 'path';
import express from 'express';

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

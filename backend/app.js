import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }))
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
}
app.use(cors(corsOptions));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// Import and use the auth routes
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
export default app;
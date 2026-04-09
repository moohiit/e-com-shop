import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }))
const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}
app.use(cors(corsOptions));
app.use(cookieParser());

// Rate limiters — protect auth/OTP from brute force and abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Try again later." },
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Try again later." },
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// Import and use the auth routes (with brute-force protection)
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);
app.use('/api/auth/reset-password', otpLimiter);
app.use('/api/auth/resend-verification', otpLimiter);
app.use('/api/auth', authRoutes);
// Import and use the admin routes
import adminRoutes from './routes/adminRoutes.js';
app.use('/api/admin', adminRoutes);
// Import and use the category routes
import categoryRoutes from './routes/categoryRoutes.js';
app.use('/api/category', categoryRoutes);
// Import and use the product routes
import productRoutes from './routes/productRoutes.js';
app.use('/api/product', productRoutes);
// Import and use the user routes
import userRoutes from './routes/userRoutes.js';
app.use('/api/user', userRoutes);
// Import and use the image upload routes
import uploadRoutes from './routes/uploadRoutes.js';
app.use('/api/upload', uploadRoutes);
// Import and use the address routes
import addressRoutes from './routes/addressRoutes.js';
app.use('/api/addresses', addressRoutes);
// Import and use the order routes
import orderRoutes from './routes/orderRoutes.js';
app.use('/api/orders', orderRoutes);
// Import and use the seller order routes
import sellerOrderRoutes from './routes/sellerOrderRoutes.js';
app.use('/api/seller-orders', sellerOrderRoutes);
// Import and use the transaction routes
import transactionRoutes from './routes/transactionRoutes.js';
app.use('/api/transactions', transactionRoutes);
// Import and use the review routes
import reviewRoutes from './routes/reviewRoutes.js';
app.use('/api/reviews', reviewRoutes);
// Import and use the return routes
import returnRoutes from './routes/returnRoutes.js';
app.use('/api/returns', returnRoutes);
// Import and use the wishlist routes
import wishlistRoutes from './routes/wishlistRoutes.js';
app.use('/api/wishlist', wishlistRoutes);
// Import and use the cart routes
import cartRoutes from './routes/cartRoutes.js';
app.use('/api/cart', cartRoutes);
// Import and use the seller application routes
import sellerApplicationRoutes from './routes/sellerApplicationRoutes.js';
app.use('/api/seller-applications', sellerApplicationRoutes);
// Import and use the chat routes
import chatRoutes from './routes/chatRoutes.js';
app.use('/api/chat', chatRoutes);

export default app;
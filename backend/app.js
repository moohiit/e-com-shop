import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }))
const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://192.168.0.120:5173', 'http://172.16.1.54:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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

export default app;
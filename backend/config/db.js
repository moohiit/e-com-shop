import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined in the environment variables');
        process.exit(1);
    }
    if (mongoose.connection.readyState) {
        console.log('MongoDB is already connected');
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
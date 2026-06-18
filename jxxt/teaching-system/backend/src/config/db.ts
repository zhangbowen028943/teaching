import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/teaching-system',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions
    );
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
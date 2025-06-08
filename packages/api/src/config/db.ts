import mongoose from 'mongoose';
import { config } from './index';

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.uri);
    console.log('MongoDB connected successfully');
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Add event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
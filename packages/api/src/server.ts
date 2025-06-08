import { config } from './config';
import app from './app';
import mongoose from 'mongoose';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
mongoose
  .connect(config.database.uri)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    const server = app.listen(config.server.port, () => {
      console.log(`Server running in ${config.server.environment} mode on port ${config.server.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
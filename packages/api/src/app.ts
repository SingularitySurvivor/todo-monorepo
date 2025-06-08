import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import routes from './routes';
import { errorHandler, requestLogger } from './middlewares';

// Initialize express app
const app: Express = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo App API',
      version: '1.0.0',
      description: 'A comprehensive todo management API with lists, todos, and user management',
      contact: {
        name: 'Todo App API Support',
        email: 'support@todoapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/docs/*.ts'], // Point to documentation files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Apply middlewares
// Security headers
app.use(helmet());

// CORS Configuration
if (config.cors && config.cors.origins) {
  // Use the configured origins
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    })
  );
} else {
  // If no specific origins are configured, allow localhost:3000 explicitly
  console.log('CORS: Allowing localhost:3001');
  app.use(
    cors({
      origin: ['http://localhost:3001', 'https://localhost:3001'],
      credentials: true,
    })
  );
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.server && config.server.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logger middleware
app.use(requestLogger);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    environment: config.server ? config.server.environment : 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Swagger UI - serve documentation at /api-docs
if (config.server && config.server.isDevelopment) {
  app.use('/api-docs', swaggerUi.serve as any);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec) as any);
  
  // Serve raw OpenAPI spec as JSON
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// API routes
app.use('/api', routes);

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
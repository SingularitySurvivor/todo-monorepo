import { env } from './env';

export const config = {
  server: {
    port: env.port,
    environment: env.nodeEnv,
    isProduction: env.nodeEnv === 'production',
    isDevelopment: env.nodeEnv === 'development',
    isTest: env.nodeEnv === 'test',
  },
  database: {
    uri: env.nodeEnv === 'test' ? env.mongodbTestUri : env.mongodbUri,
  },
  cors: {
    origins: env.corsOrigins,
  },
  rateLimit: {
    max: env.rateLimitMax,
    windowMs: env.rateLimitWindowMs,
  },
  logging: {
    level: env.logLevel,
  },
  jwt: {
    secret: env.jwtSecret,
    expiresIn: env.jwtExpiresIn,
  },
};
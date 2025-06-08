import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl } = req;
  
  // Log request
  console.log(`[REQUEST] ${method} ${originalUrl}`);
  
  // After response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log response
    console.log(
      `[RESPONSE] ${method} ${originalUrl} ${statusCode} [${duration}ms]`
    );
  });
  
  next();
};
import { Response } from 'express';
import { param, validationResult } from 'express-validator';
import { asyncHandler, ApiError } from '../utils';
import { AuthRequest } from '../middlewares/auth';
import { sseService } from '../services/sseService';
import { v4 as uuidv4 } from 'uuid';


/**
 * Subscribe to user-global real-time updates (all lists for the user)
 */
export const subscribeToUserEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const clientId = uuidv4();

  console.log(`SSE: User ${userId} attempting to subscribe to user-global events`);

  try {
    await sseService.addUserClient(clientId, userId, res);
    console.log(`SSE: Successfully added user-global client ${clientId} for user ${userId}`);
  } catch (error) {
    console.error(`SSE: Failed to add user-global client for user ${userId}:`, error);
    throw error;
  }
});

/**
 * Get SSE connection status and statistics
 */
export const getSSEStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activeClients = sseService.getActiveClientsCount();
  
  res.status(200).json({
    status: 'success',
    data: {
      activeClients,
      timestamp: new Date(),
    },
  });
});
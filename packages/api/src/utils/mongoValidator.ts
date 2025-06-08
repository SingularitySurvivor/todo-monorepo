import { Types } from 'mongoose';
import { ApiError } from './ApiError';

export class MongoValidator {
  static validateObjectIds(...ids: string[]): void {
    const invalid = ids.find(id => !Types.ObjectId.isValid(id));
    if (invalid) {
      throw ApiError.badRequest(`Invalid ID format: ${invalid}`);
    }
  }
}
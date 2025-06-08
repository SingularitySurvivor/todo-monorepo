import { Document } from 'mongoose';
import { IUser } from '../types';

export class UserTransformer {
  static toSafeUser(user: IUser | Document): any {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, _id, __v, ...userWithoutPassword } = userObj;
    return { 
      ...userWithoutPassword, 
      id: _id.toString() 
    };
  }
}
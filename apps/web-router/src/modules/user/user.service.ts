/**
 * User Service
 */

import { injectable } from '@nesvel/reactjs-di';

export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface IUserService {
  getAll(): Promise<IUser[]>;
  getById(id: string): Promise<IUser | null>;
}

@injectable()
export class UserService implements IUserService {
  private users: IUser[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  async getAll(): Promise<IUser[]> {
    return this.users;
  }

  async getById(id: string): Promise<IUser | null> {
    return this.users.find((u) => u.id === id) || null;
  }
}

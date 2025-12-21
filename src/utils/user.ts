import type { User } from '../types/auth';

export const getUserFullName = (user?: User) =>
  user ? `${user.firstName} ${user.lastName}` : 'Unknown';

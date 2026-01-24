import type { UserProfile } from './types';

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/me');
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

interface User {
  id: number;
  name: string;
  email: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

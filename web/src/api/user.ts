import { http } from '@/utils/fetch';

import type { User, UserProfile } from './types';

export const fetchUserProfile = async (): Promise<UserProfile> => {
  return http.get<UserProfile>('api/me');
};

export const fetchUsers = async (): Promise<User[]> => {
  return http.get<User[]>('api/users');
};

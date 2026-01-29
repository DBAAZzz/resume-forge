import { useQuery } from '@tanstack/react-query';

import { fetchUserProfile, fetchUsers } from '@/api/user';

export const USER_KEYS = {
  all: ['users'] as const,
  currentUser: ['currentUser'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: USER_KEYS.currentUser,
    queryFn: fetchUserProfile,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.all,
    queryFn: fetchUsers,
  });
}

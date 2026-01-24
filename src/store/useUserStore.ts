import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  removeUser: (id: number) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        users: [],
        loading: false,
        error: null,

        fetchUsers: async () => {
          set({ loading: true, error: null });
          try {
            // 模拟 API 调用
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const mockUsers: User[] = [
              { id: 1, name: 'Alice', email: 'alice@example.com' },
              { id: 2, name: 'Bob', email: 'bob@example.com' },
              { id: 3, name: 'Charlie', email: 'charlie@example.com' },
            ];
            set({ users: mockUsers, loading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error', 
              loading: false 
            });
          }
        },

        addUser: (user: User) => {
          set((state) => ({ users: [...state.users, user] }));
        },

        removeUser: (id: number) => {
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
          }));
        },

        clearUsers: () => {
          set({ users: [] });
        },
      }),
      {
        name: 'user-storage', // localStorage key
      }
    )
  )
);

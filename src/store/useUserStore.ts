import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: false,
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      }),
      {
        name: 'user-ui-storage', // Changed storage key as structure changed
      }
    )
  )
);

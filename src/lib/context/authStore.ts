import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  loggedIn: boolean;
  isSettling: boolean;
  currentOrganizationId: string | null; // Add this
  setLoggedIn: (loggedIn: boolean) => void;
  startSettling: () => void;
  endSettling: () => void;
}

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      loggedIn: true, // Set to true for demo purposes
      isSettling: false, // Start as false since we're logged in
      currentOrganizationId: "org_cm8yflh26064xmw01zbalts9c", // Temp hardcoded value
      setLoggedIn: (loggedIn) => set({ loggedIn }),
      startSettling: () => set({ isSettling: true }),
      endSettling: () => set({ isSettling: false }),
    }),
    {
      name: "auth-store",
    },
  ),
);

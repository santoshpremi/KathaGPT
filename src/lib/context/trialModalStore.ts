// src/lib/context/trialModalStore.ts
import { create } from "zustand";
import type { PhaseUsageResponse } from "@backend/util/credits/phaseUsage";

interface TrialStore {
  status: PhaseUsageResponse;
  reset: () => void;
  extendTrial: (months: number) => Promise<void>;
}

export const useTrialStore = create<TrialStore>((set) => ({
  status: "ok",
  reset: () => set({ status: "ok" }),
  extendTrial: async (months) => {
    // Call backend API to extend trial
    const response = await fetch('/api/trial/extend', {
      method: 'POST',
      body: JSON.stringify({ months })
    });
    
    if (response.ok) {
      set({ status: "ok" });
    }
  }
}));
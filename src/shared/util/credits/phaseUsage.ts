// backend/src/util/credits/phaseUsage.ts
export type PhaseUsageResponse = 'ok' | 'expired' | 'creditsExhausted';
export interface Organization {
  id: string;
  name: string;
  domain: string[];
  logoUrl: string;
  avatarUrl: string;
  tenantId: string;
  defaultWorkshopId: string;
  customPrimaryColor: string;
  defaultModel: string;
  isAcademyOnly: boolean;
}

interface TrialConfig {
  startDate: Date;
  durationMonths: number;
}

export function checkTrialPhase(): PhaseUsageResponse {
  // Default to 2 months trial
  const trialConfig: TrialConfig = {
    startDate: new Date('2025-04-01'), // Replace with actual signup date
    durationMonths: 2
  };

  const trialEnd = new Date(trialConfig.startDate);
  trialEnd.setMonth(trialEnd.getMonth() + trialConfig.durationMonths);
  
  return new Date() > trialEnd ? 'expired' : 'ok';
}
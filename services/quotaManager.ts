
// Constants for Free Tier Limits (Approximate safety buffers)
// Gemini Pro Free: 50 RPD (Requests Per Day)
// Gemini Flash Free: 1500 RPD
const LIMITS = {
  PRO: 50,
  FLASH: 1500
};

const STORAGE_KEY = 'recruitai_quota_v1';

interface QuotaState {
  date: string;
  counts: {
    pro: number;
    flash: number;
  };
}

class QuotaExceededError extends Error {
  constructor(modelType: string) {
    super(`Daily safety limit reached for ${modelType} model. Operations halted to prevent costs.`);
    this.name = "QuotaExceededError";
  }
}

export const QuotaManager = {
  getUsage: (): QuotaState => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed: QuotaState = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed;
      }
    }

    // Reset if new day or no data
    const newState: QuotaState = {
      date: today,
      counts: { pro: 0, flash: 0 }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  },

  checkAndIncrement: (type: 'PRO' | 'FLASH') => {
    const state = QuotaManager.getUsage();
    const current = state.counts[type === 'PRO' ? 'pro' : 'flash'];
    const limit = LIMITS[type];

    if (current >= limit) {
      throw new QuotaExceededError(type);
    }

    // Increment
    if (type === 'PRO') state.counts.pro++;
    else state.counts.flash++;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log(`[QuotaManager] ${type} Usage: ${state.counts[type === 'PRO' ? 'pro' : 'flash']}/${limit}`);
  },

  checkRemaining: (type: 'PRO' | 'FLASH'): number => {
    const state = QuotaManager.getUsage();
    const current = state.counts[type === 'PRO' ? 'pro' : 'flash'];
    const limit = LIMITS[type];
    return Math.max(0, limit - current);
  }
};

export { QuotaExceededError };

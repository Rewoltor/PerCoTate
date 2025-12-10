export const CONFIG = {
  // Toggle debug mode for testing (e.g., shorter trial sequences)
  IS_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',

  // Firestore Collection Names
  COLLECTIONS: {
    USER_IDENTITY: 'user_identity',
    PARTICIPANTS: 'participants',
    SYSTEM_STATS: 'system_stats',
  },

  // Study Parameters
  WASHOUT_PERIOD_MS: 28 * 24 * 60 * 60 * 1000, // 28 days in milliseconds
  TRIALS_PER_SESSION: 50,
  DEBUG_TRIALS_PER_SESSION: 5,
};

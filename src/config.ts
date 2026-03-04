export const CONFIG = {
  // Toggle debug mode for testing (e.g., shorter trial sequences)
  IS_DEBUG_MODE: false, // Hardcoded for immediate effect

  // Firestore Collection Names
  COLLECTIONS: {
    USER_IDENTITY: 'user_identity',
    PARTICIPANTS: 'participants',
    SYSTEM_STATS: 'system_stats',
  },

  // Study Parameters
  // We have reduced the wash out period to 27 days in the code so there are no hickups when the experiment is being conducted. 
  // The was out period is guarenteed by the fact that the high school students only receive the link to the platform after 28 days
  WASHOUT_PERIOD_MS: 27 * 24 * 60 * 60 * 1000, // 28 days in milliseconds
  TRIALS_PER_SESSION: 50,
  DEBUG_TRIALS_PER_SESSION: 5,
};

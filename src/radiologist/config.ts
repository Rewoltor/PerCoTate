// ============================================================
// RADIOLOGIST MODULE — ISOLATED CONFIG
// This module must NEVER reference the main app's collections.
// ============================================================

export const RADIO_CONFIG = {
    COLLECTIONS: {
        RADIO_PARTICIPANTS: 'radio_participants',
    },

    TOTAL_IMAGES: 50,
    IMAGE_BASE_PATH: '/radioData/',
    SESSION_STORAGE_KEY: 'radio_user_session',

    // These are the main app's collections — we must NEVER read/write them.
    // Used only for the runtime safety check.
    PROTECTED_COLLECTIONS: ['participants', 'user_identity', 'system_stats'],
};

// ============================================================
// RUNTIME SAFETY CHECK — Runs at module load
// Throws if any of our collection names accidentally match
// the main app's protected collections.
// ============================================================
const usedCollections = Object.values(RADIO_CONFIG.COLLECTIONS);
for (const c of usedCollections) {
    if (RADIO_CONFIG.PROTECTED_COLLECTIONS.includes(c)) {
        console.error(`[RADIO SAFETY] CRITICAL: Collection "${c}" is a protected main-app collection!`);
        throw new Error(`Radiologist module is referencing protected collection: ${c}`);
    }
}

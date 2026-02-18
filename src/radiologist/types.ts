// ============================================================
// RADIOLOGIST MODULE — STANDALONE TYPES
// No imports from ../types — fully isolated.
// ============================================================

export interface RadiologistParticipant {
    radId: string;                    // Unique ID (RAD-XXXXX)
    imageSequence: number[];          // Shuffled array of 1–80
    currentTrialIndex: number;        // 0-based progress
    completedTrials: Record<string, boolean>;
    demographics?: RadiologistDemographics;
    createdAt?: any;
    completedAt?: number;             // Unix timestamp when finished
}

export interface RadiologistDemographics {
    age: number;
    workplaceType: string;            // Private, State, or University
    yearsOfExperience: number;        // Years of professional experience
    profession: string;               // e.g. "Radiológus", "Ortopéd", etc.
}

export interface RadiologistTrialData {
    trialId: string;                  // e.g. "trial_1"
    imageFileName: string;            // e.g. "42.png"
    startTime: number;                // Unix ms
    endTime: number;                  // Unix ms
    duration: number;                 // seconds
    isReadable: boolean;              // Is the image readable?
    klGrade: 0 | 1 | 2 | 3 | 4 | null; // Kellgren-Lawrence scale (null if not readable)
    confidence: number | null;        // 1–7 confidence scale (null if not readable)
}


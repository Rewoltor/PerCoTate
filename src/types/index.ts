export type TreatmentGroup = '0' | '1';
export type Phase = 'phase1' | 'phase2' | 'phase1_completed' | 'phase2_completed';

export interface Participant {
    userID: string;
    treatmentGroup: TreatmentGroup;
    currentPhase: Phase;
    imageSequence: number[]; // Array of Image IDs (1-50)
    imageSequencePhase2?: number[]; // Array of Image IDs (1-50) for Phase 2

    // Timestamps
    phase1CompletedAt?: number; // Unix timestamp
    phase2CompletedAt?: number; // Unix timestamp

    // Progress tracking within current phase
    completedTrials: { [trialId: string]: boolean };
    completedTrialsPhase2?: { [trialId: string]: boolean };

    // Psychometrics
    demographics?: Demographics;
    big5?: Big5Response;
    iq?: IQResponse;

    // Video status
    phase1VideoWatched?: boolean;
}

export interface UserIdentity {
    name: string;
    pin: string;
    assignedUserID: string;
}

export interface TrialData {
    trialId: string;
    imageName: string; // Web app filename (e.g. "1.png")
    originalImageName: string; // Original filename (e.g. "82876L.png")
    startTime: number;
    endTime: number;

    // Responses
    initialDecision: 0 | 1; // 0 = nem, 1 = igen
    confidence: number; // 1-7 (Initial confidence)

    // AI-Specific
    aiShown?: boolean;
    boxDrawn?: boolean;
    box?: Box;

    // Interaction states
    initialConfidence?: number;
    finalDecision?: 0 | 1; // 0 = nem, 1 = igen
    finalConfidence?: number;
    revertedDecision?: boolean;

    // Metadata from CSV
    image?: string; // Legacy/Redundant? Keeping for CSV compatibility if needed, but originalImageName is primary
    ai_confidence?: number;
    ground_truth_raw?: number;
    ground_truth_binary?: number;
    prediction?: number;

    // Data Fields (NoAITrial / AITrial common)
    symptom1?: string;
    symptom2?: string;
    box1?: Box;
    box2?: Box;

    // Timing
    duration?: number; // Duration in seconds
}

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Demographics {
    age: number;
    gender: string;
    school: string; // Iskolai végzettség
    residence: string; // Lakhely
    healthcareQualification: string; // Egészségügyi végzettség
    experienceLevel?: string; // Keeping for backward compatibility
}

export interface Big5Response {
    rawAnswers: { [questionId: string]: number }; // 1-5
    calculatedTraits: {
        Extraversion: number;
        Agreeableness: number;
        Conscientiousness: number;
        Neuroticism: number; // Negative Emotionality
        OpenMindedness: number;
    };
    calculatedFacets: { [facetName: string]: number };
    timestamp: number;
}

export interface IQResponse {
    answers: { [questionId: string]: string }; // ID -> Selected Option (A-H)
    questionOrder: string[]; // Changed from number[] to string[] for IDs like "R3D.61"
    completedAt: number;
    timeRemaining: number;
    score?: number;
}

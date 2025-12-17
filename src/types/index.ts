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
    imageName: string;
    startTime: number;
    endTime: number;

    // Responses
    diagnosis: 'igen' | 'nem';
    confidence: number; // 1-7

    // AI-Specific
    aiShown?: boolean;
    boxDrawn?: boolean;
    box?: Box; // Normalized or pixel? TBD by implementation

    // Interaction states
    initialDiagnosis?: 'igen' | 'nem';
    initialConfidence?: number;
    finalDiagnosis?: 'igen' | 'nem';
    finalConfidence?: number;

    // Metadata from CSV
    image?: string;
    ai_confidence?: number;
    ground_truth_raw?: number;
    ground_truth_binary?: number;
    prediction?: number;

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
    answers: { [questionId: number]: number }; // ID -> OptionIndex (1-6)
    questionOrder: number[];
    completedAt: number;
    timeRemaining: number;
    score?: number;
}

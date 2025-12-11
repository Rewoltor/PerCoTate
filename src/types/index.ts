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
    experienceLevel: string; // e.g. medical student year
}

export interface Big5Response {
    [questionId: string]: number; // 1-5
}

export interface IQResponse {
    score: number;
    completedAt: number;
}

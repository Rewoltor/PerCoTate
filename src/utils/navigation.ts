import type { Participant } from '../types';

/**
 * Determines the next step in the study flow for a given user
 * based on their current phase, treatment group, and completed tasks.
 */
export const getNextStep = (user: Participant): string => {
    const currentPhase = user.currentPhase;
    const treatmentGroup = user.treatmentGroup;
    const isGroup0 = treatmentGroup === '0';
    const isPhase1 = currentPhase === 'phase1';

    const hasDemographics = !!user.demographics;
    const hasBig5 = !!user.big5;
    const hasIQ = !!user.iq;

    if (isPhase1) {
        if (isGroup0) {
            // Group 0 Phase 1: Demographics -> Big 5 -> IQ -> Video -> Annotation
            const hasVideo = !!user.phase1VideoWatched;

            if (!hasDemographics) return 'demographics';
            if (!hasBig5) return 'intro-big5';
            if (!hasIQ) return 'intro-iq';
            if (!hasVideo) return 'intro-video';
            return 'intro-annotation';
        } else {
            // Group 1 Phase 1: Demographics -> Video -> Annotation (No Big5/IQ)
            if (!hasDemographics) return 'demographics';
            return 'video';
        }
    } else {
        // Phase 2
        if (isGroup0) {
            return 'intro-video';
        } else {
            if (!hasBig5) return 'intro-big5';
            if (!hasIQ) return 'intro-iq';
            return 'intro-video';
        }
    }
};

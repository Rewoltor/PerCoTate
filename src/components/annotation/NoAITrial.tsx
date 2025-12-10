import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import type { TrialData } from '../../types';

interface NoAITrialProps {
    onComplete: () => void; // Called when all trials are done
}

export const NoAITrial: React.FC<NoAITrialProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [diagnosis, setDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Determine actual trial count based on debug mode
    const TOTAL_TRIALS = CONFIG.IS_DEBUG_MODE ? CONFIG.DEBUG_TRIALS_PER_SESSION : CONFIG.TRIALS_PER_SESSION;

    useEffect(() => {
        if (user) {
            // Logic to resume: Check which trials are already in 'completedTrials' map
            // But for simplicity in this MVP step, we might just calculate based on map size?
            const completedCount = Object.keys(user.completedTrials || {}).length;
            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(completedCount);
            }
            setLoading(false);
            setStartTime(Date.now());
        }
    }, [user, onComplete, TOTAL_TRIALS]);

    const handleNext = async () => {
        if (!user || diagnosis === null || confidence === null) return;

        setSaving(true);
        const endTime = Date.now();

        const imageId = user.imageSequence[currentTrialIndex];
        if (!imageId) {
            console.error("No image ID found for index", currentTrialIndex);
            return;
        }

        // Construct Trial Data
        // Trial ID can be sequential "trial_1" or "img_ID" based.
        // Recommended: "trial_{index}" to preserve order, or "img_{id}" to key by image.
        // Plan says: participants/{id}/trials/{trialId}
        const trialId = `trial_${currentTrialIndex + 1}`;

        const trialData: TrialData = {
            trialId,
            imageName: `img_${imageId}.png`, // Assuming PNG format
            startTime,
            endTime,
            diagnosis,
            confidence,
            // No-AI specific fields
            aiShown: false
        };

        try {
            // 1. Save Trial Data
            const trialRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID, 'trials', trialId);
            await setDoc(trialRef, trialData);

            // 2. Update Participant Progress (Atomic update preferred but setDoc merge is okay here)
            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);
            // We need to update the local 'completedTrials' map in Firestore
            // Using dot notation for map update: "completedTrials.trial_X": true
            await setDoc(userRef, {
                completedTrials: {
                    [trialId]: true
                }
            }, { merge: true });

            // 3. Move to next
            // We should ideally update the local 'user' context state too, 
            // but strictly we can just increment local index and let refresh handle the rest?
            // Better to force local increment for smooth UX.
            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(prev => prev + 1);
                setDiagnosis(null);
                setConfidence(null);
                setStartTime(Date.now());
            }

        } catch (err) {
            console.error("Error saving trial:", err);
            alert("Failed to save data. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading trial...</div>;
    if (!user) return <div>No user found.</div>;

    const currentImageId = user.imageSequence[currentTrialIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">

                {/* Header */}
                <div className="p-4 bg-gray-50 border-b flex justify-between">
                    <span className="font-bold text-lg">Trial {currentTrialIndex + 1} / {TOTAL_TRIALS}</span>
                    <span className="text-gray-500">Image ID: {currentImageId}</span>
                </div>

                {/* Image Area */}
                <div className="bg-black min-h-[400px] flex items-center justify-center">
                    {/* Image Source: assuming /annotation/img_{id}.png */}
                    <img
                        src={`/annotation/img_${currentImageId}.png`}
                        alt={`X-Ray ${currentImageId}`}
                        className="max-h-[600px] object-contain"
                    />
                </div>

                {/* Controls */}
                <div className="p-6 space-y-6">

                    {/* Diagnosis */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Látható-e arthritisz jele? (Is arthritis visible?)</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDiagnosis('igen')}
                                className={`px-6 py-3 rounded-md border-2 font-medium transition-colors ${diagnosis === 'igen'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:border-blue-400'
                                    }`}
                            >
                                IGEN (Yes)
                            </button>
                            <button
                                onClick={() => setDiagnosis('nem')}
                                className={`px-6 py-3 rounded-md border-2 font-medium transition-colors ${diagnosis === 'nem'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:border-blue-400'
                                    }`}
                            >
                                NEM (No)
                            </button>
                        </div>
                    </div>

                    {/* Confidence */}
                    {diagnosis && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Mennyire biztos a döntésében? (Confidence: 1-7)</h3>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setConfidence(num)}
                                        className={`w-12 h-12 rounded-full font-bold border-2 transition-all ${confidence === num
                                            ? 'bg-blue-600 text-white border-blue-600 scale-110'
                                            : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between w-[360px] text-xs text-gray-500 mt-1 px-1">
                                <span>Bizonytalan (Unsure)</span>
                                <span>Biztos (Sure)</span>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4 border-t flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={!diagnosis || !confidence || saving}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Mentés...' : 'Tovább (Next) →'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

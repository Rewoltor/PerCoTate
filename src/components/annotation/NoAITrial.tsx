import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { getAIPrediction } from '../../utils/aiLookup';
import type { TrialData } from '../../types';

interface NoAITrialProps {
    onComplete: () => void;
}

export const NoAITrial: React.FC<NoAITrialProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Annotation State
    const [diagnosis, setDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

    const [saving, setSaving] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Computed
    const canSubmit = diagnosis && confidence; // Submit only depends on diagnosis and confidence

    const TOTAL_TRIALS = CONFIG.IS_DEBUG_MODE ? CONFIG.DEBUG_TRIALS_PER_SESSION : CONFIG.TRIALS_PER_SESSION;

    // Initialize from User Context
    useEffect(() => {
        if (user) {
            const isPhase2 = user.currentPhase === 'phase2';
            const trialsMap = isPhase2 ? (user.completedTrialsPhase2 || {}) : (user.completedTrials || {});
            const completedCount = Object.keys(trialsMap).length;

            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
                return;
            }
            if (completedCount > currentTrialIndex) {
                setCurrentTrialIndex(completedCount);
            }
        }
    }, [user, onComplete, TOTAL_TRIALS, currentTrialIndex]);

    // Handle Image Load - Dependent on index change
    useEffect(() => {
        if (!user) return;
        const sequence = user.currentPhase === 'phase2' ? (user.imageSequencePhase2 || user.imageSequence) : user.imageSequence;
        const imgId = sequence[currentTrialIndex];

        if (imgId === undefined) return;

        setLoading(true);
        // Clear previous image URL to show loader
        setCurrentImageUrl('');

        getAIPrediction(imgId)
            .then(data => {
                if (data && data.imageName) {
                    setCurrentImageUrl(data.imageName);
                } else {
                    console.error(`No AI data found for image ID: ${imgId}`);
                }
            })
            .catch(err => {
                console.error("Error fetching AI prediction:", err);
            })
            .finally(() => {
                setLoading(false);
                // Reset form state here when new image loads
                setDiagnosis(null);
                setConfidence(null);
                setStartTime(Date.now());
            });
    }, [currentTrialIndex, user]);

    // Removed separate reset effect to avoid race conditions
    // State reset is now handled in the image load chain ensure synchronization

    const handleNext = async () => {
        if (!user || !canSubmit) return;

        setSaving(true);
        const endTime = Date.now();
        const isPhase2 = user.currentPhase === 'phase2';
        const sequence = isPhase2 ? (user.imageSequencePhase2 || user.imageSequence) : user.imageSequence;
        const imageId = sequence[currentTrialIndex];

        // Prefix trial ID for Phase 2 to avoid overwriting Phase 1 data
        const trialIdPrefix = isPhase2 ? 'p2_trial' : 'trial';
        const trialId = `${trialIdPrefix}_${currentTrialIndex + 1}`;

        const trialData: TrialData = {
            trialId,
            imageName: `img_${imageId}.png`, // Legacy field, mostly unused if we link by ID
            startTime,
            endTime,
            diagnosis,
            confidence,
            aiShown: false,
        };

        try {
            const trialRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID, 'trials', trialId);
            await setDoc(trialRef, trialData);

            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);

            // Update the correct completion map
            const updatePayload = isPhase2
                ? { completedTrialsPhase2: { ...user.completedTrialsPhase2, [trialId]: true } }
                : { completedTrials: { ...user.completedTrials, [trialId]: true } };

            await setDoc(userRef, updatePayload, { merge: true });

            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(prev => prev + 1);
            }

        } catch (err) {
            console.error("Error saving trial:", err);
            alert("Hiba történt a mentéskor.");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !currentImageUrl) return <div className="p-10 text-center">Betöltés...</div>;
    if (!user) return null;

    return (
        <div className="h-screen flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
            {/* Header */}
            <header className="flex-none h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm z-10">
                <div className="text-2xl font-bold tracking-tight text-gray-900">
                    PerCoTate <span className="text-blue-600">Control</span>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {user?.userID || 'User'}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Canvas */}
                <div className="flex-1 bg-black relative flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                                <span className="text-lg font-medium animate-pulse">Kép betöltése...</span>
                            </div>
                        )}
                        <div className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} w-full h-full flex items-center justify-center`}>
                            {currentImageUrl ? (
                                <img
                                    src={currentImageUrl}
                                    alt="X-ray"
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                    draggable={false}
                                />
                            ) : (
                                !loading && <div className="text-white text-center">Hiba: A kép nem tölthető be.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-[400px] bg-white border-l p-6 flex flex-col gap-8 overflow-y-auto shadow-xl z-20">
                    <div>
                        <h2 className="text-xl font-bold mb-1 text-gray-900">{currentTrialIndex + 1} / {TOTAL_TRIALS}</h2>
                        <p className="text-gray-500 text-sm">(AI nélkül)</p>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Diagnosis Decision - Now Step 1 */}
                        <div>
                            <label className="block font-semibold mb-3 text-gray-700 text-lg">1. Diagnózis</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDiagnosis('igen')}
                                    className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                        ${diagnosis === 'igen'
                                            ? 'bg-blue-600 border-blue-600 text-white transform scale-[1.02]'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    Pozitív
                                </button>
                                <button
                                    onClick={() => {
                                        setDiagnosis('nem');
                                    }}
                                    className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                        ${diagnosis === 'nem'
                                            ? 'bg-blue-600 border-blue-600 text-white transform scale-[1.02]'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                >
                                    Negatív
                                </button>
                            </div>
                        </div>

                        {/* 2. Confidence Rating - Now Step 2 */}
                        {diagnosis && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block font-semibold mb-3 text-lg text-gray-700">2. Mennyire vagy biztos a diagnózisodban? (1-7)</label>
                                <div className="grid grid-cols-7 gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setConfidence(num)}
                                            className={`aspect-square rounded-lg border-2 font-bold text-lg transition-all transform hover:scale-105
                                                ${confidence === num
                                                    ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide px-1">
                                    <span>Bizonytalan</span>
                                    <span>Biztos</span>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleNext}
                            disabled={!canSubmit || saving}
                            className="w-full mt-4"
                            isLoading={saving}
                        >
                            Beküldés →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
// import type { TrialData } from '../../types';
import { getAIPrediction } from '../../utils/aiLookup';
import { calculateIoU, type Box } from '../../utils/math';
import { BBoxTool } from '../common/BBoxTool';
import { AIFeedbackModal } from './AIFeedbackModal';
import { PreConfidenceModal } from './PreConfidenceModal';

interface AITrialProps {
    onComplete: () => void;
}

type Step = 'initial' | 'pre-confidence' | 'feedback' | 'post-confidence';

export const AITrial: React.FC<AITrialProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<Step>('initial');

    // Data State
    const [symptomType, setSymptomType] = useState<string>(''); // 'tunet' | 'bizonytalan' | 'nincsen'
    const [userBox, setUserBox] = useState<Box | null>(null);
    const [initialDiagnosis, setInitialDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [initialConfidence, setInitialConfidence] = useState<number | null>(null);
    const [finalDiagnosis, setFinalDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [_finalConfidence, setFinalConfidence] = useState<number | null>(null); // Post-feedback

    // Stats
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [aiData, setAiData] = useState<any>(null); // Prediction, Box, etc.

    // Constants
    const TOTAL_TRIALS = CONFIG.IS_DEBUG_MODE ? CONFIG.DEBUG_TRIALS_PER_SESSION : CONFIG.TRIALS_PER_SESSION;

    // 1. Initialization Effect: Set starting index based on user progress (only once or when user changes)
    useEffect(() => {
        if (user) {
            const completedCount = Object.keys(user.completedTrials || {}).length;
            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
            } else {
                // Only sync if we haven't started locally properly, or force sync on mount
                // Since this effect doesn't depend on currentTrialIndex, it won't re-run on local updates
                if (currentTrialIndex === 0 && completedCount > 0) {
                    setCurrentTrialIndex(completedCount);
                }
            }
        }
    }, [user, TOTAL_TRIALS]); // REMOVED currentTrialIndex dependency

    // 2. Data Loading Effect: Runs whenever currentTrialIndex changes
    useEffect(() => {
        if (user) {
            // Check bounds
            if (currentTrialIndex < TOTAL_TRIALS) {
                const imgId = user.imageSequence[currentTrialIndex];
                if (imgId !== undefined) {
                    loadTrialData(imgId);
                }
            } else {
                onComplete();
            }
        }
    }, [currentTrialIndex, user]); // user is needed for imageSequence access

    const loadTrialData = async (imageId: number) => {
        setLoading(true);
        const data = await getAIPrediction(imageId); // Default phaseFilter='baseline'
        // If data is missing (e.g. index out of CSV range since we have random IDs 1..50 but CSV example has only 5 lines),
        // we must handle it to avoid infinite loading.
        if (!data) {
            console.error(`No AI data found for imageId: ${imageId}`);
            // Fallback for DEV/DEBUG so app doesn't freeze?
            // Or show error
            // For now, let's create a dummy fallback to unblock the UI
            setAiData({
                id: `fallback_${imageId}`,
                imageName: `/dataset/no_map/fallback.png`, // User should ensure 1..50 exist in CSV
                phase: 'fallback',
                diagnosis: 'nem',
                confidence: 0,
                heatmapPath: '',
                box: undefined
            });
        } else {
            setAiData(data);
        }

        // Reset State
        setStep('initial');
        setSymptomType('');
        setUserBox(null);
        setInitialDiagnosis(null);
        setInitialConfidence(null);
        setFinalDiagnosis(null);
        setFinalConfidence(null);
        setStartTime(Date.now());

        setLoading(false);
    };

    // Logic Helpers
    const canDraw = symptomType === 'tunet' || symptomType === 'bizonytalan';
    const isBoxValid = () => {
        if (symptomType === 'tunet') return !!userBox; // Mandatory
        if (symptomType === 'nincsen') return true; // No box allowed
        return true; // Optional for unsure
    };

    const handleInitialSubmit = () => {
        if (!initialDiagnosis || !isBoxValid()) return;
        setStep('pre-confidence');
    };

    const handlePreConfidenceSubmit = (conf: number) => {
        setInitialConfidence(conf);
        setStep('feedback');
    };

    const handleFeedbackRevise = (newDecision: 'igen' | 'nem') => {
        setFinalDiagnosis(newDecision);
        // step -> post-confidence (handled by onContinue)
    };

    const handleFeedbackContinue = () => {
        setStep('post-confidence');
    };

    const handleFinalSubmit = async (conf: number) => {
        if (!user) return;
        console.log("Submitting final trial...", { conf, currentTrialIndex });
        setFinalConfidence(conf);
        setLoading(true); // Saving UI

        const imageId = user.imageSequence[currentTrialIndex];
        const trialId = `trial_${currentTrialIndex + 1}`; // Fixed typo: removed trailing space

        const trialData: any = {
            trialId,
            imageName: `img_${imageId}.png`,
            startTime,
            endTime: Date.now(),

            diagnosis: finalDiagnosis!,
            confidence: conf,

            aiShown: true,
            boxDrawn: !!userBox,

            initialDiagnosis: initialDiagnosis!,
            initialConfidence: initialConfidence!,
            finalDiagnosis: finalDiagnosis!,
            finalConfidence: conf,
        };

        // Firestore helper: Only add 'box' if it exists. NEVER pass undefined.
        if (userBox) {
            trialData.box = userBox;
        }

        try {
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID, 'trials', trialId), trialData);
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                completedTrials: { [trialId]: true }
            }, { merge: true });

            console.log("Trial saved successfully:", trialId);

            // Next
            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(prev => prev + 1);
                // Trigger useEffect via index change
            }

        } catch (e) {
            console.error("Save error", e);
            alert("Hiba a mentéskor. Kérjük próbálja újra. (Save Error)");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !aiData || !user) return <div>Loading AI Trial...</div>;

    // const currentImageId = user.imageSequence[currentTrialIndex];

    // Calculate IoU only when needed
    const iou = (userBox && aiData.box) ? calculateIoU(userBox, aiData.box) : 0;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Modal Layer */}
            {step === 'pre-confidence' && (
                <PreConfidenceModal
                    imageSrc={aiData.imageName}
                    userBox={userBox}
                    symptomType={symptomType}
                    onConfidenceSelect={handlePreConfidenceSubmit}
                />
            )}

            {(step === 'feedback' || step === 'post-confidence') && (
                <AIFeedbackModal
                    imageSrc={aiData.imageName}
                    userBox={userBox}
                    aiBox={aiData.box}
                    aiPrediction={aiData.diagnosis}
                    aiConfidence={aiData.confidence}
                    iouPercent={iou}
                    initialDecision={initialDiagnosis}
                    heatmapPath={aiData.heatmapPath}
                    onRevise={handleFeedbackRevise}
                    onContinue={handleFeedbackContinue} // Just updates internal state if needed, mostly handled by modal now
                    onFinalSubmit={handleFinalSubmit}
                />
            )}

            {/* Main Workflow */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Image/Tool */}
                <div className="flex-1 bg-gray-950 flex items-center justify-center relative">
                    <BBoxTool
                        src={aiData.imageName}
                        onChange={setUserBox}
                        enabled={step === 'initial' && canDraw}
                    // We could show overlay here if needed, but per design AI only shows in Modal
                    />
                </div>

                {/* Right: Controls Panel */}
                <div className="w-[400px] bg-white border-l p-6 flex flex-col gap-8 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold mb-1">{currentTrialIndex + 1}. Eset / {TOTAL_TRIALS}</h2>
                        <p className="text-gray-500 text-sm">AI Asszisztenssel</p>
                    </div>

                    {/* Step 1: Initial Diagnosis Flow */}
                    {step === 'initial' && (
                        <div className="space-y-6">
                            {/* 1. Classification */}
                            <div>
                                <label className="block font-semibold mb-2 text-lg">1. Mit lát?</label>
                                <select
                                    value={symptomType}
                                    onChange={(e) => {
                                        setSymptomType(e.target.value);
                                        if (e.target.value === 'nincsen') setUserBox(null);
                                    }}
                                    className="w-full p-3 border rounded-lg text-lg bg-white"
                                >
                                    <option value="" disabled>-- Válasszon --</option>
                                    <option value="tunet">Tünet</option>
                                    <option value="bizonytalan">Bizonytalan</option>
                                    <option value="nincsen">Nincsen Tünet</option>
                                </select>
                            </div>

                            {/* 2. Drawing Instruction */}
                            {symptomType && (
                                <div className={`p-4 rounded-lg text-base font-medium ${canDraw ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'} `}>
                                    {symptomType === 'tunet' && "Rajzolja be a tünetet a képen (Kötelező)."}
                                    {symptomType === 'bizonytalan' && "Jelölje a gyanús területet (Opcionális)."}
                                    {symptomType === 'nincsen' && "Nincs teendő a képen."}
                                </div>
                            )}

                            {/* 3. Diagnosis Decision */}
                            {symptomType && (
                                <div>
                                    <label className="block font-semibold mb-3 text-gray-700 text-lg">2. Diagnózis</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setInitialDiagnosis('igen')}
                                            className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                                ${initialDiagnosis === 'igen'
                                                    ? 'bg-blue-600 border-blue-600 text-white transform scale-[1.02]'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                        >
                                            IGEN
                                        </button>
                                        <button
                                            onClick={() => setInitialDiagnosis('nem')}
                                            className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                                ${initialDiagnosis === 'nem'
                                                    ? 'bg-blue-600 border-blue-600 text-white transform scale-[1.02]'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                        >
                                            NEM
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Next Button */}
                            <button
                                onClick={handleInitialSubmit}
                                disabled={!initialDiagnosis || !symptomType || !isBoxValid()}
                                className="w-full py-4 mt-4 bg-gray-900 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-black transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Értékelés →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Pre-Confidence (Hidden in sidebar, shown in Modal) */}
                    {step === 'pre-confidence' && (
                        <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4">
                            Kérjük, értékelje a döntését a felugró ablakban.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

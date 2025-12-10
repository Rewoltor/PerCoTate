
import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import type { TrialData } from '../../types';
import { getAIPrediction } from '../../utils/aiLookup';
import { calculateIoU, type Box } from '../../utils/math';
import { BBoxTool } from '../common/BBoxTool';
import { AIFeedbackModal } from './AIFeedbackModal';

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

    useEffect(() => {
        if (user) {
            const completedCount = Object.keys(user.completedTrials || {}).length;
            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(completedCount);
                loadTrialData(user.imageSequence[completedCount]);
            }
        }
    }, [user, currentTrialIndex, TOTAL_TRIALS]);

    const loadTrialData = async (imageId: number) => {
        setLoading(true);
        const data = await getAIPrediction(imageId);
        setAiData(data);

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
        setFinalConfidence(conf);
        setLoading(true); // Saving UI

        const imageId = user.imageSequence[currentTrialIndex];
        const trialId = `trial_${currentTrialIndex + 1} `;

        const trialData: TrialData = {
            trialId,
            imageName: `img_${imageId}.png`,
            startTime,
            endTime: Date.now(),

            diagnosis: finalDiagnosis!, // Final decision is what counts for accuracy
            confidence: conf,

            aiShown: true,
            boxDrawn: !!userBox,
            box: userBox || undefined,

            initialDiagnosis: initialDiagnosis!,
            initialConfidence: initialConfidence!,
            finalDiagnosis: finalDiagnosis!,
            finalConfidence: conf,
        };

        try {
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID, 'trials', trialId), trialData);
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                completedTrials: { [trialId]: true }
            }, { merge: true });

            // Next
            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(prev => prev + 1);
                // Trigger useEffect via index change
            }

        } catch (e) {
            console.error("Save error", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !aiData || !user) return <div>Loading AI Trial...</div>;

    const currentImageId = user.imageSequence[currentTrialIndex];

    // Calculate IoU only when needed
    const iou = (userBox && aiData.box) ? calculateIoU(userBox, aiData.box) : 0;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Modal Layer */}
            {step === 'feedback' && (
                <AIFeedbackModal
                    imageSrc={`/ annotation / img_${currentImageId}.png`}
                    userBox={userBox}
                    aiBox={aiData.box}
                    aiPrediction={aiData.diagnosis}
                    aiConfidence={aiData.confidence}
                    iouPercent={iou}
                    initialDecision={initialDiagnosis}
                    onRevise={handleFeedbackRevise}
                    onContinue={handleFeedbackContinue}
                />
            )}

            {/* Main Workflow */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Image/Tool */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    <BBoxTool
                        src={`/ annotation / img_${currentImageId}.png`}
                        onChange={setUserBox}
                        enabled={step === 'initial' && canDraw}
                    // We could show overlay here if needed, but per design AI only shows in Modal
                    />
                </div>

                {/* Right: Controls Panel */}
                <div className="w-[400px] bg-white border-l p-6 flex flex-col gap-8 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Trial {currentTrialIndex + 1} / {TOTAL_TRIALS}</h2>
                        <p className="text-gray-500 text-sm">With AI Assistance</p>
                    </div>

                    {/* Step 1: Initial Diagnosis Flow */}
                    {step === 'initial' && (
                        <div className="space-y-6">
                            {/* 1. Classification */}
                            <div>
                                <label className="block font-semibold mb-2">1. Mit lát? (Classification)</label>
                                <select
                                    value={symptomType}
                                    onChange={(e) => {
                                        setSymptomType(e.target.value);
                                        if (e.target.value === 'nincsen') setUserBox(null);
                                    }}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="" disabled>-- Válasszon --</option>
                                    <option value="tunet">Tünet (Symptom Visible)</option>
                                    <option value="bizonytalan">Bizonytalan (Unsure)</option>
                                    <option value="nincsen">Nincsen Tünet (No Symptom)</option>
                                </select>
                            </div>

                            {/* 2. Drawing Instruction */}
                            {symptomType && (
                                <div className={`p - 3 rounded text - sm ${canDraw ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-500'} `}>
                                    {symptomType === 'tunet' && "Rajzolja be a tünetet a képen (Kötelező)."}
                                    {symptomType === 'bizonytalan' && "Jelölje a gyanús területet (Opcionális)."}
                                    {symptomType === 'nincsen' && "Nincs teendő a képen."}
                                </div>
                            )}

                            {/* 3. Diagnosis Decision */}
                            {symptomType && (
                                <div>
                                    <label className="block font-semibold mb-2">2. Diagnózis (Diagnosis)</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setInitialDiagnosis('igen')}
                                            className={`flex - 1 py - 3 border rounded ${initialDiagnosis === 'igen' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'} `}
                                        >
                                            IGEN
                                        </button>
                                        <button
                                            onClick={() => setInitialDiagnosis('nem')}
                                            className={`flex - 1 py - 3 border rounded ${initialDiagnosis === 'nem' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'} `}
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
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Értékelés (Rate Confidence) →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Pre-Confidence */}
                    {step === 'pre-confidence' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold">Mennyire biztos az első döntésében?</h3>
                            <div className="grid grid-cols-7 gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handlePreConfidenceSubmit(num)}
                                        className="aspect-square rounded border hover:bg-blue-100 font-bold"
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Bizonytalan</span>
                                <span>Biztos</span>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Post-Confidence (After Feedback) */}
                    {step === 'post-confidence' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold">Mennyire biztos a VÉGSŐ döntésében?</h3>
                            <p className="text-sm text-gray-600">
                                Ön: <strong>{finalDiagnosis?.toUpperCase()}</strong> <br />
                                AI: <strong>{aiData.diagnosis.toUpperCase()}</strong>
                            </p>
                            <div className="grid grid-cols-7 gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleFinalSubmit(num)}
                                        className="aspect-square rounded border hover:bg-green-100 hover:border-green-500 font-bold"
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

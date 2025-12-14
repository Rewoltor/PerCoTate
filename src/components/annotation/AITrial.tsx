
import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
// import type { TrialData } from '../../types';
import { getAIPrediction } from '../../utils/aiLookup';
import { type Box } from '../../utils/math';
import { BBoxTool, type ColoredBox } from '../common/BBoxTool';
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
    const [symptom1, setSymptom1] = useState<string>('');
    const [box1, setBox1] = useState<Box | null>(null);

    const [symptom2, setSymptom2] = useState<string>('');
    const [box2, setBox2] = useState<Box | null>(null);

    const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

    const [initialDiagnosis, setInitialDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [initialConfidence, setInitialConfidence] = useState<number | null>(null);
    const [finalDiagnosis, setFinalDiagnosis] = useState<'igen' | 'nem' | null>(null);
    const [_finalConfidence, setFinalConfidence] = useState<number | null>(null); // Post-feedback

    // Stats
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [aiData, setAiData] = useState<any>(null); // Prediction, Box, etc.

    // Constants
    const TOTAL_TRIALS = CONFIG.IS_DEBUG_MODE ? CONFIG.DEBUG_TRIALS_PER_SESSION : CONFIG.TRIALS_PER_SESSION;

    // 1. Initialization Effect
    useEffect(() => {
        if (user) {
            const isPhase2 = user.currentPhase === 'phase2';
            const trialsMap = isPhase2 ? (user.completedTrialsPhase2 || {}) : (user.completedTrials || {});
            const completedCount = Object.keys(trialsMap).length;

            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
            } else {
                if (currentTrialIndex === 0 && completedCount > 0) {
                    setCurrentTrialIndex(completedCount);
                }
            }
        }
    }, [user, TOTAL_TRIALS]);

    // 2. Data Loading Effect
    useEffect(() => {
        if (user) {
            if (currentTrialIndex < TOTAL_TRIALS) {
                const sequence = user.currentPhase === 'phase2' ? (user.imageSequencePhase2 || user.imageSequence) : user.imageSequence;
                const imgId = sequence[currentTrialIndex];
                if (imgId !== undefined) {
                    loadTrialData(imgId);
                }
            } else {
                onComplete();
            }
        }
    }, [currentTrialIndex, user]);

    const loadTrialData = async (imageId: number) => {
        setLoading(true);
        const data = await getAIPrediction(imageId);
        if (!data) {
            console.error(`No AI data found for imageId: ${imageId}`);
            setAiData({
                id: `fallback_${imageId}`,
                imageName: `/dataset/no_map/fallback.png`,
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
        setSymptom1('');
        setBox1(null);
        setSymptom2('');
        setBox2(null);
        setActiveBoxId(null);
        setInitialDiagnosis(null);
        setInitialConfidence(null);
        setFinalDiagnosis(null);
        setFinalConfidence(null);
        setStartTime(Date.now());

        setLoading(false);
    };

    // Logic Helpers
    const isBoxValid = (symptom: string, box: Box | null) => {
        if (symptom === 'tunet') return !!box; // Mandatory
        if (symptom === 'nincsen') return true; // No box allowed
        return true; // Optional for unsure
    };

    const isValidSubmit = () => {
        if (!initialDiagnosis) return false;
        if (!symptom1 || !isBoxValid(symptom1, box1)) return false;
        if (!symptom2 || !isBoxValid(symptom2, box2)) return false;
        return true;
    };

    const handleBoxChange = (id: string, box: Box | null) => {
        if (id === 'box1') setBox1(box);
        if (id === 'box2') setBox2(box);

        // Auto-stop drawing after creating a box? Or keep drawing?
        // Usually safer to stop to allow scroll/etc.
        if (box) setActiveBoxId(null);
    };

    const handleInitialSubmit = () => {
        if (!isValidSubmit()) return;
        setStep('pre-confidence');
    };

    const handlePreConfidenceSubmit = (conf: number) => {
        setInitialConfidence(conf);
        setStep('feedback');
    };

    const handleFeedbackRevise = (newDecision: 'igen' | 'nem') => {
        setFinalDiagnosis(newDecision);
    };

    const handleFeedbackContinue = () => {
        setStep('post-confidence');
    };

    const handleFinalSubmit = async (conf: number) => {
        if (!user) return;
        console.log("Submitting final trial...", { conf, currentTrialIndex });
        setFinalConfidence(conf);
        setLoading(true);

        const isPhase2 = user.currentPhase === 'phase2';
        const sequence = isPhase2 ? (user.imageSequencePhase2 || user.imageSequence) : user.imageSequence;
        const imageId = sequence[currentTrialIndex];

        const trialIdPrefix = isPhase2 ? 'p2_trial' : 'trial';
        const trialId = `${trialIdPrefix}_${currentTrialIndex + 1}`;

        const trialData: any = {
            trialId,
            imageName: `img_${imageId}.png`,
            startTime,
            endTime: Date.now(),

            diagnosis: finalDiagnosis!,
            confidence: conf,

            // New Data Fields
            symptom1,
            symptom2,
            box1,
            box2,

            revertedDecision: initialDiagnosis !== finalDiagnosis,

            aiShown: true,

            initialDiagnosis: initialDiagnosis!,
            initialConfidence: initialConfidence!,
            finalDiagnosis: finalDiagnosis!,
            finalConfidence: conf,
        };

        try {
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID, 'trials', trialId), trialData);

            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);
            const updatePayload = isPhase2
                ? { completedTrialsPhase2: { ...user.completedTrialsPhase2, [trialId]: true } }
                : { completedTrials: { ...user.completedTrials, [trialId]: true } };

            await setDoc(userRef, updatePayload, { merge: true });

            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                onComplete();
            } else {
                setCurrentTrialIndex(prev => prev + 1);
            }

        } catch (e) {
            console.error("Save error", e);
            alert("Hiba a mentéskor. Kérjük próbálja újra.");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !aiData || !user) return <div>Loading AI Trial...</div>;

    // Prepare boxes for BBoxTool
    const displayBoxes: ColoredBox[] = [];
    if (box1) displayBoxes.push({ id: 'box1', box: box1, color: '#10b981', label: '1' });
    if (box2) displayBoxes.push({ id: 'box2', box: box2, color: '#3b82f6', label: '2' });

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Modal Layer */}
            {step === 'pre-confidence' && (
                <PreConfidenceModal
                    imageSrc={aiData.imageName}
                    userBoxes={displayBoxes}
                    activeDiagnosis={initialDiagnosis!}
                    onConfidenceSelect={handlePreConfidenceSubmit}
                />
            )}

            {(step === 'feedback' || step === 'post-confidence') && (
                <AIFeedbackModal
                    imageSrc={aiData.imageName}
                    userBoxes={displayBoxes}
                    aiBox={aiData.box}
                    aiPrediction={aiData.diagnosis}
                    aiConfidence={aiData.confidence}
                    initialDecision={initialDiagnosis}
                    heatmapPath={aiData.heatmapPath}
                    onRevise={handleFeedbackRevise}
                    onContinue={handleFeedbackContinue}
                    onFinalSubmit={handleFinalSubmit}
                />
            )}

            {/* Main Workflow */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Image/Tool */}
                <div className="flex-1 bg-gray-950 flex items-center justify-center relative">
                    <BBoxTool
                        src={aiData.imageName}
                        boxes={displayBoxes}
                        activeBoxId={step === 'initial' ? activeBoxId : null}
                        onChange={handleBoxChange}
                        enabled={step === 'initial'}
                    />
                </div>

                {/* Right: Controls Panel */}
                <div className="w-[400px] bg-white border-l p-6 flex flex-col gap-8 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Eset: {currentTrialIndex + 1} / {TOTAL_TRIALS}</h2>
                        <p className="text-gray-500 text-sm">AI Asszisztenssel</p>
                        {CONFIG.IS_DEBUG_MODE && (
                            <p className="text-xs text-red-500 font-mono mt-1 break-all">
                                [DEBUG] Image: {aiData.imageName}
                            </p>
                        )}
                    </div>

                    {step === 'initial' && (
                        <div className="space-y-8">

                            {/* Section 1: Findings */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Mit lát?</h3>

                                {/* Finding 1 */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-semibold text-gray-700">1. Csont sarkantyú (Osteofiták)</label>
                                        <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                    </div>

                                    <select
                                        value={symptom1}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSymptom1(val);
                                            if (val === 'nincsen') {
                                                setBox1(null);
                                                if (activeBoxId === 'box1') setActiveBoxId(null);
                                            } else if (val === 'tunet') {
                                                setActiveBoxId('box1');
                                            }
                                        }}
                                        className="w-full p-2 border rounded mb-3 bg-white"
                                    >
                                        <option value="" disabled>-- Válasszon --</option>
                                        <option value="tunet">Tünet</option>
                                        <option value="bizonytalan">Bizonytalan</option>
                                        <option value="nincsen">Nincsen Tünet</option>
                                    </select>

                                    {(symptom1 === 'tunet' || symptom1 === 'bizonytalan') && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActiveBoxId(activeBoxId === 'box1' ? null : 'box1')}
                                                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${activeBoxId === 'box1' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {activeBoxId === 'box1' ? 'Rajzolás...' : 'Rajzolás'}
                                            </button>
                                            {box1 && (
                                                <button
                                                    onClick={() => setBox1(null)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                                                >
                                                    Törlés
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Finding 2 */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-semibold text-gray-700">2. Ízületi rés beszűkülés</label>
                                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    </div>

                                    <select
                                        value={symptom2}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSymptom2(val);
                                            if (val === 'nincsen') {
                                                setBox2(null);
                                                if (activeBoxId === 'box2') setActiveBoxId(null);
                                            } else if (val === 'tunet') {
                                                setActiveBoxId('box2');
                                            }
                                        }}
                                        className="w-full p-2 border rounded mb-3 bg-white"
                                    >
                                        <option value="" disabled>-- Válasszon --</option>
                                        <option value="tunet">Tünet</option>
                                        <option value="bizonytalan">Bizonytalan</option>
                                        <option value="nincsen">Nincsen Tünet</option>
                                    </select>

                                    {(symptom2 === 'tunet' || symptom2 === 'bizonytalan') && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setActiveBoxId(activeBoxId === 'box2' ? null : 'box2')}
                                                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${activeBoxId === 'box2' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {activeBoxId === 'box2' ? 'Rajzolás...' : 'Rajzolás'}
                                            </button>
                                            {box2 && (
                                                <button
                                                    onClick={() => setBox2(null)}
                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                                                >
                                                    Törlés
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Diagnosis */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">2. Diagnózis</h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setInitialDiagnosis('igen')}
                                        className={`flex-1 py-6 px-4 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                            ${initialDiagnosis === 'igen'
                                                ? 'bg-blue-600 border-blue-600 text-white scale-[1.02]'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                    >
                                        IGEN
                                    </button>
                                    <button
                                        onClick={() => setInitialDiagnosis('nem')}
                                        className={`flex-1 py-6 px-4 rounded-xl border-2 transition-all duration-200 text-xl font-bold tracking-wide shadow-sm hover:shadow-md
                                            ${initialDiagnosis === 'nem'
                                                ? 'bg-blue-600 border-blue-600 text-white scale-[1.02]'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                                    >
                                        NEM
                                    </button>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleInitialSubmit}
                                disabled={!isValidSubmit()}
                                className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-black transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Értékelés →
                            </button>
                        </div>
                    )}

                    {step === 'pre-confidence' && (
                        <div className="p-4 bg-blue-50 text-blue-800 rounded font-medium">
                            Kérjük, értékelje a döntését a felugró ablakban.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

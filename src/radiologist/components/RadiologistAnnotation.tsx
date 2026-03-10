import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RADIO_CONFIG } from '../config';
import { useRadiologistAuth } from '../contexts/RadiologistAuthContext';
import { Button } from '../../components/ui/Button';
import { ZoomControls } from '../../components/common/ZoomControls';
import type { RadiologistTrialData } from '../types';
import { HelpTooltip } from '../../components/common/HelpTooltip';

interface RadiologistAnnotationProps {
    onComplete: () => void;
}

export const RadiologistAnnotation: React.FC<RadiologistAnnotationProps> = ({ onComplete }) => {
    const { user, refreshUser } = useRadiologistAuth();

    const [currentTrialIndex, setCurrentTrialIndex] = useState(() => {
        return user?.currentTrialIndex ?? 0;
    });
    const [loading, setLoading] = useState(true);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

    // Annotation State
    const [radiologistKLGrade, setRadiologistKLGrade] = useState<number | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);

    // Data from CSV
    const [groundTruthMap, setGroundTruthMap] = useState<Record<string, number>>({});

    // Load CSV on mount
    useEffect(() => {
        fetch(`${RADIO_CONFIG.IMAGE_BASE_PATH}predictions.csv`)
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n');
                const map: Record<string, number> = {};
                // Skip header (index 0)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const cols = line.split(',');
                    // Column 0: image (e.g. "1.png"), Column 5: ground_truth_raw (index 5)
                    if (cols.length > 5) {
                        const imgName = cols[0];
                        const gt = parseFloat(cols[5]);
                        if (!isNaN(gt)) {
                            map[imgName] = gt;
                        }
                    }
                }
                setGroundTruthMap(map);
            })
            .catch(err => console.error("Failed to load predictions.csv", err));
    }, []);

    const [saving, setSaving] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Zoom State
    const [zoom, setZoom] = useState<number>(() => {
        if (!user) return 100;
        const stored = sessionStorage.getItem(`radio-zoom-${user.radId}`);
        return stored ? Math.min(200, Math.max(100, parseInt(stored))) : 100;
    });

    const TOTAL_TRIALS = RADIO_CONFIG.TOTAL_IMAGES;

    const canSubmit = radiologistKLGrade !== null && confidence !== null;

    // Check completion on mount
    useEffect(() => {
        if (user) {
            const completedCount = Object.keys(user.completedTrials || {}).length;
            if (completedCount >= TOTAL_TRIALS) {
                onComplete();
            }
        }
    }, [user, onComplete, TOTAL_TRIALS]);

    // Load image when trial index changes
    useEffect(() => {
        if (!user) return;
        const sequence = user.imageSequence;
        const imgId = sequence[currentTrialIndex];

        if (imgId === undefined) return;

        setLoading(true);
        setCurrentImageUrl('');

        const imageUrl = `${RADIO_CONFIG.IMAGE_BASE_PATH}${imgId}.png`;
        setCurrentImageUrl(imageUrl);

        // Reset form state
        setRadiologistKLGrade(null);
        setConfidence(null);
        setStartTime(Date.now());
        setLoading(false);
    }, [currentTrialIndex, user]);

    // Zoom persistence
    useEffect(() => {
        if (user) {
            sessionStorage.setItem(`radio-zoom-${user.radId}`, zoom.toString());
        }
    }, [zoom, user]);

    // Invert State
    const [isInverted, setIsInverted] = useState(false);

    const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 25));
    const handleZoomOut = () => setZoom(prev => Math.max(100, prev - 25));

    const handleNext = async () => {
        if (!user || !canSubmit) return;

        setSaving(true);
        const endTime = Date.now();
        const imageId = user.imageSequence[currentTrialIndex];
        const trialId = `trial_${currentTrialIndex + 1}`;

        const trialData: RadiologistTrialData = {
            trialId,
            imageFileName: `${imageId}.png`,
            startTime,
            endTime,
            duration: (endTime - startTime) / 1000,
            isReadable: true,
            radiologistKLGrade: radiologistKLGrade as 0 | 1 | 2 | 3 | 4,
            confidence: confidence!,
            groundTruthRaw: groundTruthMap[`${imageId}.png`] ?? null
        };

        try {
            // Save trial to radio_participants/{radId}/trials/{trialId}
            const trialRef = doc(db, RADIO_CONFIG.COLLECTIONS.RADIO_PARTICIPANTS, user.radId, 'trials', trialId);
            await setDoc(trialRef, trialData);

            // Update progress on participant document
            const userRef = doc(db, RADIO_CONFIG.COLLECTIONS.RADIO_PARTICIPANTS, user.radId);
            const updatedTrials = { ...user.completedTrials, [trialId]: true };

            if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
                // All done
                await setDoc(userRef, {
                    completedTrials: updatedTrials,
                    currentTrialIndex: currentTrialIndex + 1,
                    completedAt: Date.now(),
                }, { merge: true });
                await refreshUser();
                onComplete();
            } else {
                const newIndex = currentTrialIndex + 1;
                await setDoc(userRef, {
                    completedTrials: updatedTrials,
                    currentTrialIndex: newIndex,
                }, { merge: true });
                setCurrentTrialIndex(newIndex);
                // Reset invert state for next image
                setIsInverted(false);
                await refreshUser();
            }
        } catch (err) {
            console.error("[RadioAnnotation] Error saving trial:", err);
            alert("Hiba történt a mentéskor.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="h-screen flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Image Canvas */}
                <div className="flex-1 bg-black relative flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                                <span className="text-lg font-medium animate-pulse">Kép betöltése...</span>
                            </div>
                        )}
                        <div
                            className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} flex items-center justify-center transition-transform duration-200`}
                            style={{
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: 'center center',
                                filter: isInverted ? 'invert(1)' : 'none',
                            }}
                        >
                            {currentImageUrl ? (
                                <img
                                    src={currentImageUrl}
                                    alt="X-ray"
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                    draggable={false}
                                    onLoad={() => setLoading(false)}
                                    onError={() => setLoading(false)}
                                />
                            ) : (
                                !loading && <div className="text-white text-center">Hiba: A kép nem tölthető be.</div>
                            )}
                        </div>
                    </div>

                    {/* Invert Button */}
                    <button
                        onClick={() => setIsInverted(!isInverted)}
                        className={`absolute bottom-6 right-6 p-3 rounded-full shadow-lg transition-all duration-200 z-30 flex items-center justify-center
                            ${isInverted
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-gray-800/80 text-white hover:bg-gray-700'
                            }`}
                        title="Színek invertálása"
                    >
                        {isInverted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                        )}
                        <span className="ml-2 font-semibold text-sm">{isInverted ? 'Normál' : 'Invertálás'}</span>
                    </button>

                    <ZoomControls
                        zoom={zoom}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        min={100}
                        max={200}
                    />
                </div>

                {/* Right: Controls */}
                <div className="w-[420px] bg-white border-l p-6 flex flex-col gap-6 overflow-y-auto shadow-xl z-20">
                    {/* Progress */}
                    <div>
                        <h2 className="text-xl font-bold mb-1 text-gray-900">
                            {currentTrialIndex + 1} / {TOTAL_TRIALS}
                        </h2>
                        <p className="text-gray-400 text-xs">Radiológiai annotáció</p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: KL Grade */}
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="font-semibold mb-3 text-gray-700 text-lg flex items-center">
                                1. KL Fokozat
                                <HelpTooltip text="Osztályozza a térdízületi arthrosis súlyosságát a Kellgren-Lawrence skála szerint (0: negatív, 4: súlyos)." align="left" position="bottom" />
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {[0, 1, 2, 3, 4].map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => setRadiologistKLGrade(grade)}
                                        className={`aspect-square rounded-xl border-2 font-bold text-xl transition-all transform hover:scale-105
                                            ${radiologistKLGrade === grade
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium uppercase tracking-wide px-1">
                                <span>Normál</span>
                                <span>Súlyos</span>
                            </div>
                        </div>

                        {/* Step 2: Confidence */}
                        {radiologistKLGrade !== null && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="font-semibold mb-3 text-lg text-gray-700 flex items-center">
                                    2. Mennyire biztos a döntésében?
                                    <HelpTooltip text="Adja meg, mennyire biztos a választott KL fokozat helyességében. 1: nagyon bizonytalan, 7: teljesen biztos." align="right" position="bottom" />
                                </h3>
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

                        {/* Submit */}
                        <Button
                            onClick={handleNext}
                            disabled={!canSubmit || saving}
                            className="w-full mt-2 bg-teal-600 hover:bg-teal-700"
                            isLoading={saving}
                        >
                            Tovább →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

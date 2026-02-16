import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RADIO_CONFIG } from '../config';
import { useRadiologistAuth } from '../contexts/RadiologistAuthContext';
import { Button } from '../../components/ui/Button';
import { ZoomControls } from '../../components/common/ZoomControls';
import type { RadiologistTrialData } from '../types';

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
    const [isReadable, setIsReadable] = useState<boolean | null>(null);
    const [klGrade, setKlGrade] = useState<number | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);

    const [saving, setSaving] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    // Zoom State
    const [zoom, setZoom] = useState<number>(() => {
        if (!user) return 100;
        const stored = sessionStorage.getItem(`radio-zoom-${user.radId}`);
        return stored ? Math.min(200, Math.max(100, parseInt(stored))) : 100;
    });

    const TOTAL_TRIALS = RADIO_CONFIG.TOTAL_IMAGES;

    const canSubmit = isReadable !== null && klGrade !== null && confidence !== null;

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
        setIsReadable(null);
        setKlGrade(null);
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
            isReadable: isReadable!,
            klGrade: klGrade as 0 | 1 | 2 | 3 | 4,
            confidence: confidence!,
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
                        {/* Step 1: Readability */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-700 text-lg">
                                1. Olvasható a kép?
                            </h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsReadable(true)}
                                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all duration-200 text-lg font-bold shadow-sm hover:shadow-md
                                        ${isReadable === true
                                            ? 'bg-teal-600 border-teal-600 text-white transform scale-[1.02]'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'}`}
                                >
                                    Igen
                                </button>
                                <button
                                    onClick={() => setIsReadable(false)}
                                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all duration-200 text-lg font-bold shadow-sm hover:shadow-md
                                        ${isReadable === false
                                            ? 'bg-teal-600 border-teal-600 text-white transform scale-[1.02]'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'}`}
                                >
                                    Nem
                                </button>
                            </div>
                        </div>

                        {/* Step 2: KL Grade */}
                        {isReadable !== null && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="font-semibold mb-3 text-gray-700 text-lg">
                                    2. KL Fokozat
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {[0, 1, 2, 3, 4].map(grade => (
                                        <button
                                            key={grade}
                                            onClick={() => setKlGrade(grade)}
                                            className={`aspect-square rounded-xl border-2 font-bold text-xl transition-all transform hover:scale-105
                                                ${klGrade === grade
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
                        )}

                        {/* Step 3: Confidence */}
                        {isReadable !== null && klGrade !== null && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="font-semibold mb-3 text-lg text-gray-700">
                                    3. Mennyire biztos a döntésében?
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

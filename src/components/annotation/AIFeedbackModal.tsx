import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Box } from '../../utils/math';

interface AIFeedbackModalProps {
    imageSrc: string;
    userBox: Box | null;
    aiBox?: Box;
    aiPrediction: 'igen' | 'nem';
    aiConfidence: number;
    iouPercent: number;
    initialDecision: 'igen' | 'nem' | null;
    heatmapPath?: string;
    onRevise: (newDecision: 'igen' | 'nem') => void;
    onContinue: () => void;
}

// Consolidated Modal: Handles Feedback (Phase A) and Final Confidence (Phase A2)
export const AIFeedbackModal: React.FC<AIFeedbackModalProps & {
    onFinalSubmit: (conf: number) => void;
}> = ({
    imageSrc,
    userBox,
    aiBox,
    aiPrediction,
    aiConfidence,
    iouPercent,
    initialDecision,
    heatmapPath,
    onRevise,
    onFinalSubmit
}) => {
        const [decision, setDecision] = useState<'igen' | 'nem'>(initialDecision || aiPrediction);
        const [mode, setMode] = useState<'review' | 'rate'>('review'); // Internal mode switching
        const [showHeatmap, setShowHeatmap] = useState(false);

        const imgRef = useRef<HTMLImageElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // Drawing logic for overlay
        const drawOverlay = () => {
            const img = imgRef.current;
            const canvas = canvasRef.current;
            if (!img || !canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Match canvas to image display size
            canvas.width = img.clientWidth;
            canvas.height = img.clientHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawBox = (box: Box, color: string, label: string) => {
                // Convert natural to display
                const scaleX = img.clientWidth / img.naturalWidth;
                const scaleY = img.clientHeight / img.naturalHeight;

                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY);

                ctx.fillStyle = color;
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(label, (box.x * scaleX) + 5, (box.y * scaleY) + 20);
            };

            if (aiBox) drawBox(aiBox, 'rgba(255, 0, 0, 0.9)', 'AI');
            if (userBox) drawBox(userBox, 'rgba(0, 0, 255, 0.9)', 'User');
        };

        useEffect(() => {
            const img = imgRef.current;
            if (!img) return;
            if (img.complete) drawOverlay();
            img.addEventListener('load', drawOverlay);
            window.addEventListener('resize', drawOverlay);
            return () => {
                img.removeEventListener('load', drawOverlay);
                window.removeEventListener('resize', drawOverlay);
            };
        }, [userBox, aiBox]);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex overflow-hidden h-[600px]">

                    {/* Left: Visualization (Consistent across modes) */}
                    <div className="w-2/3 bg-black relative flex items-center justify-center p-4">
                        <div className="relative max-w-full max-h-full inline-block">
                            <img
                                ref={imgRef}
                                src={showHeatmap && heatmapPath ? heatmapPath : imageSrc}
                                alt="Feedback"
                                className="max-h-full max-w-full object-contain block"
                                style={{ maxHeight: '568px' }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Right: Stats & Controls (Changes based on 'mode') */}
                    <div className="w-1/3 p-8 flex flex-col justify-between bg-gray-50">

                        {mode === 'review' ? (
                            /* PHASE A: Review AI & Decide */
                            <>
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">AI Elemzés</h2>

                                    {/* Heatmap Toggle */}
                                    {heatmapPath && (
                                        <button
                                            onClick={() => setShowHeatmap(!showHeatmap)}
                                            className={`w-full mb-6 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all
                                                ${showHeatmap
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {showHeatmap ? <EyeOff size={20} /> : <Eye size={20} />}
                                            {showHeatmap ? 'Eredeti Kép' : 'Hőtérkép Mutatása'}
                                        </button>
                                    )}

                                    <div className="space-y-4 text-sm text-gray-700">
                                        <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span>Átfedés:</span>
                                            <span className="font-bold text-xl">{Math.round(iouPercent)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span>AI Predikció:</span>
                                            <span className={`font-bold text-lg ${aiPrediction === 'igen' ? 'text-red-600' : 'text-green-600'}`}>
                                                {aiPrediction.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span>AI Biztonság:</span>
                                            <span className="font-bold text-lg">{Math.round(aiConfidence * 100)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Végleges döntés:</label>
                                    <select
                                        value={decision}
                                        onChange={(e) => setDecision(e.target.value as 'igen' | 'nem')}
                                        className="w-full p-4 border rounded-xl mb-6 text-lg font-medium bg-white"
                                    >
                                        <option value="igen">IGEN</option>
                                        <option value="nem">NEM</option>
                                    </select>

                                    <button
                                        onClick={() => {
                                            onRevise(decision); // Notify parent of decision
                                            setMode('rate');     // Advance internal UI
                                        }}
                                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg text-lg"
                                    >
                                        Tovább →
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* PHASE B: Final Confidence Rating */
                            <div className="flex flex-col justify-center h-full animate-in fade-in slide-in-from-right-8 duration-300">
                                <h2 className="text-3xl font-bold mb-6 text-gray-800">Végső Megerősítés</h2>

                                <p className="text-gray-600 mb-8 text-lg">
                                    Az Ön VÉGSŐ döntése: <strong className={decision === 'igen' ? 'text-red-600' : 'text-green-600'}>{decision.toUpperCase()}</strong>
                                </p>

                                <h3 className="text-lg font-bold mb-4 text-gray-700">Mennyire biztos a döntésében?</h3>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => onFinalSubmit(num)} // Calls parent's submit directly
                                            className="aspect-square rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 font-bold text-xl transition-all flex items-center justify-center text-gray-700"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                                    <span>Bizonytalan</span>
                                    <span>Biztos</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    };

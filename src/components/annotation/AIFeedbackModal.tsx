import React, { useRef, useEffect, useState } from 'react';
import { Flame, Zap, Image as ImageIcon } from 'lucide-react';
import { calculateIoU } from '../../utils/math';
import type { Box } from '../../utils/math';
import type { ColoredBox } from '../common/BBoxTool';
import { HelpTooltip } from '../common/HelpTooltip';

interface AIFeedbackModalProps {
    imageSrc: string;
    userBoxes: ColoredBox[];
    aiBox?: Box; // NORMALIZED (0-1)
    aiPrediction: 'igen' | 'nem';
    aiConfidence: number;
    initialDecision: 'igen' | 'nem' | null;
    heatmapPath?: string;
    onRevise: (newDecision: 'igen' | 'nem') => void;
    onContinue: () => void;
}

// Consolidated Modal: Handles Feedback (Phase A) and Final Confidence (Phase B)
export const AIFeedbackModal: React.FC<AIFeedbackModalProps & {
    onFinalSubmit: (conf: number) => void;
}> = ({
    imageSrc,
    userBoxes,
    aiBox,
    aiPrediction,
    aiConfidence,
    initialDecision,
    heatmapPath,
    onRevise,
    onFinalSubmit
}) => {
        const [decision, setDecision] = useState<'igen' | 'nem'>(initialDecision || aiPrediction);
        const [mode, setMode] = useState<'review' | 'rate'>('review'); // Internal mode switching
        const [viewMode, setViewMode] = useState<'heatmap' | 'ai' | 'original'>('heatmap');
        const [symptomIoUs, setSymptomIoUs] = useState<Record<string, number>>({});

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

            // Helper to draw box
            const drawBox = (box: Box, color: string, label: string) => {
                const scaleX = img.clientWidth / img.naturalWidth;
                const scaleY = img.clientHeight / img.naturalHeight;

                const bx = box.x * scaleX;
                const by = box.y * scaleY;
                const bw = box.width * scaleX;
                const bh = box.height * scaleY;

                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(bx, by, bw, bh);

                // Draw Label Outside (Above)
                ctx.font = 'bold 14px sans-serif';
                const textMetrics = ctx.measureText(label);
                const textHeight = 16;
                const padding = 4;

                let ly = by - textHeight - padding;
                if (ly < 0) ly = by + bh + padding;

                // Label Background
                ctx.fillStyle = color;
                ctx.fillRect(bx, ly, textMetrics.width + (padding * 2), textHeight + padding);

                // Label Text
                ctx.fillStyle = 'white';
                ctx.fillText(label, bx + padding, ly + textHeight - 2);
            };

            // Calculate AI Box in Pixels (if exists)
            let aiBoxPixels: Box | null = null;
            if (aiBox) {
                aiBoxPixels = {
                    x: aiBox.x * img.naturalWidth,
                    y: aiBox.y * img.naturalHeight,
                    width: aiBox.width * img.naturalWidth,
                    height: aiBox.height * img.naturalHeight
                };
            }

            // Calculate IoU breakdown
            const newIoUs: Record<string, number> = {};
            if (aiBoxPixels && userBoxes.length > 0) {
                userBoxes.forEach(ub => {
                    newIoUs[ub.id] = calculateIoU(ub.box, aiBoxPixels!);
                });
            }

            // Deep check to avoid loop
            if (JSON.stringify(newIoUs) !== JSON.stringify(symptomIoUs)) {
                setTimeout(() => setSymptomIoUs(newIoUs), 0);
            }

            // Draw Only
            if (viewMode !== 'original') {
                if (aiBoxPixels && viewMode === 'ai') {
                    drawBox(aiBoxPixels, 'rgba(255, 0, 0, 0.9)', 'AI');
                }

                userBoxes.forEach(b => {
                    drawBox(b.box, b.color, b.label || '');
                });
            }
        };

        useEffect(() => {
            const img = imgRef.current;
            if (!img) return;
            // Handle load
            const handleLoad = () => drawOverlay();

            if (img.complete) handleLoad();
            img.addEventListener('load', handleLoad);
            window.addEventListener('resize', drawOverlay);
            return () => {
                img.removeEventListener('load', handleLoad);
                window.removeEventListener('resize', drawOverlay);
            };
        }, [userBoxes, aiBox, viewMode]); // calculatedIoU excluded to prevent loop

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex overflow-hidden h-[600px]">

                    {/* Left: Visualization (Consistent across modes) */}
                    <div className="w-2/3 bg-black relative flex items-center justify-center p-4">
                        <div className="relative max-w-full max-h-full inline-block">
                            <img
                                ref={imgRef}
                                src={viewMode === 'heatmap' && heatmapPath ? heatmapPath : imageSrc}
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
                                    <h2 className="text-xl font-bold mb-4">AI Elemzés</h2>

                                    {/* Heatmap Toggle */}
                                    {/* View Selector (Heatmap | AI | Original) */}
                                    {/* View Selector (Circular Toggle Button) */}
                                    {heatmapPath && (
                                        <button
                                            onClick={() => {
                                                setViewMode((prev) => {
                                                    if (prev === 'heatmap') return 'ai';
                                                    if (prev === 'ai') return 'original';
                                                    return 'heatmap';
                                                });
                                            }}
                                            className="w-full bg-gray-100 p-1.5 rounded-full flex items-center justify-between relative shadow-inner mb-6 hover:bg-gray-200/80 transition-colors cursor-pointer group"
                                            title="Kattintson a nézet váltásához"
                                        >
                                            {/* Heatmap Icon */}
                                            <div className={`flex-1 flex items-center justify-center h-10 rounded-full transition-all duration-300 relative z-10 
                                                ${viewMode === 'heatmap' ? 'bg-white shadow-md scale-100' : 'scale-90 opacity-50 group-hover:opacity-70'}`}>
                                                <Flame size={20} className={`transition-colors duration-300 ${viewMode === 'heatmap' ? 'text-gray-900' : 'text-gray-500'}`} />
                                            </div>

                                            {/* AI Analysis Icon */}
                                            <div className={`flex-1 flex items-center justify-center h-10 rounded-full transition-all duration-300 relative z-10 
                                                ${viewMode === 'ai' ? 'bg-white shadow-md scale-100' : 'scale-90 opacity-50 group-hover:opacity-70'}`}>
                                                <Zap size={20} className={`transition-colors duration-300 ${viewMode === 'ai' ? 'text-gray-900' : 'text-gray-500'}`} />
                                            </div>

                                            {/* Original Image Icon */}
                                            <div className={`flex-1 flex items-center justify-center h-10 rounded-full transition-all duration-300 relative z-10 
                                                ${viewMode === 'original' ? 'bg-white shadow-md scale-100' : 'scale-90 opacity-50 group-hover:opacity-70'}`}>
                                                <ImageIcon size={20} className={`transition-colors duration-300 ${viewMode === 'original' ? 'text-gray-900' : 'text-gray-500'}`} />
                                            </div>
                                        </button>
                                    )}

                                    <div className="space-y-3 text-sm">
                                        {/* Breakdown of Overlaps (Symptoms 1 & 2) */}
                                        {userBoxes.map((box) => (
                                            <div key={box.id} className="flex justify-between items-center border-b pb-2">
                                                <span className="text-gray-600">Átfedés ({box.label}. Tünet):</span>
                                                <span className="font-bold text-lg">{Math.round((symptomIoUs[box.id] || 0) * 100)}%</span>
                                            </div>
                                        ))}

                                        {/* AI Confidence */}
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="text-gray-600">Az AI magabiztossága:</span>
                                            <span className="font-bold text-lg">{Math.round(aiConfidence * 100)}%</span>
                                        </div>

                                        {/* AI Prediction - Highlighted with dark background */}
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-gray-600">Az AI diagnózisa:</span>
                                            <span className="bg-gray-900 text-white px-3 py-1 rounded font-bold text-lg">
                                                {aiPrediction === 'igen' ? 'Pozitív' : 'Negatív'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <label className="flex items-center text-sm font-bold mb-2 text-gray-700">
                                        Végleges döntés:
                                        <HelpTooltip text="Erősítse meg vagy módosítsa a diagnózisát az AI elemzésének megismerése után." align="right" />
                                    </label>
                                    <select
                                        value={decision}
                                        onChange={(e) => setDecision(e.target.value as 'igen' | 'nem')}
                                        className="w-full p-4 border rounded-xl mb-6 text-lg font-medium bg-white"
                                    >
                                        <option value="igen">Pozitív</option>
                                        <option value="nem">Negatív</option>
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
                                    Az VÉGSŐ döntésed: <span className="bg-gray-900 text-white px-2 py-1 rounded font-bold">{decision === 'igen' ? 'Pozitív' : 'Negatív'}</span>
                                </p>

                                <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center">
                                    Mennyire vagy biztos a döntésedben?
                                    <HelpTooltip text="Jelöld meg, mennyire vagy biztos a döntésedben, miután figyelembe vetted az AI visszajelzését. 1: Bizonytalan, 7: Teljesen biztos." align="right" />
                                </h3>

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

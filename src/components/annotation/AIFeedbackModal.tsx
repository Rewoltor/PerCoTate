import React, { useRef, useEffect, useState } from 'react';
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

export const AIFeedbackModal: React.FC<AIFeedbackModalProps> = ({
    imageSrc,
    userBox,
    aiBox,
    aiPrediction,
    aiConfidence,
    iouPercent,
    initialDecision,
    // heatmapPath,
    onRevise,
    onContinue,
}) => {
    const [decision, setDecision] = useState<'igen' | 'nem'>(initialDecision || aiPrediction);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full flex overflow-hidden">

                {/* Left: Visualization */}
                <div className="w-2/3 bg-black relative flex items-center justify-center border-r border-gray-200">
                    {/* If we have a heatmap, show it overlaid? Or just raw image? Plan says Heatmap overlay. 
                 Assuming heatmapPath is a transparent PNG or similar. If simpler, just show Raw + Box. 
                 Let's assume just Raw + Box for now based on Plan Phase 4 "AI Feedback Modal: AI heatmap overlay"
                 If heatmap is provided, we use it as background or detailed view.
             */}
                    <div className="relative">
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Feedback"
                            className="max-h-[80vh] object-contain"
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />
                    </div>
                </div>

                {/* Right: Stats & Controls */}
                <div className="w-1/3 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">AI Elemzés (Analysis)</h2>

                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <span>Átfedés (IoU):</span>
                                <span className="font-bold text-xl">{Math.round(iouPercent)}%</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <span>AI Predikció:</span>
                                <span className={`font-bold text-lg ${aiPrediction === 'igen' ? 'text-red-600' : 'text-green-600'}`}>
                                    {aiPrediction.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <span>AI Biztonság:</span>
                                <span className="font-bold text-lg">{Math.round(aiConfidence * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="block text-sm font-semibold mb-2">Végleges döntés (Final Decision):</label>
                        <select
                            value={decision}
                            onChange={(e) => setDecision(e.target.value as 'igen' | 'nem')}
                            className="w-full p-3 border rounded-md mb-4 text-lg font-medium"
                        >
                            <option value="igen">IGEN (Arthritis)</option>
                            <option value="nem">NEM (No Arthritis)</option>
                        </select>

                        <button
                            onClick={() => {
                                onRevise(decision);
                                onContinue();
                            }}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Tovább (Continue) →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

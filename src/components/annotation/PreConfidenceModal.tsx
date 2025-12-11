
import React, { useRef, useEffect } from 'react';
import type { ColoredBox } from '../common/BBoxTool';
import type { Box } from '../../utils/math';

interface PreConfidenceModalProps {
    imageSrc: string;
    userBoxes: ColoredBox[];
    activeDiagnosis: 'igen' | 'nem';
    onConfidenceSelect: (conf: number) => void;
}

export const PreConfidenceModal: React.FC<PreConfidenceModalProps> = ({
    imageSrc,
    userBoxes,
    activeDiagnosis,
    onConfidenceSelect,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reuse similar drawing logic as AIFeedbackModal but only for User Box
    const drawOverlay = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawBox = (box: Box, color: string, label: string) => {
            const scaleX = img.clientWidth / img.naturalWidth;
            const scaleY = img.clientHeight / img.naturalHeight;

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY);

            ctx.fillStyle = color;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(label, (box.x * scaleX) + 5, (box.y * scaleY) + 20);
        };

        userBoxes.forEach(b => {
            drawBox(b.box, b.color, `Ön (${b.label})`);
        });
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
    }, [userBoxes]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex overflow-hidden h-[600px]">

                {/* Left: Visualization */}
                <div className="w-2/3 bg-black relative flex items-center justify-center p-4">
                    {/* Wrapper div to ensure canvas fits image exactly */}
                    <div className="relative max-w-full max-h-full inline-block">
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Review"
                            className="max-h-full max-w-full object-contain block" // block removes bottom spacing
                            style={{ maxHeight: '568px' }} // explicitly constrain height to container padding
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-1/3 p-8 flex flex-col justify-center bg-gray-50">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Első Döntés Megerősítése</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Ön <strong className={activeDiagnosis === 'nem' ? 'text-green-600' : 'text-red-600'}>
                            {activeDiagnosis.toUpperCase()}
                        </strong> diagnózist jelölt.
                    </p>

                    <h3 className="text-lg font-bold mb-4 text-gray-700">Mennyire biztos a döntésében?</h3>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                            <button
                                key={num}
                                onClick={() => onConfidenceSelect(num)}
                                className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 font-bold text-xl transition-all flex items-center justify-center text-gray-700"
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
            </div>
        </div>
    );
};

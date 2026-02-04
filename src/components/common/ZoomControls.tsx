import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    min?: number;
    max?: number;
    step?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    zoom,
    onZoomIn,
    onZoomOut,
    min = 100,
    max = 200,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const isAtMin = zoom <= min;
    const isAtMax = zoom >= max;

    return (
        <div
            className="absolute bottom-6 left-6 flex flex-col gap-2 z-10"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Zoom In Button */}
            <button
                onClick={onZoomIn}
                disabled={isAtMax}
                className={`
                    w-12 h-12 rounded-full 
                    flex items-center justify-center
                    backdrop-blur-md shadow-lg
                    transition-all duration-200
                    ${isAtMax
                        ? 'bg-gray-300/50 text-gray-400 cursor-not-allowed'
                        : 'bg-white/80 text-gray-900 hover:bg-white hover:scale-110 active:scale-95'
                    }
                `}
                title="Nagyítás"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

            {/* Zoom Out Button */}
            <button
                onClick={onZoomOut}
                disabled={isAtMin}
                className={`
                    w-12 h-12 rounded-full 
                    flex items-center justify-center
                    backdrop-blur-md shadow-lg
                    transition-all duration-200
                    ${isAtMin
                        ? 'bg-gray-300/50 text-gray-400 cursor-not-allowed'
                        : 'bg-white/80 text-gray-900 hover:bg-white hover:scale-110 active:scale-95'
                    }
                `}
                title="Kicsinyítés"
            >
                <Minus size={24} strokeWidth={2.5} />
            </button>

            {/* Zoom Percentage Tooltip */}
            {showTooltip && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                    {zoom}%
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-black/90" />
                </div>
            )}
        </div>
    );
};

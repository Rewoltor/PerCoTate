import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
    text: string;
    align?: 'left' | 'center' | 'right';
    position?: 'top' | 'bottom';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
    text,
    align = 'center',
    position = 'top'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionClasses = () => {
        let classes = "absolute w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none ";

        // Vertical position
        if (position === 'top') {
            classes += "bottom-full mb-2 ";
        } else {
            classes += "top-full mt-2 ";
        }

        // Horizontal alignment
        if (align === 'center') {
            classes += "left-1/2 -translate-x-1/2 ";
        } else if (align === 'right') {
            classes += "right-0 ";
        } else {
            classes += "left-0 ";
        }

        return classes;
    };

    const getArrowClasses = () => {
        let classes = "content-[''] absolute border-4 border-transparent ";

        if (position === 'top') {
            classes += "top-full border-t-gray-800 ";
        } else {
            classes += "bottom-full border-b-gray-800 ";
        }

        if (align === 'center') {
            classes += "left-1/2 -translate-x-1/2 ";
        } else if (align === 'right') {
            classes += "right-[5px] ";
        } else {
            classes += "left-[5px] ";
        }

        return classes;
    };

    return (
        <div
            className="relative inline-flex items-center ml-2 cursor-help group align-middle"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={(e) => {
                e.stopPropagation();
                setIsVisible(!isVisible);
            }}
        >
            <HelpCircle size={18} className="text-gray-400 hover:text-gray-600 transition-colors" />

            {isVisible && (
                <div className={getPositionClasses()}>
                    <span className={getArrowClasses()}></span>
                    {text}
                </div>
            )}
        </div>
    );
};

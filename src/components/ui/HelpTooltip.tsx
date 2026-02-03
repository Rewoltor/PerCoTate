import React, { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
    content: React.ReactNode;
    className?: string;
    align?: 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, className = '', align = 'right' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Also close on escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsVisible(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            ref={tooltipRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                }}
                className={`
                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                    ${isVisible
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1
                `}
                aria-label="Segítség"
                aria-expanded={isVisible}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75" />
                    <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none" />
                </svg>
            </button>

            {isVisible && (
                <div
                    className={`
                        absolute top-full mt-3 w-72 p-4 bg-white rounded-xl shadow-2xl border border-gray-100 
                        z-50 text-left animate-in fade-in zoom-in-95 duration-200 origin-top
                        ${align === 'right' ? 'right-0' : 'left-0'}
                    `}
                    role="tooltip"
                >
                    {/* Small arrow pointing up */}
                    <div
                        className={`
                            absolute -top-1.5 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45
                            ${align === 'right' ? 'right-1.5' : 'left-1.5'}
                        `}
                    />

                    <div className="relative z-10 text-sm text-gray-600 leading-relaxed font-normal">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};

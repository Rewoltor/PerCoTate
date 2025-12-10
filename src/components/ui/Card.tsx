import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

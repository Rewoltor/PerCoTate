import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface IntroPageProps {
    title: string;
    description: string;
    onComplete: () => void;
    buttonText?: string;
    icon?: React.ReactNode;
}

// Simple function to parse markdown-style bold text
const parseDescription = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
        // Check if line contains bold markdown
        if (line.includes('**')) {
            const parts = line.split('**');
            return (
                <p key={index} className="mb-2">
                    {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-800">{part}</strong> : part
                    )}
                </p>
            );
        }
        // Regular line
        return line.trim() ? <p key={index} className="mb-2">{line}</p> : <br key={index} />;
    });
};

export const IntroPage: React.FC<IntroPageProps> = ({
    title,
    description,
    onComplete,
    buttonText = "Tovább",
    icon
}) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-2xl w-full text-center p-12 shadow-xl border-t-4 border-indigo-500">
                {icon && <div className="mb-6 flex justify-center">{icon}</div>}

                <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

                <div className="prose prose-lg mx-auto text-gray-600 mb-10 leading-relaxed text-left">
                    {parseDescription(description)}
                </div>

                <Button
                    onClick={onComplete}
                    className="w-full md:w-auto px-12 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                >
                    {buttonText} →
                </Button>
            </Card>
        </div>
    );
};

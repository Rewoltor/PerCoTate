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

                <div className="prose prose-lg mx-auto text-gray-600 mb-10 leading-relaxed whitespace-pre-line">
                    {description}
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

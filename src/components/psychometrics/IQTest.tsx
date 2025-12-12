import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { IQResponse } from '../../types';

interface IQTestProps {
    onComplete: () => void;
}

// We work with items 1-5 for now
const TOTAL_ITEMS = 5;
const OPTIONS_PER_ITEM = 6;
const TIME_LIMIT_SECONDS = 10 * 60; // 10 minutes global limit

export const IQTest: React.FC<IQTestProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();

    // State
    const [questionOrder, setQuestionOrder] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: number]: number }>({}); // qID -> selected option (1-6)
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [finished, setFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Initialize Random Order on Mount
    useEffect(() => {
        const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => i + 1);
        // Fisher-Yates Shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setQuestionOrder(items);
    }, []);

    // Timer
    useEffect(() => {
        if (finished) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setFinished(true); // Auto-finish
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [finished]);

    const handleSelect = (optionIndex: number) => {
        const currentQId = questionOrder[currentIndex];
        setAnswers(prev => ({ ...prev, [currentQId]: optionIndex }));
    };

    const handleNext = () => {
        if (currentIndex < questionOrder.length - 1) {
            setCurrentIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            setFinished(true);
        }
    };

    // Since we don't have the "correct" usage defined for real images yet, 
    // we save the raw answers and calculate score later or just save all data.
    // For now we will save 'score' as 0 or calculate if we knew the keys.
    const submit = async () => {
        if (!user) return;
        setSubmitting(true);

        try {
            const iqData: IQResponse = {
                answers, // Save the map of QuestionID -> SelectedOption
                questionOrder, // Save the order presented
                completedAt: Date.now(),
                timeRemaining: timeLeft
            };

            // Using 'iq' field but now storing richer data.
            // Note: Types might need update if strict validation is on, but Firestore is flexible.
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                iq: iqData
            }, { merge: true });

            await refreshUser();
            onComplete();
        } catch (e) {
            console.error(e);
            alert("Hiba a mentéskor.");
        } finally {
            setSubmitting(false);
        }
    };

    // Trigger submission when finished
    useEffect(() => {
        if (finished && questionOrder.length > 0) {
            submit();
        }
    }, [finished, questionOrder]);

    if (questionOrder.length === 0) return <div className="p-8 text-center">Betöltés...</div>;
    if (finished && submitting) return <div className="text-center p-8 text-xl font-bold text-gray-700">Eredmények mentése...</div>;

    const currentQId = questionOrder[currentIndex];
    // Assuming options are always 1..6
    const options = Array.from({ length: OPTIONS_PER_ITEM }, (_, i) => i + 1);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const selectedOption = answers[currentQId];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Logika Teszt</h2>
                    <div className={`font-mono font-bold text-xl px-4 py-2 rounded-lg bg-gray-50 ${timeLeft < 60 ? 'text-red-500 bg-red-50' : 'text-gray-700'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress */}
                <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-500 font-medium">Kérdés {currentIndex + 1} / {TOTAL_ITEMS}</span>
                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / TOTAL_ITEMS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Image */}
                <div className="mb-4 lg:mb-6 p-1 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-center">
                    <img
                        src={`/cognitivePics/${currentQId}.png`}
                        alt={`Question ${currentQId}`}
                        className="max-h-[200px] lg:max-h-[260px] w-auto object-contain"
                    />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-6 lg:mb-8">
                    {options.map(optNum => (
                        <button
                            key={optNum}
                            onClick={() => handleSelect(optNum)}
                            className={`
                                relative p-0.5 lg:p-1 rounded-lg transition-all duration-200 border-2
                                flex items-center justify-center overflow-hidden bg-white
                                hover:border-blue-300 hover:shadow-md
                                ${selectedOption === optNum
                                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-lg scale-[1.02]'
                                    : 'border-gray-200'
                                }
                            `}
                        >
                            <img
                                src={`/cognitivePics/${currentQId}.${optNum}.png`}
                                alt={`Option ${optNum}`}
                                className="w-full h-20 lg:h-28 object-contain"
                            />
                            {/* Selection Indicator overlay */}
                            {selectedOption === optNum && (
                                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                    <div className="bg-blue-600 text-white rounded-full p-1 lg:p-2 shadow-sm scale-75 lg:scale-100">
                                        <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer / Navigation */}
                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className="w-full sm:w-auto px-10 text-lg py-3"
                    >
                        {currentIndex === TOTAL_ITEMS - 1 ? 'Befejezés' : 'Következő →'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

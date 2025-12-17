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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 lg:p-4">
            <Card className="max-w-6xl w-full flex flex-col h-[90vh] lg:h-auto max-h-[900px]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Logika Teszt</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Haladás</span>
                            <span className="text-sm font-bold text-gray-700">{currentIndex + 1} / {TOTAL_ITEMS}</span>
                        </div>
                        <div className={`font-mono font-bold text-xl px-4 py-2 rounded-xl bg-gray-50 flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500 bg-red-50' : 'text-gray-900'}`}>
                            <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Progress Line */}
                <div className="h-1 w-full bg-gray-100 shrink-0">
                    <div
                        className="h-full bg-gray-900 transition-all duration-500 ease-out"
                        style={{ width: `${((currentIndex + 1) / TOTAL_ITEMS) * 100}%` }}
                    />
                </div>

                {/* Main Content Body */}
                <div className="flex-1 overflow-y-auto lg:overflow-visible p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row gap-8 h-full">

                        {/* LEFT: Question Image Area (Larger) */}
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-4 lg:p-8 min-h-[300px]">
                            <img
                                src={`/cognitivePics/${currentQId}.png`}
                                alt={`Question ${currentQId}`}
                                className="max-w-full max-h-full object-contain shadow-sm rounded-lg"
                                style={{ maxHeight: '400px' }}
                            />
                        </div>

                        {/* RIGHT: Options & Actions (Sidebar on Desktop) */}
                        <div className="lg:w-[400px] xl:w-[450px] flex flex-col shrink-0">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Válaszlehetőségek</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {options.map(optNum => (
                                        <button
                                            key={optNum}
                                            onClick={() => handleSelect(optNum)}
                                            className={`
                                                relative h-32 rounded-xl transition-all duration-200 border-2
                                                flex items-center justify-center overflow-hidden bg-white
                                                group
                                                ${selectedOption === optNum
                                                    ? 'border-gray-900 bg-gray-50 shadow-md ring-1 ring-gray-900'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <img
                                                src={`/cognitivePics/${currentQId}.${optNum}.png`}
                                                alt={`Option ${optNum}`}
                                                className="w-full h-full object-contain p-2"
                                            />

                                            {/* Checkmark Badge */}
                                            {selectedOption === optNum && (
                                                <div className="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-1 shadow-sm">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <Button
                                    onClick={handleNext}
                                    disabled={!selectedOption}
                                    className="w-full py-4 text-lg"
                                >
                                    {currentIndex === TOTAL_ITEMS - 1 ? 'Teszt Befejezése' : 'Következő Kérdés →'}
                                </Button>
                                <div className="mt-2 h-4">
                                    {!selectedOption && (
                                        <p className="text-center text-xs text-gray-400">
                                            Válassz egy lehetőséget a folytatáshoz
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

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

type Question = {
    id: string;
    imageSrc: string;
    correctAnswer: string;
    options: string[];
};

const rawQuestions: Question[] = [
    { id: "R3D.61", imageSrc: "/CognitiveAssets/fig11061.png", correctAnswer: "F", options: ["A", "B", "C", "D", "E", "F", "G", "H"] },
    { id: "R3D.62", imageSrc: "/CognitiveAssets/fig11062.png", correctAnswer: "A", options: ["A", "B", "C", "D", "E", "F", "G", "H"] },
    { id: "R3D.63", imageSrc: "/CognitiveAssets/fig11063.png", correctAnswer: "A", options: ["A", "B", "C", "D", "E", "F", "G", "H"] },
    { id: "R3D.64", imageSrc: "/CognitiveAssets/fig11064.png", correctAnswer: "E", options: ["A", "B", "C", "D", "E", "F", "G", "H"] },
    { id: "R3D.65", imageSrc: "/CognitiveAssets/fig11065.png", correctAnswer: "C", options: ["A", "B", "C", "D", "E", "F", "G", "H"] },
    { id: "R3D.66", imageSrc: "/CognitiveAssets/fig11066.png", correctAnswer: "G", options: ["A", "B", "C", "D", "E", "F", "G", "H"] }
];

const TIME_LIMIT_SECONDS = 10 * 60; // 6 minutes global limit

export const IQTest: React.FC<IQTestProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();

    // State
    const [questionOrder, setQuestionOrder] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [finished, setFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Initialize Random Order on Mount
    useEffect(() => {
        const ids = rawQuestions.map(q => q.id);
        // Fisher-Yates Shuffle
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        setQuestionOrder(ids);
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

    // Handle Finish
    useEffect(() => {
        if (finished && questionOrder.length > 0) {
            submit();
        }
    }, [finished, questionOrder]);

    const handleSelect = (optionLabel: string) => {
        const currentQId = questionOrder[currentIndex];
        setAnswers(prev => ({ ...prev, [currentQId]: optionLabel }));
    };

    const handleNext = () => {
        if (currentIndex < questionOrder.length - 1) {
            setCurrentIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            setFinished(true);
        }
    };

    const submit = async () => {
        if (!user) return;
        setSubmitting(true);

        // Calculate Score
        let score = 0;
        questionOrder.forEach(qId => {
            const question = rawQuestions.find(q => q.id === qId);
            const userAnswer = answers[qId];
            if (question && userAnswer === question.correctAnswer) {
                score += 1;
            }
        });

        try {
            const iqData: IQResponse = {
                answers,
                questionOrder,
                completedAt: Date.now(),
                timeRemaining: timeLeft,
                score
            };

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

    if (questionOrder.length === 0) return <div className="p-8 text-center">Betöltés...</div>;
    if (finished && submitting) return <div className="text-center p-8 text-xl font-bold text-gray-700">Eredmények mentése...</div>;

    const currentQId = questionOrder[currentIndex];
    const currentQuestion = rawQuestions.find(q => q.id === currentQId);

    if (!currentQuestion) return <div>Hiba: Kérdés nem található</div>;

    const selectedOption = answers[currentQId];

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 lg:p-4">
            <Card className="max-w-[98vw] w-full flex flex-col h-[98vh] lg:h-auto max-h-[1400px]">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Térbeli Logika Teszt</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Haladás</span>
                            {/* Updated to show total as rawQuestions.length (which is 6) */}
                            <span className="text-sm font-bold text-gray-700">{currentIndex + 1} / {rawQuestions.length}</span>
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
                        className="h-full bg-teal-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentIndex + 1) / rawQuestions.length) * 100}%` }}
                    />
                </div>

                {/* Main Content Body */}
                <div className="flex-1 overflow-y-auto lg:overflow-visible p-2 lg:p-4">
                    <div className="flex flex-col lg:flex-row gap-4 h-full">

                        {/* LEFT: Question Image Area (Larger) */}
                        <div className="relative flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-1 lg:p-2 min-h-[400px] shadow-sm">
                            <img
                                src={currentQuestion.imageSrc}
                                alt={`Question ${currentQId}`}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                style={{ maxHeight: '85vh' }}
                            />
                            {CONFIG.IS_DEBUG_MODE && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md opacity-80 pointer-events-none">
                                    DEBUG: {currentQuestion.imageSrc.split('/').pop()}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Options & Actions (Sidebar on Desktop) */}
                        <div className="lg:w-[180px] xl:w-[220px] flex flex-col shrink-0">
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Válaszlehetőségek</h3>
                                <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
                                    {/* Mobile: 2 rows of 4. Desktop: 4 rows of 2. */}
                                    {currentQuestion.options.map(optLabel => (
                                        <button
                                            key={optLabel}
                                            onClick={() => handleSelect(optLabel)}
                                            className={`
                                                relative h-10 rounded-lg transition-all duration-200 border
                                                flex items-center justify-center font-bold text-base
                                                ${selectedOption === optLabel
                                                    ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-600'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {optLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <Button
                                    onClick={handleNext}
                                    disabled={!selectedOption}
                                    className="w-full py-4 text-lg bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {currentIndex === rawQuestions.length - 1 ? 'Teszt Befejezése' : 'Következő'}
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

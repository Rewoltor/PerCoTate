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

// Mock Questions - In reality these would be image paths
const IQ_QUESTIONS = [
    { id: 1, correct: 'A', options: ['A', 'B', 'C', 'D'] },
    { id: 2, correct: 'B', options: ['A', 'B', 'C', 'D'] },
    { id: 3, correct: 'C', options: ['A', 'B', 'C', 'D'] },
    { id: 4, correct: 'D', options: ['A', 'B', 'C', 'D'] },
    { id: 5, correct: 'A', options: ['A', 'B', 'C', 'D'] },
];

const TIME_LIMIT_SECONDS = 10 * 60; // 10 minutes global limit

export const IQTest: React.FC<IQTestProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [finished, setFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

    const handleSelect = (option: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion + 1]: option }));
    };

    const handleNext = () => {
        if (currentQuestion < IQ_QUESTIONS.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setFinished(true);
        }
    };

    const calculateScore = () => {
        let score = 0;
        IQ_QUESTIONS.forEach(q => {
            if (answers[q.id] === q.correct) score++;
        });
        return score;
    };

    const submit = async () => {
        if (!user) return;
        setSubmitting(true);
        const score = calculateScore();

        try {
            const iqData: IQResponse = {
                score,
                completedAt: Date.now()
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

    // Trigger submission when finished
    useEffect(() => {
        if (finished) {
            submit();
        }
    }, [finished]);

    if (finished && submitting) return <div className="text-center p-8 text-xl font-bold text-gray-700">Eredmények mentése...</div>;

    const q = IQ_QUESTIONS[currentQuestion];
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Logika Teszt (Raven)</h2>
                    <div className={`font-mono font-bold text-xl px-4 py-2 rounded-lg bg-gray-50 ${timeLeft < 60 ? 'text-red-500 bg-red-50' : 'text-gray-700'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500 font-medium">Kérdés {currentQuestion + 1} / {IQ_QUESTIONS.length}</span>
                        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / IQ_QUESTIONS.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white border-2 border-gray-100 h-64 flex items-center justify-center mb-8 rounded-xl shadow-inner text-gray-400 font-medium bg-gray-50/50">
                        [Raven Mátrix Kép #{q.id} Helye]
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {q.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`p-6 border-2 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-[1.02] 
                                    ${answers[q.id] === opt
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                        onClick={handleNext}
                        disabled={!answers[q.id]}
                        className="w-full sm:w-auto px-10"
                    >
                        {currentQuestion === IQ_QUESTIONS.length - 1 ? 'Befejezés' : 'Következő →'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

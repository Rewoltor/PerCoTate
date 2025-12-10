import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
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
    const { user } = useAuth();
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

    if (finished && submitting) return <div className="text-center p-8">Eredmények mentése...</div>;

    const q = IQ_QUESTIONS[currentQuestion];
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow text-center">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold">Logika Teszt (Raven)</h2>
                <div className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                    Idő: {formatTime(timeLeft)}
                </div>
            </div>

            <div className="mb-8">
                <p className="mb-4 text-gray-600">
                    Kérdés {currentQuestion + 1} / {IQ_QUESTIONS.length}
                </p>

                <div className="bg-gray-200 h-64 flex items-center justify-center mb-6 rounded text-gray-500">
                    [Ide jönne a Raven Mátrix Kép #{q.id}]
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {q.options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className={`p-4 border rounded font-bold transition-colors ${answers[q.id] === opt
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            Opció {opt}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={!answers[q.id]}
                className="px-8 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50"
            >
                {currentQuestion === IQ_QUESTIONS.length - 1 ? 'Befejezés' : 'Következő'}
            </button>
        </div>
    );
};

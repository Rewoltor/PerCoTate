import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Big5Response } from '../../types';

interface Big5TestProps {
    onComplete: () => void;
}

const QUESTIONS = [
    "Én vagyok a társaság lelke.",
    "Kevésbé érdekelnek mások problémái.",
    "Mindig felkészült vagyok.",
    "Könnyen zavarba jövök.",
    "Gazdag szókinccsel rendelkezem.",
    // Total 20 items (2 pages of 10)
    ...Array.from({ length: 15 }, (_, i) => `Big 5 Teszt Kérdés #${i + 6} (Placeholder)`)
];

const ITEMS_PER_PAGE = 10;

export const Big5Test: React.FC<Big5TestProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();
    const [responses, setResponses] = useState<Big5Response>({}); // ... rest of state

    // ... (lines 29-79 unchanged)
    const [currentPage, setCurrentPage] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const totalPages = Math.ceil(QUESTIONS.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const currentQuestions = QUESTIONS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset error state when page changes
    useEffect(() => {
        setShowErrors(false);
    }, [currentPage]);

    const handleResponse = (qIndex: number, value: number) => {
        setResponses(prev => ({
            ...prev,
            [`q_${qIndex}`]: value
        }));
    };

    const getUnansweredQuestions = () => {
        const missing = [];
        for (let i = 0; i < currentQuestions.length; i++) {
            const globalIndex = startIndex + i;
            if (!responses[`q_${globalIndex}`]) {
                missing.push(globalIndex);
            }
        }
        return missing;
    };

    const handleNext = () => {
        const missing = getUnansweredQuestions();
        if (missing.length > 0) {
            setShowErrors(true);
            // Scroll to the first missing question
            const firstMissingElement = document.getElementById(`question-${missing[0]}`);
            if (firstMissingElement) {
                firstMissingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            submitResults();
        }
    };

    const submitResults = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                big5: responses
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="Személyiségteszt (Big 5)" className="max-w-3xl w-full">
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                    Kérjük, jelölje meg, mennyire jellemző Önre az állítás (1 = Egyáltalán nem, 5 = Teljes mértékben).
                </div>

                <div className="space-y-8">
                    {currentQuestions.map((q, i) => {
                        const globalIndex = startIndex + i;
                        const val = responses[`q_${globalIndex}`];
                        const isMissing = showErrors && !val;

                        return (
                            <div
                                id={`question-${globalIndex}`}
                                key={globalIndex}
                                className={`
                                    border-b pb-6 last:border-0 transition-colors p-4 rounded-xl
                                    ${isMissing ? 'bg-red-50 border-red-100' : 'border-gray-100'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <p className={`font-bold text-lg ${isMissing ? 'text-red-700' : 'text-gray-800'}`}>
                                        {globalIndex + 1}. {q}
                                    </p>
                                    {isMissing && (
                                        <span className="text-red-600 text-xs font-bold uppercase bg-red-100 px-2 py-1 rounded">
                                            Kötelező
                                        </span>
                                    )}
                                </div>

                                <div className={`flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl gap-4 ${isMissing ? 'ring-2 ring-red-200' : ''}`}>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Egyáltalán nem</span>

                                    <div className="flex gap-2 sm:gap-4">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => handleResponse(globalIndex, rating)}
                                                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all transform hover:scale-105 duration-200 shadow-sm
                                                    ${val === rating
                                                        ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                                        : isMissing
                                                            ? 'bg-white text-gray-600 border-2 border-red-300 hover:border-red-400 hover:bg-red-50'
                                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>

                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Teljes mértékben</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Oldal {currentPage + 1} / {totalPages}</span>
                    <Button
                        onClick={handleNext}
                        isLoading={submitting}
                        className="px-8"
                    >
                        {currentPage === totalPages - 1 ? 'Befejezés' : 'Következő →'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

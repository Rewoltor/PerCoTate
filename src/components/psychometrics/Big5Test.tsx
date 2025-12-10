import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
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
    // ... Ideally 50 items. For prototype we use a subset or placeholder generator
    ...Array.from({ length: 45 }, (_, i) => `Big 5 Teszt Kérdés #${i + 6} (Placeholder)`)
];

const ITEMS_PER_PAGE = 10;

export const Big5Test: React.FC<Big5TestProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [responses, setResponses] = useState<Big5Response>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const totalPages = Math.ceil(QUESTIONS.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const currentQuestions = QUESTIONS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleResponse = (qIndex: number, value: number) => {
        setResponses(prev => ({
            ...prev,
            [`q_${qIndex}`]: value
        }));
    };

    const isPageComplete = () => {
        for (let i = 0; i < currentQuestions.length; i++) {
            const globalIndex = startIndex + i;
            if (!responses[`q_${globalIndex}`]) return false;
        }
        return true;
    };

    const handleNext = () => {
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
            onComplete();
        } catch (e) {
            console.error(e);
            alert("Hiba a mentéskor.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-2">Személyiségteszt (Big 5)</h2>
            <p className="text-gray-600 mb-8">Kérjük, jelölje meg, mennyire jellemző Önre az állítás (1 = Egyáltalán nem, 5 = Teljes mértékben).</p>

            <div className="space-y-8">
                {currentQuestions.map((q, i) => {
                    const globalIndex = startIndex + i;
                    const val = responses[`q_${globalIndex}`];
                    return (
                        <div key={globalIndex} className="border-b pb-4">
                            <p className="font-medium mb-3">{globalIndex + 1}. {q}</p>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-xs text-gray-500">Nem jellemző</span>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <label key={rating} className="flex flex-col items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`q_${globalIndex}`}
                                                value={rating}
                                                checked={val === rating}
                                                onChange={() => handleResponse(globalIndex, rating)}
                                                className="w-5 h-5 mb-1"
                                            />
                                            <span className="text-sm">{rating}</span>
                                        </label>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">Teljesen jellemző</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <span className="text-gray-500">Oldal {currentPage + 1} / {totalPages}</span>
                <button
                    onClick={handleNext}
                    disabled={!isPageComplete() || submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded font-bold disabled:opacity-50"
                >
                    {currentPage === totalPages - 1 ? (submitting ? 'Mentés...' : 'Befejezés') : 'Következő →'}
                </button>
            </div>
        </div>
    );
};

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
    { "id": 1, "text": "Társaságkedvelő" },
    { "id": 2, "text": "Könyörületes, lágyszívű" },
    { "id": 3, "text": "Hajlamos a szervezetlenségre" },
    { "id": 4, "text": "Nyugodt, jól kezeli a stresszt" },
    { "id": 5, "text": "Kevés művészi érdeklődése van" },
    { "id": 6, "text": "Önérvényesítő személyiséggel rendelkezik" },
    { "id": 7, "text": "Tiszteletteljes, tisztelettel bánik másokkal" },
    { "id": 8, "text": "Hajlamos a lustaságra" },
    { "id": 9, "text": "Optimista marad az átélt nehézségek után" },
    { "id": 10, "text": "Sok, különböző dologra kíváncsi" },
    { "id": 11, "text": "Ritkán él át izgalmat vagy lekesedést" },
    { "id": 12, "text": "Hajlamos mások hibáit keresni" },
    { "id": 13, "text": "Megbízható, stabil" },
    { "id": 14, "text": "Szeszélyes, hangulatingadozásai vannak" },
    { "id": 15, "text": "Találékony, ügyesen rájön, hogyan csinálja a dolgokat" },
    { "id": 16, "text": "Jellemzően csendes" },
    { "id": 17, "text": "Kevés szimpátiát érez mások iránt" },
    { "id": 18, "text": "Rendszerezett, szereti rendben tartani a dolgokat" },
    { "id": 19, "text": "Feszült tud lenni" },
    { "id": 20, "text": "Lenyűgöz a művészet, a zene vagy az irodalom" },
    { "id": 21, "text": "Domináns, vezetőként viselkedik" },
    { "id": 22, "text": "Vitába száll másokkal" },
    { "id": 23, "text": "Nehezen kezd bele a feladatokba" },
    { "id": 24, "text": "Biztonságban, jól érzi magát a bőrében" },
    { "id": 25, "text": "Kerüli az intellektuális, filozofikus beszélgetéseket" },
    { "id": 26, "text": "Kevésbé aktív, mint mások" },
    { "id": 27, "text": "Megbocsátó természete van" },
    { "id": 28, "text": "Kissé érzéketlen tud lenni" },
    { "id": 29, "text": "Érzelmileg stabil, nem lehet könnyen felbosszantani" },
    { "id": 30, "text": "Nem túl kreatív" },
    { "id": 31, "text": "Néha szégyellős, befelé forduló" },
    { "id": 32, "text": "Segítőkész és önzetlen másokkal" },
    { "id": 33, "text": "Tisztán és rendezetten tartja a dolgokat" },
    { "id": 34, "text": "Sokat aggódik" },
    { "id": 35, "text": "Értékeli a művészetet és a szépséget" },
    { "id": 36, "text": "Nehezen tudja befolyásolni az embereket" },
    { "id": 37, "text": "Néha goromba másokkal" },
    { "id": 38, "text": "Hatékony, elvégzi a feladatait" },
    { "id": 39, "text": "Gyakran érzi magát szomorúnak" },
    { "id": 40, "text": "Összetett, mély gondolkodó" },
    { "id": 41, "text": "Tele van energiával" },
    { "id": 42, "text": "Gyanakvó mások szándékaival szemben" },
    { "id": 43, "text": "Megbízható, mindig lehet rá számítani" },
    { "id": 44, "text": "Uralja az érzelmeit" },
    { "id": 45, "text": "Nehezen képzel el dolgokat" },
    { "id": 46, "text": "Beszédes" },
    { "id": 47, "text": "Hideg és nemtörődöm tud lenni" },
    { "id": 48, "text": "Rendetlenséget hagy, nem takarít" },
    { "id": 49, "text": "Ritkán érez szorongást vagy félelmet" },
    { "id": 50, "text": "Azt gondolja, a költészet és a színdarabok unalmasak" },
    { "id": 51, "text": "Jobban szereti, ha mások veszik át az irányítást" },
    { "id": 52, "text": "Udvarias, előzékeny másokkal" },
    { "id": 53, "text": "Kitartó, addig dolgozik, míg készen nincs a feladat" },
    { "id": 54, "text": "Hajlamos a lehangoltságra" },
    { "id": 55, "text": "Kevébé érdeklik az elvont gondolatok" },
    { "id": 56, "text": "Nagy lelkesedést mutat" },
    { "id": 57, "text": "A legjobbat feltételezi az emberekről" },
    { "id": 58, "text": "Néha felelőtlenül viselkedik" },
    { "id": 59, "text": "Temperamentumos, könnyen válik érzelmessé" },
    { "id": 60, "text": "Eredeti, új ötletei vannak" }
];

const ITEMS_PER_PAGE = 10;

// Scoring Definitions
// Negative numbers indicate Reverse scoring (Score = 6 - rating)
const SCORING = {
    domains: {
        Extraversion: [1, 6, -11, -16, 21, -26, -31, -36, 41, 46, -51, 56],
        Agreeableness: [2, 7, -12, -17, -22, 27, 32, -37, -42, -47, 52, 57],
        Conscientiousness: [-3, -8, 13, 18, -23, -28, 33, 38, 43, -48, 53, -58],
        Neuroticism: [-4, -9, 14, 19, -24, -29, 34, 39, -44, -49, 54, 59],
        OpenMindedness: [-5, 10, 15, 20, -25, -30, 35, 40, -45, -50, -55, 60]
    },
    facets: {
        Sociability: [1, -16, -31, 46],
        Assertiveness: [6, 21, -36, -51],
        EnergyLevel: [-11, -26, 41, 56],
        Compassion: [2, -17, 32, -47],
        Respectfulness: [7, -22, -37, 52],
        Trust: [-12, 27, -42, 57],
        Organization: [-3, 18, 33, -48],
        Productiveness: [-8, -23, 38, 53],
        Responsibility: [13, -28, 43, -58],
        Anxiety: [-4, 19, 34, -49],
        Depression: [-9, -24, 39, 54],
        EmotionalVolatility: [14, -29, -44, 59],
        IntellectualCuriosity: [10, -25, 40, -55],
        AestheticSensitivity: [-5, 20, 35, -50],
        CreativeImagination: [15, -30, -45, 60]
    }
};

export const Big5Test: React.FC<Big5TestProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();
    const [responses, setResponses] = useState<{ [key: string]: number }>({});

    // Resume from local storage or previous attempt not implemented for raw simplicity, 
    // but in a real app we might want to.

    const [currentPage, setCurrentPage] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const activeQuestions = CONFIG.IS_DEBUG_MODE ? QUESTIONS.slice(0, 20) : QUESTIONS;
    const totalPages = Math.ceil(activeQuestions.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const currentQuestions = activeQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset error state when page changes
    useEffect(() => {
        setShowErrors(false);
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handleResponse = (qId: number, value: number) => {
        setResponses(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const getUnansweredQuestions = () => {
        const missing = [];
        for (let i = 0; i < currentQuestions.length; i++) {
            const qId = currentQuestions[i].id;
            if (!responses[qId]) {
                missing.push(qId);
            }
        }
        return missing;
    };

    const handleNext = () => {
        const missing = getUnansweredQuestions();
        if (missing.length > 0) {
            setShowErrors(true);
            const firstMissingElement = document.getElementById(`question-${missing[0]}`);
            if (firstMissingElement) {
                firstMissingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            submitResults();
        }
    };

    const calculateScores = () => {
        const calculateAverage = (indices: number[]) => {
            let sum = 0;
            let count = 0;

            indices.forEach(idx => {
                const isReverse = idx < 0;
                const absIdx = Math.abs(idx);
                const rawVal = responses[absIdx];

                if (rawVal) {
                    const score = isReverse ? (6 - rawVal) : rawVal;
                    sum += score;
                    count++;
                }
            });

            return count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
        };

        const traits: any = {};
        Object.entries(SCORING.domains).forEach(([key, indices]) => {
            traits[key] = calculateAverage(indices);
        });

        const facets: any = {};
        Object.entries(SCORING.facets).forEach(([key, indices]) => {
            facets[key] = calculateAverage(indices);
        });

        return { traits, facets };
    };

    const submitResults = async () => {
        if (!user) return;
        setSubmitting(true);

        try {
            const { traits, facets } = calculateScores();

            const finalData: Big5Response = {
                rawAnswers: Object.fromEntries(
                    Object.entries(responses).map(([k, v]) => [k, v])
                ),
                calculatedTraits: {
                    Extraversion: traits.Extraversion,
                    Agreeableness: traits.Agreeableness,
                    Conscientiousness: traits.Conscientiousness,
                    Neuroticism: traits.Neuroticism,
                    OpenMindedness: traits.OpenMindedness
                },
                calculatedFacets: facets,
                timestamp: Date.now()
            };

            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                big5: finalData
            }, { merge: true });

            console.log("BFI-2 Results Saved:", finalData);
            await refreshUser();
            onComplete();
        } catch (e) {
            console.error(e);
            alert("Hiba a mentéskor. Kérjük próbálja újra.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="Személyiségteszt (BFI-2)" className="max-w-3xl w-full">
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                    Kérjük, jelölje meg, mennyire jellemző Önre az alábbi állítás. <br />
                    <strong>1 = Határozottan nem értek egyet</strong> ... <strong>5 = Határozottan egyetértek</strong>
                </div>

                <div className="space-y-8">
                    {currentQuestions.map((q) => {
                        const val = responses[q.id];
                        const isMissing = showErrors && !val;

                        return (
                            <div
                                id={`question-${q.id}`}
                                key={q.id}
                                className={`
                                    border-b pb-6 last:border-0 transition-colors p-4 rounded-xl
                                    ${isMissing ? 'bg-red-50 border-red-100' : 'border-gray-100'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <p className={`font-bold text-lg ${isMissing ? 'text-red-700' : 'text-gray-800'}`}>
                                        {q.id}. {q.text}
                                    </p>
                                    {isMissing && (
                                        <span className="text-red-600 text-xs font-bold uppercase bg-red-100 px-2 py-1 rounded">
                                            Kötelező
                                        </span>
                                    )}
                                </div>

                                <div className={`flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl gap-4 ${isMissing ? 'ring-2 ring-red-200' : ''}`}>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center w-24">Határozottan nem értek egyet</span>

                                    <div className="flex gap-2 sm:gap-4">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => handleResponse(q.id, rating)}
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

                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center w-24">Határozottan egyetértek</span>
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

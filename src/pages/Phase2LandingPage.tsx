import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Phase2LandingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 1. Initial Loading State
    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const { treatmentGroup } = user;
    const isGroup0 = treatmentGroup === '0';

    // 2. Determine Next Step specifically for Phase 2
    //    Phase 2 Logic:
    //    Group 0 (was Control, now AI): Video -> AI
    //    Group 1 (was AI, now Control + Psych): Big5 -> IQ -> Video -> NoAI

    // Data check helpers
    const hasBig5 = !!user.big5;
    const hasIQ = !!user.iq;

    let nextPath = '';
    let statusMessage = '';
    let stepTitle = '';
    let stepDescription = '';

    if (isGroup0) {
        // Group 0 in Phase 2 just needs to see the Video then AI Annotation
        nextPath = 'intro-video';
        statusMessage = "Üdvözöljük újra a 2. fázisban!";
        stepTitle = "Oktatóvideó és Gyakorlás";
        stepDescription = "Ebben a fázisban egy mesterséges intelligencia fogja segíteni a munkáját. Kérjük, tekintse meg a rövid oktatóvideót.";
    } else {
        // Group 1 in Phase 2 needs Big5 -> IQ -> Video -> NoAI
        if (!hasBig5) {
            nextPath = 'intro-big5';
            statusMessage = "Üdvözöljük újra a 2. fázisban!";
            stepTitle = "Személyiségteszt";
            stepDescription = "A folytatás előtt kérjük, töltse ki rövid személyiségtesztünket.";
        } else if (!hasIQ) {
            nextPath = 'intro-iq';
            statusMessage = "Továbblépés";
            stepTitle = "Logikai Teszt";
            stepDescription = "Kérjük, oldja meg a rövid logikai feladatokat.";
        } else {
            nextPath = 'intro-video';
            statusMessage = "Felkészülés";
            stepTitle = "Oktatóvideó és Gyakorlás";
            stepDescription = "Kérjük, tekintse meg az emlékeztető videót a feladatokról.";
        }
    }

    const handleStart = () => {
        // Route matches App.tsx Phase 2 structure
        navigate(`/phase2/group${treatmentGroup}/${nextPath}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-8 text-center px-4">
            <div className="max-w-4xl w-full">
                <div className="mb-12 animate-fade-in-down">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold tracking-wide uppercase mb-4">
                        2. Fázis
                    </span>
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                        {statusMessage}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Köszönjük, hogy visszatért hozzánk. A kutatás második szakaszában új kihívások várják.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Main Action Card */}
                    <Card className="flex flex-col justify-between h-full border-t-4 border-indigo-500 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{stepTitle}</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {stepDescription}
                            </p>

                            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-indigo-800 font-medium">
                                    <span className="mr-2">💡</span>
                                    {isGroup0
                                        ? "Most kipróbálhatja AI asszisztensünket."
                                        : "Most önállóan fog dolgozni a feladatokon."
                                    }
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleStart}
                            className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transform hover:scale-[1.02] transition-all"
                        >
                            Indítás Most →
                        </Button>
                    </Card>

                    {/* Status / Info Card */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 flex flex-col justify-center text-left">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Az Ön Státusza</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 text-xs">✓</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">1. Fázis</p>
                                    <p className="text-xs text-gray-500">Sikeresen teljesítve</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 text-xs">✓</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Pihenőidőszak</p>
                                    <p className="text-xs text-gray-500">30 nap eltelt</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <span className="text-blue-600 text-xs">●</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">2. Fázis</p>
                                    <p className="text-xs text-blue-600 font-medium">Folyamatban...</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-auto pt-8 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                                <span>ID: {user.userID}</span>
                                <span>Group: {isGroup0 ? "A (Ex-Control)" : "B (Ex-AI)"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

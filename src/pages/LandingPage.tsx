import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data check helpers (moved up)
    const currentPhase = user?.currentPhase;
    const treatmentGroup = user?.treatmentGroup;
    const isGroup0 = treatmentGroup === '0';
    const isPhase1 = currentPhase === 'phase1';

    // Check Annotation Completion Logic
    React.useEffect(() => {
        if (!user) return;

        const TOTAL_TRIALS = CONFIG.IS_DEBUG_MODE ? CONFIG.DEBUG_TRIALS_PER_SESSION : CONFIG.TRIALS_PER_SESSION;
        const completedCount = Object.keys(user.completedTrials || {}).length;

        if (completedCount >= TOTAL_TRIALS) {
            navigate('/completion');
        }
    }, [user, navigate]); // Removed isPhase1 from deps as it is derived from user

    if (!user) return <div>Loading...</div>;

    const hasDemographics = !!user.demographics;
    const hasBig5 = !!user.big5;
    const hasIQ = !!user.iq;

    // Determine Next Step Logic
    let nextPath = '';
    let statusMessage = '';

    if (isPhase1) {
        if (isGroup0) {
            // Group 0 Phase 1: Demographics -> Big 5 -> IQ -> Video -> Annotation
            if (!hasDemographics) {
                nextPath = 'demographics';
                statusMessage = "Kérjük, töltse ki a demográfiai adatokat.";
            } else if (!hasBig5) {
                nextPath = 'big5';
                statusMessage = "Következő lépés: Személyiségteszt.";
            } else if (!hasIQ) {
                nextPath = 'iq';
                statusMessage = "Következő lépés: Logikai teszt.";
            } else {
                nextPath = 'video';
                statusMessage = "Következő lépés: Oktatóvideó és Gyakorlás.";
            }
        } else {
            // Group 1 Phase 1: Demographics -> Video -> Annotation (No Big5/IQ)
            if (!hasDemographics) {
                nextPath = 'demographics';
                statusMessage = "Kérjük, töltse ki a demográfiai adatokat.";
            } else {
                nextPath = 'video';
                statusMessage = "Következő lépés: Oktatóvideó és Gyakorlás.";
            }
        }
    } else {
        // Phase 2
        if (isGroup0) {
            nextPath = 'video';
            statusMessage = "Üdvözöljük újra! Következő lépés: Oktatóvideó.";
        } else {
            if (!hasBig5) {
                nextPath = 'big5';
                statusMessage = "Üdvözöljük újra! Következő lépés: Személyiségteszt.";
            } else if (!hasIQ) {
                nextPath = 'iq';
                statusMessage = "Következő lépés: Logikai teszt.";
            } else {
                nextPath = 'video';
                statusMessage = "Következő lépés: Oktatóvideó és Gyakorlás.";
            }
        }
    }

    const handleStart = () => {
        navigate(`/${currentPhase}/group${treatmentGroup}/${nextPath}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center px-4">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">
                {isPhase1 ? "Üdvözöljük az 1. fázisban!" : "Üdvözöljük a 2. fázisban!"}
            </h1>

            <Card className="max-w-2xl w-full text-left">
                <div className="text-center mb-8">
                    <p className="text-xl text-gray-700 font-medium leading-relaxed">
                        {statusMessage}
                    </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-100">
                    <p className="font-bold mb-3 text-blue-900 text-sm uppercase tracking-wider">Státusz Információ</p>
                    <ul className="space-y-2 text-blue-800 text-base">
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Fázis: <strong>{isPhase1 ? "1. (Kezdeti)" : "2. (Kontroll/AI váltás)"}</strong>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Csoport: <strong>{treatmentGroup === '0' ? "A" : "B"}</strong>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Azonosító: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-600">{user.userID}</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={handleStart}
                    className="w-full py-5 text-xl"
                >
                    Indítás →
                </Button>
            </Card>
        </div>
    );
};

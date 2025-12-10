import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


export const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return <div>Loading...</div>;

    const { currentPhase, treatmentGroup } = user;
    const isGroup0 = treatmentGroup === '0';
    const isPhase1 = currentPhase === 'phase1';

    // Determine Status of steps
    // Data check helpers
    const hasDemographics = !!user.demographics;
    const hasBig5 = !!user.big5; // Only Group 0 Phase 1 OR Group 1 Phase 2
    const hasIQ = !!user.iq;     // Same as Big5
    // Video is not persisted in main user object in plan? 
    // Plan said: "I have watched" checkbox. But where stored? 
    // Plan phase 5: "Video Module... checkbox". 
    // We didn't add a field to Participant type for video. 
    // Let's assume for MVP we check if we are navigating FROM video.
    // Ideally we'd store `videoWatched: true`.
    // Let's assume we navigate linearly.

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
                // Assuming Video is handled before Annotation or inseparable
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
        // Group 0 (was Control, now AI): Video -> Annotation
        // Group 1 (was AI, now Control): Big 5 -> IQ -> Video -> Annotation
        if (isGroup0) {
            nextPath = 'video';
            statusMessage = "Üdvözöljük újra! Következő lépés: Oktatóvideó.";
        } else {
            if (!hasBig5) { // Assuming Big5 wasn't done in Phase 1 for Group 1? Yes.
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
        // Build absolute path
        // /phaseX/groupY/step
        navigate(`/${currentPhase}/group${treatmentGroup}/${nextPath}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center px-4">
            <h1 className="text-4xl font-bold mb-4 text-blue-900">
                {isPhase1 ? "Üdvözöljük az 1. fázisban!" : "Üdvözöljük a 2. fázisban!"}
            </h1>

            <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
                <p className="text-xl mb-6 text-gray-700">
                    {statusMessage}
                </p>

                <div className="bg-blue-50 p-4 rounded mb-8 text-left text-sm text-blue-800">
                    <p className="font-bold mb-2">Státusz:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Fázis: {isPhase1 ? "1. (Kezdeti)" : "2. (Kontroll/AI váltás)"}</li>
                        <li>Csoport: {treatmentGroup === '0' ? "A" : "B"}</li>
                        <li>Azonosító: <span className="font-mono">{user.userID}</span></li>
                    </ul>
                </div>

                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-full hover:bg-blue-700 transform transition hover:scale-105 shadow-md"
                >
                    Indítás →
                </button>
            </div>
        </div>
    );
};

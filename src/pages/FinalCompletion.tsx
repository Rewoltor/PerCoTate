import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, Lock } from 'lucide-react';
import { CONFIG } from '../config';

export const FinalCompletion: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, markPhase1Complete, markPhase2Complete, debugSkipWashout } = useAuth();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    // Check if we arrived here because of lockout (login attempt during washout)
    // or because we just finished the test.
    const isWashoutLockout = location.state?.reason === 'washout' || (user?.phase1CompletedAt && user?.currentPhase === 'phase1_completed' && !location.state?.justFinished);

    // Check if Phase 2 is done

    const isPhase2AlreadyDone = user?.phase2CompletedAt || user?.currentPhase === 'phase2_completed';

    useEffect(() => {
        if (!user || isWashoutLockout) return;

        const checkCompletion = async () => {
            const isJustFinished = location.state?.justFinished;
            if (!isJustFinished) return;

            if (!user.phase1CompletedAt && user.currentPhase === 'phase1') {
                // Just finished Phase 1
                await markPhase1Complete();
            } else if (user.currentPhase === 'phase2' && !user.phase2CompletedAt) {
                // Just finished Phase 2
                await markPhase2Complete();
            }
        };

        checkCompletion();
    }, [user, isWashoutLockout, markPhase1Complete, markPhase2Complete, location.state]);

    useEffect(() => {
        // Calculate days left if we have a completion date (Phase 1 only)
        if (user?.phase1CompletedAt && !isPhase2AlreadyDone) {
            const completedDate = new Date(user.phase1CompletedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - completedDate.getTime());

            if (diffTime < CONFIG.WASHOUT_PERIOD_MS) {
                const days = Math.ceil((CONFIG.WASHOUT_PERIOD_MS - diffTime) / (1000 * 60 * 60 * 24));
                setDaysLeft(prev => prev !== days ? days : prev);
            } else {
                setDaysLeft(prev => prev !== 0 ? 0 : prev);
            }
        } else {
            setDaysLeft(prev => prev !== 0 ? 0 : prev);
        }
    }, [user, isPhase2AlreadyDone]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">

                {/* Visual Icon */}
                <div className={`mx-auto mb-6 p-4 rounded-full w-24 h-24 flex items-center justify-center ${daysLeft ? 'bg-orange-100' : 'bg-green-100'}`}>
                    {daysLeft ? (
                        <Lock className="w-12 h-12 text-orange-600" />
                    ) : (
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {daysLeft ? "Szuper!" : "Gratulálunk!"}
                </h1>

                {daysLeft ? (
                    // Washout Message
                    <div className="mb-8">
                        <p className="text-lg text-gray-600 mb-4">
                            Az első fázis sikeres teljesítése után egy 28 napos pihenőidő következik.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-center gap-3 text-orange-800 font-bold text-lg">
                            <Clock className="w-6 h-6" />
                            <span>Még {daysLeft} nap van hátra.</span>
                        </div>
                    </div>
                ) : (
                    // Success Message
                    <div className="mb-8">
                        <p className="text-xl text-gray-800 font-medium mb-2">
                            {isPhase2AlreadyDone
                                ? "Sikeresen teljesítetted a teljes kutatássorozatot."
                                : "Sikeresen teljesítetted az első fázist."}
                        </p>
                        <p className="text-gray-600">
                            Köszönjük a részvételét és a ránk szánt időt.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Most bezárhatod az ablakot.
                    </p>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg text-lg"
                    >
                        Kilépés a főoldalra
                    </button>

                    {/* DEBUG ONLY: Skip Washout Button */}
                    {CONFIG.IS_DEBUG_MODE && daysLeft && daysLeft > 0 && (
                        <button
                            onClick={debugSkipWashout}
                            className="w-full py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all border border-red-200 text-sm mt-4"
                        >
                            [DEBUG] Ugordd át a 28 napot
                        </button>
                    )}
                </div>
            </div >
        </div >
    );
};

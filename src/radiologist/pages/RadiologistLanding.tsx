import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useRadiologistAuth } from '../contexts/RadiologistAuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const RadiologistLanding: React.FC = () => {
    const { user, loading, startSession } = useRadiologistAuth();
    const navigate = useNavigate();

    // Auto-redirect if session already exists
    useEffect(() => {
        if (user) {
            if (user.completedAt) {
                navigate('/radiology/complete');
            } else if (!user.demographics) {
                navigate('/radiology/demographics');
            } else if (user.currentTrialIndex > 0 || Object.keys(user.completedTrials).length > 0) {
                navigate('/radiology/annotation');
            } else {
                navigate('/radiology/instructions');
            }
        }
    }, [user, navigate]);

    const handleStart = async () => {
        await startSession();
        // After session is created, useEffect will redirect to demographics
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-6">
                {/* Info Card */}
                <Card className="text-center p-8 border-t-4 border-teal-500">
                    <div className="flex justify-center mb-4">
                        <img src="/ppke_logo.png" alt="PPKE Logo" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Radiológiai Annotáció
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        Köszönjük, hogy részt vesz ebben a kutatásban! Ez a felület térdröntgen felvételek
                        szakértői annotálására szolgál. A vizsgálat célja a Kellgren-Lawrence skála szerinti
                        osztályozás pontosságának felmérése.
                    </p>
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-sm text-teal-800 mb-6">
                        <strong>Kinek szól?</strong> Radiológusok, ortopéd szakorvosok, reumatológusok és egyéb
                        egészségügyi szakemberek számára.
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-left animate-pulse">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-red-800">
                            <strong>Fontos:</strong> Az alkalmazás kizárólag asztali számítógépen vagy laptopon használható! Mobil eszközökön a felület nem jelenik meg megfelelően.
                        </div>
                    </div>

                    <Button
                        onClick={handleStart}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-4"
                        isLoading={loading}
                    >
                        Kezdés →
                    </Button>
                </Card>
            </div>
        </div>
    );
};

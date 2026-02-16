import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RADIO_CONFIG } from '../config';

interface RadiologistInstructionsProps {
    onComplete: () => void;
}

export const RadiologistInstructions: React.FC<RadiologistInstructionsProps> = ({ onComplete }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-2xl w-full text-center p-10 shadow-xl border-t-4 border-teal-500">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Annotáció — Útmutató</h1>

                <div className="text-left text-gray-600 space-y-4 mb-10">
                    <p>
                        A következő lépésben <strong className="text-gray-800">{RADIO_CONFIG.TOTAL_IMAGES} darab térdröntgen
                            felvételt</strong> fog látni véletlenszerű sorrendben. Minden képnél az alábbi három kérdésre kell válaszolnia:
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                            <div>
                                <strong className="text-gray-800">Olvasható-e a kép?</strong>
                                <p className="text-sm text-gray-500 mt-0.5">Értékelhető-e a röntgenfelvétel minősége alapján.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                            <div>
                                <strong className="text-gray-800">Kellgren-Lawrence fokozat (0–4)</strong>
                                <p className="text-sm text-gray-500 mt-0.5">Értékelje a porckopás mértékét a KL skála szerint.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                            <div>
                                <strong className="text-gray-800">Bizonyosság (1–7)</strong>
                                <p className="text-sm text-gray-500 mt-0.5">Mennyire biztos a döntésében (1 = bizonytalan, 7 = teljesen biztos).</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <strong>Fontos:</strong> A képek véletlenszerű sorrendben jelennek meg. Kérjük, minden képet önállóan,
                        a saját megítélése szerint értékeljen. Az adatai anonim módon kerülnek feldolgozásra.
                    </div>
                </div>

                <Button
                    onClick={onComplete}
                    className="w-full md:w-auto px-12 py-4 text-lg bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                >
                    Annotáció Indítása →
                </Button>
            </Card>
        </div>
    );
};

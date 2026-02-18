import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RADIO_CONFIG } from '../config';

interface RadiologistInstructionsProps {
    onComplete: () => void;
}

export const RadiologistInstructions: React.FC<RadiologistInstructionsProps> = ({ onComplete }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4">
            <Card className="max-w-5xl w-full text-center p-6 shadow-xl border-t-4 border-teal-500">
                <h1 className="text-3xl font-bold text-gray-900 mb-5">Annotáció — Kalibráció & Útmutató</h1>

                <div className="text-left text-gray-600 space-y-5 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-blue-900 text-xl">Standardizálás & Kalibráció</h3>
                            <div className="relative group ml-2">
                                <button className="text-blue-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </button>
                                <div className="absolute right-0 top-8 w-72 md:w-96 p-4 bg-white border border-gray-200 shadow-lg rounded-lg text-sm text-gray-500 italic z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    Forrás: Bayramoglu, N., Nieminen, M. T., & Saarakkala, S. (2020, July). A lightweight cnn and joint shape-joint space () descriptor for radiological osteoarthritis detection. In Annual Conference on Medical Image Understanding and Analysis (pp. 331-345). Cham: Springer International Publishing.
                                </div>
                            </div>
                        </div>

                        <p className="text-blue-800 text-base mb-4 leading-relaxed">
                            Kérjük, tekintse meg az alábbi Kellgren-Lawrence (KL) osztályozási segédletet.
                            Ez a kép szolgál referenciaként ("kalibrációként") a feladatokhoz.
                        </p>

                        <div className="flex justify-center my-4">
                            <img
                                src="/K_L_Grade.jpg"
                                alt="Kellgren-Lawrence Grading Scale"
                                className="w-full h-auto rounded-lg shadow-md border border-gray-300"
                                style={{ maxHeight: '55vh', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <p className="text-base leading-relaxed">
                        A következő lépésben <strong className="text-gray-800">{RADIO_CONFIG.TOTAL_IMAGES} darab térdröntgen
                            felvételt</strong> fog látni véletlenszerű sorrendben. Minden képnél az alábbi három kérdésre kell válaszolnia:
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 text-base">
                        <div className="flex items-start gap-4">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</span>
                            <div>
                                <strong className="text-gray-900 block mb-1">Olvasható-e a kép?</strong>
                                <p className="text-sm text-gray-600">Értékelhető-e a röntgenfelvétel minősége alapján.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</span>
                            <div>
                                <strong className="text-gray-900 block mb-1">Kellgren-Lawrence fokozat (0–4)</strong>
                                <p className="text-sm text-gray-600">Értékelje a porckopás mértékét a KL skála szerint.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="bg-teal-100 text-teal-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</span>
                            <div>
                                <strong className="text-gray-900 block mb-1">Magabiztosság (1–7)</strong>
                                <p className="text-sm text-gray-600">Mennyire biztos a döntésében (1 = bizonytalan, 7 = teljesen biztos).</p>
                            </div>
                        </div>
                    </div>


                </div>

                <Button
                    onClick={onComplete}
                    className="w-full md:w-auto px-16 py-4 text-xl bg-teal-600 hover:bg-teal-700 shadow-teal-200 font-semibold"
                >
                    Annotáció Indítása →
                </Button>
            </Card>
        </div>
    );
};

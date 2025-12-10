import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

export const FinalCompletion: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); // or handle logic to mark Phase 1 as totally done

    // Auto logout after a delay? Or just show the page.
    // Let's just show the page.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
                <div className="mx-auto mb-6 bg-green-100 p-4 rounded-full w-24 h-24 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Gratulálunk!
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Sikeresen teljesítette a feladatsort (1. Fázis).<br />
                    Köszönjük a részvételét a kutatásban.
                </p>

                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        A folytatáshoz vagy kilépéshez kérjük zárja be az ablakot, vagy térjen vissza a kezdőlapra.
                    </p>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg"
                    >
                        Kilépés a főoldalra
                    </button>
                </div>
            </div>
        </div>
    );
};

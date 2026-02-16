import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadiologistAuth } from '../contexts/RadiologistAuthContext';
import { CheckCircle } from 'lucide-react';

export const RadiologistCompletion: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useRadiologistAuth();

    const handleLogout = () => {
        logout();
        navigate('/radiology');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
                {/* Icon */}
                <div className="mx-auto mb-6 p-4 rounded-full w-24 h-24 flex items-center justify-center bg-teal-100">
                    <CheckCircle className="w-12 h-12 text-teal-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Köszönjük!
                </h1>

                <div className="mb-8">
                    <p className="text-xl text-gray-800 font-medium mb-2">
                        Sikeresen befejezte az annotációt.
                    </p>
                    <p className="text-gray-600">
                        Köszönjük a szakértői közreműködését a kutatásban. Az Ön válaszai nagy segítséget nyújtanak
                        a vizsgálat sikeréhez.
                    </p>
                </div>

                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800 mb-6">
                    Az adatai anonim módon kerülnek feldolgozásra és kizárólag tudományos célokat szolgálnak.
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-900 transition-colors text-base underline decoration-gray-300 hover:decoration-gray-900 underline-offset-4"
                >
                    Kilépés
                </button>
            </div>
        </div>
    );
};

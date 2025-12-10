import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const { login, loading, error, user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (user) {
            const path = `/${user.currentPhase}/group${user.treatmentGroup}/landing`;
            navigate(path);
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || pin.length !== 4) {
            alert("Kérjük, adja meg a nevét és a 4 jegyű PIN kódját.");
            return;
        }
        await login(name, pin);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">MRMC Study Login</h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teljes Név</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="pl. Kovács János"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Kód (4 számjegy)</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={4}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="1234"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Bejelentkezés...' : 'Belépés'}
                    </button>
                </form>

                <p className="mt-8 text-xs text-center text-gray-400">
                    Semmelweis Egyetem - PerCoTate Study
                </p>
            </div>
        </div>
    );
};

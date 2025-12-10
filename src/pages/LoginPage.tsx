import { Eye } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
    const { login, loading, error, user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [pin, setPin] = useState(['', '', '', '']); // Array for 4 digits
    const [showPin, setShowPin] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 4);
        const newPin = [...pin];
        text.split('').forEach((char, i) => newPin[i] = char);
        setPin(newPin);

        // Focus last filled or next empty
        const nextIndex = Math.min(text.length, 3);
        inputRefs.current[nextIndex]?.focus();
    };

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (user) {
            const path = `/${user.currentPhase}/group${user.treatmentGroup}/landing`;
            navigate(path);
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const pinString = pin.join('');
        if (!name || pinString.length !== 4) {
            alert("Kérjük, adja meg a nevét és a 4 jegyű PIN kódját.");
            return;
        }
        await login(name, pinString);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="MRMC Study Login" className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Teljes Név</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg"
                            placeholder="pl. Kovács János"
                            required
                            disabled={loading}
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">PIN Kód (4 számjegy)</label>
                        <div className="flex items-center gap-3 justify-start">
                            {[0, 1, 2, 3].map((i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={pin[i]}
                                    onChange={(e) => handlePinChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
                                />
                            ))}

                            <button
                                type="button"
                                onMouseDown={() => setShowPin(true)}
                                onMouseUp={() => setShowPin(false)}
                                onMouseLeave={() => setShowPin(false)}
                                onTouchStart={() => setShowPin(true)}
                                onTouchEnd={() => setShowPin(false)}
                                className="w-14 h-16 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors active:scale-95 flex-shrink-0 ml-1"
                                title="Kód megjelenítése (tartsa lenyomva)"
                            >
                                <Eye size={22} />
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={loading}
                        disabled={!name || pin.join('').length !== 4}
                    >
                        Belépés
                    </Button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Semmelweis Egyetem - PerCoTate Study
                    </p>
                </form>
            </Card>
        </div>
    );
};

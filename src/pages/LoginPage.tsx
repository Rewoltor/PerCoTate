import { Eye } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
    const { authenticate, loading, error, user, adminUnlockUser } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
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
            if (user.currentPhase === 'phase2_completed') {
                navigate('/completion');
                return;
            }
            if (user.currentPhase === 'phase1_completed' && user.phase1CompletedAt) {
                // Check logical washout calc here or just send to completion which handles it
                // Better to send to completion page to show status
                navigate('/completion');
                return;
            }
            const path = `/${user.currentPhase}/group${user.treatmentGroup}/landing`;
            console.log("[LoginPage] User found, redirecting to:", path, user);
            navigate(path);
        } else {
            console.log("[LoginPage] No user in context.");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const pinString = pin.join('');
        if (!name || pinString.length !== 4) {
            alert("Kérjük, adja meg a nevét és a 4 jegyű PIN kódját.");
            return;
        }
        await authenticate(name, pinString, mode);
    };

    const handleUnlock = async () => {
        if (!confirm("DEV: Biztosan átállítja a dátumot 31 nappal korábbira a teszteléshez?")) return;
        const pinString = pin.join('');
        const success = await adminUnlockUser(name, pinString);
        if (success) {
            alert("Sikeres módosítás! Most jelentkezzen be újra.");
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="" className="w-full max-w-md pt-8">
                {/* Custom Toggle Switch */}
                <div className="flex justify-center mb-8 px-8">
                    <div className="bg-gray-100 p-1 rounded-xl flex w-full relative">
                        {/* Animated Pill Background */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${mode === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        />

                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className={`relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors z-10 ${mode === 'login' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Bejelentkezés
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('register')}
                            className={`relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors z-10 ${mode === 'register' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Regisztráció
                        </button>
                    </div>
                </div>

                <div className="px-1 text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' ? 'Üdvözöljük újra!' : 'Új Fiók Létrehozása'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {mode === 'login'
                            ? 'Kérjük adja meg belépési adatait.'
                            : 'Kérjük adja meg adatait a regisztrációhoz.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
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
                        {mode === 'login' ? 'Belépés' : 'Regisztráció'}
                    </Button>

                    {error && error.includes("Phase 1 complete") && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={handleUnlock}
                            >
                                🔧 DEV: 30 nap átugrása
                            </Button>
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Semmelweis Egyetem - PerCoTate Study
                    </p>
                </form>
            </Card>
        </div>
    );
};

// ============================================================
// RADIOLOGIST MODULE — SIMPLIFIED SESSION CONTEXT (NO AUTH)
// No login/register. Auto-generates a RAD-ID on first visit.
// ============================================================

import React, { createContext, useContext, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { RADIO_CONFIG } from '../config';
import type { RadiologistParticipant } from '../types';

// ==================== Session Storage Helpers ====================
const saveRadiologistToStorage = (user: RadiologistParticipant): void => {
    try {
        localStorage.setItem(RADIO_CONFIG.SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('[RadioStorage] Failed to save session:', error);
    }
};

const loadRadiologistFromStorage = (): RadiologistParticipant | null => {
    try {
        const stored = localStorage.getItem(RADIO_CONFIG.SESSION_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as RadiologistParticipant;
    } catch (error) {
        console.error('[RadioStorage] Failed to load session:', error);
        localStorage.removeItem(RADIO_CONFIG.SESSION_STORAGE_KEY);
        return null;
    }
};

// ==================== ID Generator ====================
const generateRadId = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RAD-${result}`;
};

// ==================== Fisher-Yates Shuffle ====================
const shuffleImages = (): number[] => {
    const images = Array.from({ length: RADIO_CONFIG.TOTAL_IMAGES }, (_, i) => i + 1);
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }
    return images;
};

// ==================== Context ====================
interface RadiologistContextType {
    user: RadiologistParticipant | null;
    loading: boolean;
    startSession: () => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const RadiologistAuthContext = createContext<RadiologistContextType | undefined>(undefined);

export const RadiologistAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<RadiologistParticipant | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Restore session on mount
    React.useEffect(() => {
        const saved = loadRadiologistFromStorage();
        if (saved) {
            setUser(saved);
        }
        setLoading(false);
    }, []);

    /** Called once when the radiologist clicks "Start" on the landing page.
     *  Generates a RAD-ID, creates a participant document, and stores session. */
    const startSession = async () => {
        setLoading(true);
        try {
            // Anonymous Firebase Auth (required for Firestore writes)
            await signInAnonymously(auth);

            const newRadId = generateRadId();
            const imageSequence = shuffleImages();

            const participantData: RadiologistParticipant = {
                radId: newRadId,
                imageSequence,
                currentTrialIndex: 0,
                completedTrials: {},
            };

            // Write to Firestore — radio_participants ONLY
            await setDoc(doc(db, RADIO_CONFIG.COLLECTIONS.RADIO_PARTICIPANTS, newRadId), {
                ...participantData,
                createdAt: serverTimestamp(),
            });

            setUser(participantData);
            saveRadiologistToStorage(participantData);
        } catch (err: any) {
            console.error("[RadioSession] Error starting session:", err);
            alert("Hiba történt a munkamenet indításakor. Kérjük, próbálja újra.");
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, RADIO_CONFIG.COLLECTIONS.RADIO_PARTICIPANTS, user.radId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const newData = userSnap.data() as RadiologistParticipant;
                setUser(newData);
                saveRadiologistToStorage(newData);
            }
        } catch (e) {
            console.error("[RadioSession] Failed to refresh user:", e);
        }
    };

    const logout = () => {
        localStorage.removeItem(RADIO_CONFIG.SESSION_STORAGE_KEY);
        setUser(null);
    };

    return (
        <RadiologistAuthContext.Provider value={{ user, loading, startSession, refreshUser, logout }}>
            {!loading && children}
        </RadiologistAuthContext.Provider>
    );
};

export const useRadiologistAuth = () => {
    const context = useContext(RadiologistAuthContext);
    if (context === undefined) {
        throw new Error('useRadiologistAuth must be used within a RadiologistAuthProvider');
    }
    return context;
};

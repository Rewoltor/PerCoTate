import React, { createContext, useContext, useState } from 'react';
import { runTransaction, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { CONFIG } from '../config';
import { generateUserID } from '../utils/idGenerator';
import type { Participant, TreatmentGroup } from '../types';

interface AuthContextType {
    user: Participant | null;
    loading: boolean;
    error: string | null;
    login: (name: string, pin: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Participant | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Initially false until action
    const [error, setError] = useState<string | null>(null);

    // Persist user session ideally, but for now we might rely on re-login or localStorage
    // The requirements don't strictly specify persistent session across refreshes without re-login,
    // but standard auth usually requires it. We'll use localStorage to store userID for quick resume?
    // Or better, let's just stick to the requested flow: Login -> Access.

    const login = async (name: string, pin: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Authenticate anonymously with Firebase Auth (required for Firestore rules)
            await signInAnonymously(auth);

            const identityDocId = `${name.toLowerCase().trim()}_${pin}`;
            const identityRef = doc(db, CONFIG.COLLECTIONS.USER_IDENTITY, identityDocId);
            const counterRef = doc(db, CONFIG.COLLECTIONS.SYSTEM_STATS, 'global_counter');

            // 2. Transaction: Check Identity -> (Create if new + Assign Group) -> Return ID
            const participantData = await runTransaction(db, async (transaction) => {
                const identityDocSnap = await transaction.get(identityRef);

                if (identityDocSnap.exists()) {
                    // Existing User
                    const assignedUserID = identityDocSnap.data().assignedUserID;
                    const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, assignedUserID); // Re-ref correctly
                    const participantDoc = await transaction.get(userRef);

                    if (!participantDoc.exists()) {
                        throw new Error("Identity found but Participant data missing!");
                    }
                    return participantDoc.data() as Participant;
                } else {
                    // New User
                    const counterDoc = await transaction.get(counterRef);
                    let currentCount = 0;
                    if (counterDoc.exists()) {
                        currentCount = counterDoc.data().count || 0;
                    }

                    // Determine Group: Even = '0', Odd = '1'
                    const assignedGroup: TreatmentGroup = currentCount % 2 === 0 ? '0' : '1';
                    const newMsg = `Assigning new user to group ${assignedGroup} (count: ${currentCount})`;
                    console.log(newMsg);

                    const newUserID = generateUserID(assignedGroup);

                    // Generate sequence based on debug mode
                    // Generate full 50 image sequence regardless of debug mode
                    // We want the pool to be 1-50 every time.
                    const allImages = Array.from({ length: 50 }, (_, i) => i + 1);

                    // Fisher-Yates Shuffle for unbiased random order
                    for (let i = allImages.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
                    }

                    const finalSequence = allImages; // Always assign all 50

                    const newParticipant: Participant = {
                        userID: newUserID,
                        treatmentGroup: assignedGroup,
                        currentPhase: 'phase1',
                        imageSequence: finalSequence,
                        completedTrials: {}
                    };

                    // Database Writes
                    transaction.set(identityRef, {
                        name,
                        pin,
                        assignedUserID: newUserID,
                        createdAt: serverTimestamp()
                    });

                    transaction.set(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, newUserID), {
                        ...newParticipant,
                        createdAt: serverTimestamp() // Add creation time for sorting if needed
                    });

                    transaction.set(counterRef, { count: currentCount + 1 }, { merge: true });

                    return newParticipant;
                }
            });

            // 3. Lockout / Phase Logic
            if (participantData.currentPhase === 'phase1' && participantData.phase1CompletedAt) {
                const completedDate = new Date(participantData.phase1CompletedAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - completedDate.getTime());

                if (diffTime < CONFIG.WASHOUT_PERIOD_MS) {
                    const daysLeft = Math.ceil((CONFIG.WASHOUT_PERIOD_MS - diffTime) / (1000 * 60 * 60 * 24));
                    throw new Error(`Phase 1 complete. Please return in ${daysLeft} days for Phase 2.`);
                } else {
                    // Unlock Phase 2
                    const participantRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, participantData.userID);
                    await updateDoc(participantRef, { currentPhase: 'phase2' });
                    participantData.currentPhase = 'phase2';
                }
            }

            setUser(participantData);

        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "Failed to login.");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        auth.signOut();
    };



    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

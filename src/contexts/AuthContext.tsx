import React, { createContext, useContext, useState } from 'react';
import { runTransaction, doc, updateDoc, serverTimestamp, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { CONFIG } from '../config';
import { generateUserID } from '../utils/idGenerator';
import type { Participant, TreatmentGroup } from '../types';

interface AuthContextType {
    user: Participant | null;
    loading: boolean;
    error: string | null;
    authenticate: (name: string, pin: string, mode: 'login' | 'register') => Promise<void>;
    logout: () => void;
    markPhase1Complete: () => Promise<void>;
    markPhase2Complete: () => Promise<void>;
    debugSkipWashout: () => Promise<void>;
    adminUnlockUser: (name: string, pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Participant | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Persist user session ideally, but for now we might rely on re-login or localStorage
    // The requirements don't strictly specify persistent session across refreshes without re-login,
    // but standard auth usually requires it. We'll use localStorage to store userID for quick resume?
    // Or better, let's just stick to the requested flow: Login -> Access.

    const authenticate = async (name: string, pin: string, mode: 'login' | 'register') => {
        console.log(`[Auth] Starting authentication. Mode: ${mode}, Name: ${name}`);
        setLoading(true);
        setError(null);
        try {
            // 1. Authenticate anonymously with Firebase Auth
            console.log("[Auth] Calling signInAnonymously...");
            const authResult = await signInAnonymously(auth);
            console.log("[Auth] signInAnonymously success:", authResult.user.uid);

            const identityDocId = `${name.toLowerCase().trim()}_${pin}`;
            const identityRef = doc(db, CONFIG.COLLECTIONS.USER_IDENTITY, identityDocId);
            const counterRef = doc(db, CONFIG.COLLECTIONS.SYSTEM_STATS, 'global_counter');

            // 2. Initial Check
            console.log("[Auth] Checking identity doc:", identityDocId);
            const identitySnap = await getDoc(identityRef);
            let participantData: Participant;

            const MASTER_PIN = '3012';
            const isMasterPin = pin === MASTER_PIN;

            if (mode === 'login') {
                // --- LOGIN MODE ---
                if (identitySnap.exists()) {
                    console.log("[Auth] Identity found.");
                    // Exact match found (Name + PIN)
                    const assignedUserID = identitySnap.data().assignedUserID;
                    console.log("[Auth] Fetching participant:", assignedUserID);
                    const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, assignedUserID);
                    const participantSnap = await getDoc(userRef);
                    if (!participantSnap.exists()) throw new Error("Data corruption: Participant missing.");
                    participantData = participantSnap.data() as Participant;
                } else if (isMasterPin) {
                    console.log("[Auth] Master PIN used.");
                    // Master PIN Login: Lookup by Name
                    const usersRef = collection(db, CONFIG.COLLECTIONS.USER_IDENTITY);
                    const q = query(usersRef, where("name", "==", name));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const foundIdentity = querySnapshot.docs[0].data();
                        participantData = (await getDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, foundIdentity.assignedUserID))).data() as Participant;
                        console.log(`[MasterPIN] Logged in '${name}'`);
                    } else {
                        console.log("[Auth] Master PIN creating new user.");
                        participantData = await createNewUser(name, pin, identityRef, counterRef);
                    }
                } else {
                    console.log("[Auth] Login failed. Checking if wrong PIN.");
                    // Standard Failure
                    // Verify if it's "Wrong PIN" or "User Not Found"
                    const usersRef = collection(db, CONFIG.COLLECTIONS.USER_IDENTITY);
                    const q = query(usersRef, where("name", "==", name));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        throw new Error("Hibás PIN kód.");
                    } else {
                        throw new Error("A felhasználó nem található. Kérjük regisztráljon.");
                    }
                }

            } else {
                // --- REGISTER MODE ---
                if (identitySnap.exists()) {
                    throw new Error("A felhasználó már létezik. Kérjük váltson 'Bejelentkezés' módra.");
                }

                const usersRef = collection(db, CONFIG.COLLECTIONS.USER_IDENTITY);
                const q = query(usersRef, where("name", "==", name));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty && !isMasterPin) {
                    // Name exists with different PIN
                    throw new Error("Ez a név már regisztrálva van. Kérjük jelentkezzen be.");
                }

                // Proceed to Create
                console.log("[Auth] Creating new user...");
                participantData = await createNewUser(name, pin, identityRef, counterRef);
            }

            // 3. Lockout Logic (Common)
            // Fix: Check if phase1 is effectively done (either marked as phase1_completed OR has keys)
            // usage of 'phase1_completed' status is the robust way.
            if ((participantData.currentPhase === 'phase1' || participantData.currentPhase === 'phase1_completed') && participantData.phase1CompletedAt) {
                console.log("[Auth] Checking washout period...");
                const completedDate = new Date(participantData.phase1CompletedAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - completedDate.getTime());

                if (diffTime < CONFIG.WASHOUT_PERIOD_MS) {
                    const daysLeft = Math.ceil((CONFIG.WASHOUT_PERIOD_MS - diffTime) / (1000 * 60 * 60 * 24));
                    console.log("[Auth] Washout active. Locking out.");
                    throw new Error(`Phase 1 complete. Please return in ${daysLeft} days for Phase 2.`);
                } else {
                    console.log("[Auth] Washout passed. Upgrading to Phase 2.");

                    // Generate new random sequence for Phase 2
                    const allImages = Array.from({ length: 50 }, (_, i) => i + 1);
                    for (let i = allImages.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
                    }

                    const participantRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, participantData.userID);
                    await updateDoc(participantRef, {
                        currentPhase: 'phase2',
                        imageSequencePhase2: allImages
                    });
                    participantData.currentPhase = 'phase2';
                    participantData.imageSequencePhase2 = allImages;
                }
            }

            console.log("[Auth] Authentication successful. Setting user.", participantData);
            setUser(participantData);

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || "Hitelesítési hiba.");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper for creating user (transaction wrapper)
    const createNewUser = async (name: string, pin: string, identityRef: any, counterRef: any) => {
        return await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let currentCount = 0;
            if (counterDoc.exists()) {
                const data = counterDoc.data() as { count?: number };
                currentCount = data.count || 0;
            }

            const assignedGroup: TreatmentGroup = currentCount % 2 === 0 ? '0' : '1';
            const newUserID = generateUserID(assignedGroup);
            const allImages = Array.from({ length: 50 }, (_, i) => i + 1);
            // Fisher-Yates
            for (let i = allImages.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
            }

            const newParticipant: Participant = {
                userID: newUserID,
                treatmentGroup: assignedGroup,
                currentPhase: 'phase1',
                imageSequence: allImages,
                completedTrials: {}
            };

            const timestamp = serverTimestamp();

            transaction.set(identityRef, { name, pin, assignedUserID: newUserID, createdAt: timestamp });
            transaction.set(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, newUserID), { ...newParticipant, createdAt: timestamp });
            transaction.set(counterRef, { count: currentCount + 1 }, { merge: true });

            return newParticipant;
        });
    };

    const markPhase1Complete = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);
            const timestamp = Date.now(); // use number timestamp to match Type

            await updateDoc(userRef, {
                phase1CompletedAt: timestamp,
                currentPhase: 'phase1_completed' // Optional: explicit status
            });

            // Update local state
            setUser(prev => prev ? { ...prev, phase1CompletedAt: timestamp, currentPhase: 'phase1_completed' } : null);
        } catch (e) {
            console.error("Failed to mark phase 1 complete:", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const markPhase2Complete = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);
            const timestamp = Date.now();

            await updateDoc(userRef, {
                phase2CompletedAt: timestamp,
                currentPhase: 'phase2_completed'
            });

            // Update local state
            setUser(prev => prev ? { ...prev, phase2CompletedAt: timestamp, currentPhase: 'phase2_completed' } : null);
        } catch (e) {
            console.error("Failed to mark phase 2 complete:", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };


    // DEBUG HELPER: Skips the washout period by setting the completion date to 30 days ago
    const debugSkipWashout = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID);
            // Set date to 30 days ago
            const pastDate = Date.now() - (30 * 24 * 60 * 60 * 1000) - 10000; // Extra buffer

            await updateDoc(userRef, {
                phase1CompletedAt: pastDate,
                // We do NOT set currentPhase here, let the login logic handle the transition
            });

            // Update local state and reload to trigger unlock logic if needed
            setUser(prev => prev ? { ...prev, phase1CompletedAt: pastDate } : null);
            alert("Debug: Washout period skipped. Please log in again.");
            window.location.reload();
        } catch (e) {
            console.error("Failed to skip washout:", e);
        } finally {
            setLoading(false);
        }
    };

    // ADMIN HELPER: Unlocks user by name/pin without needing to be logged in (for when trapped in washout)
    const adminUnlockUser = async (name: string, pin: string) => {
        try {
            setLoading(true);
            const identityDocId = `${name.toLowerCase().trim()}_${pin}`;
            const identityRef = doc(db, CONFIG.COLLECTIONS.USER_IDENTITY, identityDocId);
            const identitySnap = await getDoc(identityRef);

            if (!identitySnap.exists()) {
                throw new Error("User not found for unlock.");
            }

            const assignedUserID = identitySnap.data().assignedUserID;
            const userRef = doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, assignedUserID);

            // Set date to 31 days ago to be safe
            const pastDate = Date.now() - (31 * 24 * 60 * 60 * 1000);

            await updateDoc(userRef, {
                phase1CompletedAt: pastDate
            });

            return true;
        } catch (e) {
            console.error("Unlock failed:", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, authenticate, logout, markPhase1Complete, markPhase2Complete, debugSkipWashout, adminUnlockUser }}>
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

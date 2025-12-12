import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';

interface VideoModuleProps {
    onComplete: () => void;
    videoSrc?: string; // Optional custom URL
    saveProgressKey?: string; // Key to set to true in user doc
}

export const VideoModule: React.FC<VideoModuleProps> = ({ onComplete, videoSrc, saveProgressKey }) => {
    const { user, refreshUser } = useAuth();
    const [watched, setWatched] = useState(false);
    const [saving, setSaving] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Hardcoded demo video logic if no URL
    // For production, use real URL or Firebase Storage link
    const src = videoSrc || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm";

    const handleEnded = () => {
        setWatched(true);
    };

    const handleComplete = async () => {
        if (saveProgressKey && user) {
            setSaving(true);
            try {
                await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                    [saveProgressKey]: true
                }, { merge: true });
                await refreshUser();
            } catch (err) {
                console.error("Error saving video progress:", err);
            } finally {
                setSaving(false);
            }
        }
        onComplete();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Oktatóvideó</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Kérjük, nézze végig figyelmesen az alábbi videót a feladat megértéséhez.
                        A "Tovább" gomb csak a videó végignézése után válik aktívvá.
                    </p>
                </div>

                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-8 border-4 border-gray-900 mx-auto max-w-3xl ring-4 ring-gray-100">
                    <video
                        ref={videoRef}
                        src={src}
                        controls
                        className="w-full h-auto aspect-video"
                        onEnded={handleEnded}
                    >
                        Böngészője nem támogatja a videólejátszást.
                    </video>
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={handleComplete}
                        disabled={!watched || saving}
                        isLoading={saving}
                        className="px-12 py-4 text-xl shadow-xl shadow-blue-200"
                    >
                        Tovább a Gyakorlásra →
                    </Button>
                </div>
            </Card>
        </div>
    );
};

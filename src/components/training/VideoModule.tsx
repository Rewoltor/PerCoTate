import React, { useState, useRef } from 'react';

interface VideoModuleProps {
    videoSrc: string; // URL or path in public
    onComplete: () => void;
}

export const VideoModule: React.FC<VideoModuleProps> = ({ videoSrc, onComplete }) => {
    const [watched, setWatched] = useState(false);
    const [checked, setChecked] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleEnded = () => {
        setWatched(true);
    };

    const handleContinue = () => {
        if (watched && checked) {
            onComplete();
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Oktatóvideó</h2>
            <p className="mb-6 text-gray-600">Kérjük, nézze végig a videót a folytatáshoz.</p>

            <div className="bg-black aspect-video mb-6 flex justify-center items-center">
                <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="w-full h-full"
                    onEnded={handleEnded}
                >
                    A böngésző nem támogatja a videó lejátszást.
                </video>
            </div>

            <div className="flex flex-col items-center gap-4">
                <label className={`flex items-center gap-2 cursor-pointer ${!watched ? 'opacity-50' : ''}`}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        disabled={!watched}
                        className="w-5 h-5"
                    />
                    <span className="font-medium">Megnéztem és megértettem az oktatóvideót.</span>
                </label>

                <button
                    onClick={handleContinue}
                    disabled={!watched || !checked}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Tovább a feladatra
                </button>
            </div>
        </div>
    );
};

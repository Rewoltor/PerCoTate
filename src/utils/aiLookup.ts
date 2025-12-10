import type { Box } from './math';

interface AIPrediction {
    imageId: number;
    diagnosis: 'igen' | 'nem'; // 1 or 0 mapped
    confidence: number; // 0-1
    box?: Box; // AI suggested box
    heatmapPath?: string; // Path to heatmap image
}

// Mock Data / Loader 
// In production this would verify against a CSV/JSON file imported
const MOCKED_AI_DATA: { [key: number]: AIPrediction } = {
    // Example entries
    1: { imageId: 1, diagnosis: 'igen', confidence: 0.85, box: { x: 100, y: 100, width: 200, height: 200 } },
    2: { imageId: 2, diagnosis: 'nem', confidence: 0.92 },
    3: { imageId: 3, diagnosis: 'igen', confidence: 0.65, box: { x: 500, y: 300, width: 150, height: 150 } },
    // Fallback generator for others
};

export const getAIPrediction = async (imageId: number): Promise<AIPrediction> => {
    // Simulate async load
    return new Promise((resolve) => {
        setTimeout(() => {
            if (MOCKED_AI_DATA[imageId]) {
                resolve(MOCKED_AI_DATA[imageId]);
            } else {
                // Generate random mock if missing (for dev)
                const isPositive = Math.random() > 0.5;
                resolve({
                    imageId,
                    diagnosis: isPositive ? 'igen' : 'nem',
                    confidence: 0.5 + Math.random() * 0.4,
                    box: isPositive ? { x: 200, y: 200, width: 300, height: 300 } : undefined
                });
            }
        }, 300);
    });
};

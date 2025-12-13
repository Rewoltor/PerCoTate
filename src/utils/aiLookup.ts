import type { Box } from './math';

export interface AIPrediction {
    id: string; // Unique key (e.g., "baseline_1.png")
    imageName: string; // File path: "dataset/test/0/9545822R.png" 
    phase: string;
    diagnosis: 'igen' | 'nem';
    confidence: number;
    box?: Box;
    heatmapPath: string; // "predicted/0/9545822R_gradcam.png"
}

// Cache for the loaded data
let cachedPredictions: AIPrediction[] = [];
let isLoaded = false;

// Helper to parse CSV line
const parseCSVLine = (line: string): AIPrediction | null => {
    const parts = line.split(',');
    if (parts.length < 18) return null; // Ensure we have enough columns

    // NEW CSV Columns (header based):
    // 0: image
    // 4: ai_confidence (e.g. 0.9663)
    // 9: prediction (0 or 1)
    // 15: bbox_xmin_norm
    // 16: bbox_ymin_norm
    // 17: bbox_xmax_norm
    // 18: bbox_ymax_norm

    const imageId = parts[0];
    const probability = parseFloat(parts[4]); // Using ai_confidence
    const predictionBin = parseInt(parts[9]);

    // BBox (normalized)
    const xmin = parseFloat(parts[15]);
    const ymin = parseFloat(parts[16]);
    const xmax = parseFloat(parts[17]);
    const ymax = parseFloat(parts[18]);

    // Check if box exists (validity check).
    const hasBox = (xmax > 0 || ymax > 0);

    // Construct paths
    const plainImagePath = `/dataset/no_map/${imageId}`;
    const finalHeatmapPath = `/dataset/map/${imageId}`;

    return {
        id: imageId,
        imageName: plainImagePath,
        phase: 'phase1',
        diagnosis: predictionBin === 1 ? 'igen' : 'nem',
        confidence: probability,
        box: hasBox ? {
            x: xmin,
            y: ymin,
            width: xmax - xmin,
            height: ymax - ymin
        } : undefined, // Box is NORMALIZED (0-1)
        heatmapPath: finalHeatmapPath
    };
};

export const loadPredictions = async () => {
    if (isLoaded) return;

    try {
        const response = await fetch('/dataset/predictions.csv');
        const text = await response.text();
        const lines = text.split('\n');

        // Skip header
        const dataLines = lines.slice(1);

        cachedPredictions = dataLines
            .map(line => parseCSVLine(line))
            .filter((p): p is AIPrediction => p !== null);

        isLoaded = true;
        console.log(`Loaded ${cachedPredictions.length} predictions from CSV.`);
    } catch (e) {
        console.error("Failed to load predictions CSV:", e);
    }
};

export const getAIPrediction = async (index: number): Promise<AIPrediction | null> => {
    await loadPredictions();

    // index is 1-based from the flow (1..50)
    // CSV 'image' column is "1.png", "2.png"
    const targetId = `${index}.png`;

    // Find matching entry
    const match = cachedPredictions.find(p => p.id === targetId);

    console.log(`[aiLookup] Looking for Index: ${index} (TargetID: ${targetId}). Found: ${!!match}`);

    if (match) {
        // console.log(`[aiLookup] Found match:`, match.imageName);
    } else {
        console.warn(`[aiLookup] No match found for ${targetId}`);
    }

    // Fallback logic if strict match fails (or use mock for safety if allowed, but better to return null/error)
    return match || null;
};


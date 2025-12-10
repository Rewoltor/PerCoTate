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
    if (parts.length < 19) return null;

    // CSV Columns (0-indexed based on header):
    // 0: image, 1: phase, 2: image_name, ...
    // 4: ground_truth_binary (0 or 1), 6: probability, 
    // 8: overlay, 13: bbox_xmin_norm, 14: bbox_ymin_norm, 15: bbox_xmax_norm, 16: bbox_ymax_norm

    const imageId = parts[0];
    const phase = parts[1];
    // const imageName = parts[2];
    const gtBinary = parseInt(parts[4]);
    const probability = parseFloat(parts[6]);
    // const overlay = parts[8]; // Unused

    // BBox (normalized)
    const xmin = parseFloat(parts[13]);
    const ymin = parseFloat(parts[14]);
    const xmax = parseFloat(parts[15]);
    const ymax = parseFloat(parts[16]);

    // Check if box exists (validity check, e.g. if area is 0 or all 0, implies no box?)
    // CSV snippet shows 0,0,0,0 for no-box entries (row 2)
    const hasBox = xmax > 0 || ymax > 0;

    // Extract pure filename from path (e.g. "dataset/test/0/9545822R.png" -> "9545822R.png")
    // const filename = imageName.split('/').pop() || imageName;

    // UPDATED LOGIC (USER REQUEST 701): 
    // The user states: "the images inside the ifle are named the same as the image variable in the AI_predictions.csv file"
    // The 'image' column (imageId variable here) contains "1.png", "2.png", etc.
    // The files in public/dataset/no_map are indeed "1.png", "2.png".
    // So we should ignore the deep path in column 2 (imageName) and use column 0 (imageId).

    const filename = imageId; // "1.png"

    // Construct new paths based on "dataset/no_map" (plain) and "dataset/map" (heatmap)
    const plainImagePath = `/dataset/no_map/${filename}`;

    // UPDATED LOGIC (User Request): Use the same filename but in the 'map' folder.
    // Ignore the 'overlay' column from CSV for now as it points to invalid paths.
    const finalHeatmapPath = `/dataset/map/${filename}`;

    return {
        id: `${phase}_${imageId}`, // Composite key
        imageName: plainImagePath, // UPDATED PATH: now /dataset/no_map/1.png
        phase: phase,
        diagnosis: gtBinary === 1 ? 'igen' : 'nem', // Or should this be the prediction? CSV has 'prediction' at col 7
        confidence: probability,
        box: hasBox ? {
            x: xmin,
            y: ymin,
            width: xmax - xmin,
            height: ymax - ymin
        } : undefined,
        heatmapPath: finalHeatmapPath
    };
};

export const loadPredictions = async () => {
    if (isLoaded) return;

    try {
        const response = await fetch('/data/AI_predictions.csv');
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

export const getAIPrediction = async (index: number, _phaseFilter: string = 'baseline'): Promise<AIPrediction | null> => {
    await loadPredictions();

    // index is 1-based from the flow (1..50)
    // CSV 'image' column is "1.png", "2.png"
    const targetId = `${index}.png`;

    // Find matching entry
    // UPDATED LOGIC: Search by image filename part (e.g. "19.png") regardless of phase prefix.
    // The CSV assigns phases (baseline, experiment, etc.) to specific ranges, but our app randomizes 1-50 access.
    // We just need the metadata for that ID.
    const match = cachedPredictions.find(p => p.id.endsWith(`_${targetId}`));

    console.log(`[aiLookup] Looking for Index: ${index} (TargetID: ${targetId}). Found: ${!!match}`);

    if (match) {
        // console.log(`[aiLookup] Found match:`, match.imageName);
    } else {
        console.warn(`[aiLookup] No match found for ${targetId}`);
    }

    // Fallback logic if strict match fails (or use mock for safety if allowed, but better to return null/error)
    return match || null;
};


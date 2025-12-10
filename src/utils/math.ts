export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const calculateIoU = (box1: Box | null, box2: Box | null): number => {
    if (!box1 || !box2) return 0;

    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    const intersectionWidth = Math.max(0, x2 - x1);
    const intersectionHeight = Math.max(0, y2 - y1);
    const intersectionArea = intersectionWidth * intersectionHeight;

    const box1Area = box1.width * box1.height;
    const box2Area = box2.width * box2.height;
    const unionArea = box1Area + box2Area - intersectionArea;

    if (unionArea === 0) return 0;

    return (intersectionArea / unionArea) * 100; // Return as percentage 0-100
};

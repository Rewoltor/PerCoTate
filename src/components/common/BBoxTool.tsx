import React, { useRef, useState, useEffect } from 'react';

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface BBoxToolProps {
    src: string;
    onChange: (box: Box | null) => void;
    overlayBox?: Box | null;
    enabled?: boolean;
}

export const BBoxTool: React.FC<BBoxToolProps> = ({
    src,
    onChange,
    overlayBox,
    enabled = true,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const containerRef = useRef<HTMLDivElement>(null);

    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [displayBox, setDisplayBox] = useState<Box | null>(null); // in displayed pixels

    // Helper: Client -> Display Coords
    const clientToDisplay = (clientX: number, clientY: number) => {
        const img = imgRef.current;
        if (!img) return null;
        const rect = img.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        return { x, y, rect };
    };

    // Helper: Display -> Natural Coords
    const displayToNatural = (box: Box) => {
        const img = imgRef.current;
        if (!img || !box) return null;
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        return {
            x: Math.round(box.x * scaleX),
            y: Math.round(box.y * scaleY),
            width: Math.round(box.width * scaleX),
            height: Math.round(box.height * scaleY),
        };
    };

    // Helper: Natural -> Display Coords
    const naturalToDisplay = (box: Box) => {
        const img = imgRef.current;
        if (!img || !box) return null;
        const rect = img.getBoundingClientRect();
        const scaleX = rect.width / img.naturalWidth;
        const scaleY = rect.height / img.naturalHeight;
        return {
            x: box.x * scaleX,
            y: box.y * scaleY,
            width: box.width * scaleX,
            height: box.height * scaleY,
        };
    };

    // Resize Canvas
    const resizeCanvas = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        const rect = img.getBoundingClientRect();
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
        canvas.style.width = `${Math.round(rect.width)}px`;
        canvas.style.height = `${Math.round(rect.height)}px`;
        draw();
    };

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Sync Overlay Box
    useEffect(() => {
        if (overlayBox) {
            const d = naturalToDisplay(overlayBox);
            if (d) setDisplayBox(d);
        } else {
            // Only reset if we are not currently drawing? 
            // Logic check: if overlayBox becomes null, we clear display.
            // User drawing overrides this usually.
            // For now, simple sync.
            // setDisplayBox(null); // Wait, this clears user work if prop updates?
            // Usually dependent on how parent manages state.
        }
    }, [overlayBox]);

    // Handle Pointers
    const getClientFromEvent = (e: any) => {
        if (!e) return null;
        if (typeof e.clientX === 'number') return { clientX: e.clientX, clientY: e.clientY };
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        return touch ? { clientX: touch.clientX, clientY: touch.clientY } : null;
    };

    const handlePointerDown = (e: any) => {
        if (!enabled) return;
        const c = getClientFromEvent(e);
        if (!c) return;
        const p = clientToDisplay(c.clientX, c.clientY);
        if (!p) return;
        setStartPoint({ x: p.x, y: p.y });
        setDrawing(true);
    };

    const handlePointerMove = (e: any) => {
        if (!enabled || !drawing || !startPoint) return;
        const c = getClientFromEvent(e);
        if (!c) return;
        const p = clientToDisplay(c.clientX, c.clientY);
        if (!p) return;

        const x = Math.min(startPoint.x, p.x);
        const y = Math.min(startPoint.y, p.y);
        const w = Math.abs(p.x - startPoint.x);
        const h = Math.abs(p.y - startPoint.y);
        setDisplayBox({ x, y, width: w, height: h });
        draw();
    };

    const handlePointerUp = (_e: any) => {
        if (!displayBox) {
            setDrawing(false);
            setStartPoint(null);
            return;
        }
        const nat = displayToNatural(displayBox);
        if (nat) onChange(nat);
        setDrawing(false);
        setStartPoint(null);
    };

    const clearBox = () => {
        setDisplayBox(null);
        onChange(null);
        draw();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (displayBox) {
            ctx.strokeStyle = 'rgba(16,185,129,0.95)'; // Green
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(displayBox.x, displayBox.y, displayBox.width, displayBox.height);
            ctx.fillStyle = 'rgba(16,185,129,0.12)';
            ctx.fillRect(displayBox.x, displayBox.y, displayBox.width, displayBox.height);
        }
    };

    // Re-draw context on state change
    useEffect(() => {
        draw();
    }, [displayBox]);

    // Image load handler
    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        const onLoad = () => resizeCanvas();
        img.addEventListener('load', onLoad);
        // Force resize if already complete
        if (img.complete) resizeCanvas();
        return () => img.removeEventListener('load', onLoad);
    }, [src]);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="relative border rounded-md overflow-hidden bg-black" style={{ minHeight: '300px' }}>
                <img
                    ref={imgRef}
                    src={src}
                    alt="annotation"
                    className="max-h-[60rem] object-contain block select-none"
                    draggable={false}
                />
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    // Touch events usually handled by pointer events in modern React, but explicit touch might be needed for scroll prevention
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: enabled ? 'auto' : 'none',
                        touchAction: 'none', // Critical for drawing on mobile
                        cursor: enabled ? 'crosshair' : 'default',
                    }}
                />
            </div>

            {/* External controls if needed, e.g. Clear */}
            {enabled && (
                <div className="mt-2 text-sm text-gray-500">
                    {displayBox ? (
                        <button onClick={clearBox} className="text-red-500 hover:underline">Clear Box</button>
                    ) : (
                        <span>Draw a box around the finding</span>
                    )}
                </div>
            )}
        </div>
    );
};

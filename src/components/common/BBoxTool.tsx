import React, { useRef, useState, useEffect } from 'react';

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ColoredBox {
    id: string;
    box: Box;
    color: string;
    label?: string;
}

interface BBoxToolProps {
    src: string;
    boxes: ColoredBox[];
    activeBoxId: string | null;
    onChange: (id: string, box: Box | null) => void;
    enabled?: boolean;
    scale?: number; // Zoom scale factor (1.0 = 100%, 2.0 = 200%)
}

export const BBoxTool: React.FC<BBoxToolProps> = ({
    src,
    boxes,
    activeBoxId,
    onChange,
    enabled = true,
    scale = 1.0,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentDragBox, setCurrentDragBox] = useState<Box | null>(null);

    // Track the displayed dimensions (natural size × scale)
    const [displayWidth, setDisplayWidth] = useState(0);
    const [displayHeight, setDisplayHeight] = useState(0);


    // Update displayed dimensions when image loads or scale changes
    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const updateDimensions = () => {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

            // Calculate display size: natural size × scale
            const newWidth = Math.round(img.naturalWidth * scale);
            const newHeight = Math.round(img.naturalHeight * scale);

            setDisplayWidth(newWidth);
            setDisplayHeight(newHeight);
        };

        if (img.complete && img.naturalWidth > 0) {
            updateDimensions();
        }

        img.addEventListener('load', updateDimensions);
        return () => img.removeEventListener('load', updateDimensions);
    }, [src, scale]);

    // Update canvas size when display dimensions change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || displayWidth === 0 || displayHeight === 0) return;

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Redraw after canvas resize
        draw();
    }, [displayWidth, displayHeight]);

    // Helper: Client -> Display Coords
    const clientToDisplay = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(displayWidth, clientX - rect.left));
        const y = Math.max(0, Math.min(displayHeight, clientY - rect.top));
        return { x, y };
    };

    // Helper: Display -> Natural Coords
    const displayToNatural = (box: Box) => {
        const img = imgRef.current;
        if (!img || !box || img.naturalWidth === 0 || img.naturalHeight === 0) return null;

        // Since displayWidth = naturalWidth × scale, we just divide by scale
        return {
            x: Math.round(box.x / scale),
            y: Math.round(box.y / scale),
            width: Math.round(box.width / scale),
            height: Math.round(box.height / scale),
        };
    };

    // Helper: Natural -> Display Coords  
    const naturalToDisplay = (box: Box) => {
        if (!box) return null;

        // Since displayWidth = naturalWidth × scale, we just multiply by scale
        return {
            x: box.x * scale,
            y: box.y * scale,
            width: box.width * scale,
            height: box.height * scale,
        };
    };

    // Draw everything
    const draw = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all boxes (converted from natural to display)
        boxes.forEach((coloredBox) => {
            const displayBox = naturalToDisplay(coloredBox.box);
            if (!displayBox) return;

            ctx.strokeStyle = coloredBox.color || 'blue';
            ctx.lineWidth = 3;
            ctx.strokeRect(displayBox.x, displayBox.y, displayBox.width, displayBox.height);

            // Label (optional)
            if (coloredBox.label) {
                ctx.fillStyle = coloredBox.color || 'blue';
                ctx.font = '14px sans-serif';
                ctx.fillText(coloredBox.label, displayBox.x + 5, displayBox.y - 5);
            }
        });

        // Draw current drag box if drawing
        if (currentDragBox) {
            ctx.strokeStyle = getActiveBoxColor();
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(currentDragBox.x, currentDragBox.y, currentDragBox.width, currentDragBox.height);
            ctx.setLineDash([]);
        }
    };

    const getActiveBoxColor = () => {
        if (!activeBoxId) return 'rgba(0,0,0,0.2)';
        const found = boxes.find(b => b.id === activeBoxId);
        return found?.color || 'rgba(0,0,0,0.2)';
    }

    // Redraw when boxes change or scale changes
    useEffect(() => {
        draw();
    }, [boxes, currentDragBox, scale, displayWidth, displayHeight]);

    // Handle Pointers
    const getClientFromEvent = (e: any) => {
        if (!e) return null;
        if (typeof e.clientX === 'number') return { clientX: e.clientX, clientY: e.clientY };
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        return touch ? { clientX: touch.clientX, clientY: touch.clientY } : null;
    };

    const handlePointerDown = (e: any) => {
        if (!enabled || !activeBoxId) return;
        const c = getClientFromEvent(e);
        if (!c) return;
        const p = clientToDisplay(c.clientX, c.clientY);
        if (!p) return;
        setStartPoint({ x: p.x, y: p.y });
        setDrawing(true);
        setCurrentDragBox(null);

        // Prevent scrolling on touch
        if (e.type === 'touchstart') {
            // e.preventDefault(); // React synthetic events might complain, handled in style
        }
    };

    const handlePointerMove = (e: any) => {
        if (!enabled || !drawing || !startPoint || !activeBoxId) return;
        const c = getClientFromEvent(e);
        if (!c) return;
        const p = clientToDisplay(c.clientX, c.clientY);
        if (!p) return;

        const x = Math.min(startPoint.x, p.x);
        const y = Math.min(startPoint.y, p.y);
        const w = Math.abs(p.x - startPoint.x);
        const h = Math.abs(p.y - startPoint.y);
        setCurrentDragBox({ x, y, width: w, height: h });
        // Draw is triggered by state set
    };

    const handlePointerUp = (_e: any) => {
        if (!drawing) return;
        setDrawing(false);
        setStartPoint(null);

        if (currentDragBox && activeBoxId) {
            const nat = displayToNatural(currentDragBox);
            if (nat) {
                onChange(activeBoxId, nat);
            }
        }
        setCurrentDragBox(null);
    };

    return (
        <div className="w-full h-full flex items-center justify-center overflow-auto relative" ref={containerRef}>
            <div
                className="relative flex-shrink-0"
                style={{
                    width: displayWidth || 'auto',
                    height: displayHeight || 'auto',
                }}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt="annotation"
                    className="block select-none"
                    style={{
                        width: displayWidth || 'auto',
                        height: displayHeight || 'auto',
                        objectFit: 'contain',
                    }}
                    draggable={false}
                />
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: displayWidth || 0,
                        height: displayHeight || 0,
                        pointerEvents: (enabled && activeBoxId) ? 'auto' : 'none',
                        touchAction: 'none',
                        cursor: (enabled && activeBoxId) ? 'crosshair' : 'default',
                    }}
                />
            </div>

            {/* Hint */}
            {enabled && activeBoxId && (
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        Rajzolás folyamatban ({activeBoxId === 'box1' ? 'Melléklelet 1' : 'Melléklelet 2'})
                    </span>
                </div>
            )}
        </div>
    );
};

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
}

export const BBoxTool: React.FC<BBoxToolProps> = ({
    src,
    boxes,
    activeBoxId,
    onChange,
    enabled = true,
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [drawing, setDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    // We don't keep local display state for all boxes, we calculate on render/prop update
    // But for the *currently drawing* box, we need immediate feedback.
    const [currentDragBox, setCurrentDragBox] = useState<Box | null>(null);

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
        // Prevent division by zero
        if (rect.width === 0 || rect.height === 0) return null;

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
        if (img.naturalWidth === 0 || img.naturalHeight === 0) return null;

        const scaleX = rect.width / img.naturalWidth;
        const scaleY = rect.height / img.naturalHeight;
        return {
            x: box.x * scaleX,
            y: box.y * scaleY,
            width: box.width * scaleX,
            height: box.height * scaleY,
        };
    };

    // Draw everything
    const draw = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw existing boxes (from props)
        boxes.forEach(b => {
            // If we are currently redrawing this specific box, skip it in the static render
            // (we draw the drag box instead)
            if (drawing && activeBoxId === b.id) return;

            const dBox = naturalToDisplay(b.box);
            if (dBox) {
                drawBox(ctx, dBox, b.color, b.label);
            }
        });

        // Draw currently dragging box
        if (drawing && currentDragBox && activeBoxId) {
            const activeColor = boxes.find(b => b.id === activeBoxId)?.color || '#00FF00';
            drawBox(ctx, currentDragBox, activeColor, "Rajzolás...");
        }
    };

    const drawBox = (ctx: CanvasRenderingContext2D, box: Box, color: string, label?: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // Solid line
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Fill
        // Parse hex to rgba for fill
        ctx.fillStyle = hexToRgba(color, 0.2);
        ctx.fillRect(box.x, box.y, box.width, box.height);

        // Label
        if (label) {
            ctx.fillStyle = color;
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(label, box.x, box.y - 5);
        }
    };

    const hexToRgba = (hex: string, alpha: number) => {
        // Very basic implementation
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return 'rgba(0,0,0,0.2)'; // Fallback
    }

    // Resize Canvas
    const resizeCanvas = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

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

    // Redraw when boxes change
    useEffect(() => {
        // Use timeout to ensure image might be laid out? 
        // Actually requestAnimationFrame is better but basic effect is fine.
        draw();
    }, [boxes, src, currentDragBox, drawing]); // Dependencies

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

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        const onLoad = () => resizeCanvas();
        img.addEventListener('load', onLoad);
        if (img.complete) resizeCanvas();
        return () => img.removeEventListener('load', onLoad);
    }, [src]);

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <div className="relative flex-shrink-0" style={{ maxHeight: 'calc(100% - 60px)', maxWidth: '100%' }}>
                <img
                    ref={imgRef}
                    src={src}
                    alt="annotation"
                    className="max-h-full max-w-full object-contain block select-none"
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
                        width: '100%',
                        height: '100%',
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

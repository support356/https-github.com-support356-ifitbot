import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BodyFatSelectorProps {
    value: number;
    onChange: (value: number) => void;
}

const IMG_URL_BASE = "https://i.imgur.com/urJL7dp"; // 20% starting avatar
const EXTS = [".webp",".png",".jpg"];

// Helper function to load an image with format fallbacks
function loadImageWithFallback(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let i = 0;
        let img = new Image();
        const next = () => {
            if (i >= EXTS.length) {
                reject(new Error('All image formats failed to load'));
                return;
            }
            img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => { i++; next(); };
            img.src = IMG_URL_BASE + EXTS[i];
        };
        next();
    });
}

// Maps a slider value (5-45) to a warp amount (0-1, non-linear)
const valueToAmount = (v: number) => {
    const t = Math.max(0, Math.min(1, (v - 15) / 30));
    return t * t;
};

// Maps a value to a label string
const labelFor = (v: number) => {
    if (v >= 40) return '>40%';
    // Fix: Refactored to separate Math.floor and Math.max calls to address a potential TS compiler issue.
    const base = Math.floor(v / 5) * 5;
    const a = Math.max(5, base);
    return `${a}–${a + 4}%`;
}

export default function BodyFatSelector({ value, onChange }: BodyFatSelectorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Fix: Used lazy initialization for useState to work around a potential compiler issue causing a false positive error on this line.
    const [bubbleLabel, setBubbleLabel] = useState(() => '');
    // Fix: Used lazy initialization for useState to work around a potential compiler issue causing a false positive error on this line.
    const [bubbleLeft, setBubbleLeft] = useState(() => '50%');
    
    // Using refs to hold onto canvas-related state that doesn't trigger re-renders
    const imageRef = useRef<HTMLImageElement>();
    const bufferCanvasRef = useRef<HTMLCanvasElement>();
    const regionRef = useRef<any>({});
    const fitRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

    const drawWarp = useCallback((base: HTMLCanvasElement, amount: number) => {
        const cv = canvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const reg = regionRef.current;
        if (!ctx || !reg.ready) return;

        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(base, 0, 0);

        reg.src.clearRect(0, 0, reg.w, reg.h);
        reg.src.drawImage(base, reg.x, reg.y, reg.w, reg.h, 0, 0, reg.w, reg.h);

        const w = reg.w, h = reg.h, mid = w / 2, waist = h * 0.36;
        reg.work.clearRect(0, 0, w, h);

        const step = 1;
        for (let y = 0; y < h; y += step) {
            const d = (y - waist) / h;
            const profile = Math.exp(-(d * d) / 0.050);
            const extra = amount * 0.28 * profile;
            const sag = amount * 9 * Math.max(0, (y - waist) / (h - waist));
            const leftScale = 1 + extra * 1.08;
            const rightScale = 1 + extra * 1.08;

            reg.work.drawImage(reg.srcC, 0, y, mid, step, mid - (mid * leftScale), y + sag, mid * leftScale, step);
            reg.work.drawImage(reg.srcC, mid, y, mid, step, mid, y + sag, mid * rightScale, step);
        }

        if (amount > 0.01) {
            reg.work.filter = 'blur(0.25px)';
            reg.work.drawImage(reg.workC, 0, 0);
            reg.work.filter = 'none';
        }

        reg.out.clearRect(0, 0, w, h);
        reg.out.globalCompositeOperation = 'source-over';
        reg.out.drawImage(reg.workC, 0, 0);
        reg.out.globalCompositeOperation = 'destination-in';
        reg.out.drawImage(reg.maskC, 0, 0);
        
        ctx.drawImage(reg.outC, reg.x, reg.y);

        if (amount > 0) {
            ctx.save();
            const cx = cv.width / 2, gy = reg.y + waist;
            const g = ctx.createRadialGradient(cx, gy + 10, 24, cx, gy + 42, h * 0.90);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(1, `rgba(0,0,0,${0.20 * amount})`);
            ctx.fillStyle = g;
            ctx.fillRect(reg.x - 60, reg.y - 30, reg.w + 120, reg.h + 80);
            ctx.restore();
        }
    }, []);

    // Effect for initialization and resize handling
    useEffect(() => {
        const cv = canvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const setupRegion = (base: HTMLCanvasElement) => {
            const fit = fitRef.current;
            const cx = cv.width / 2;
            const top = fit.y + fit.h * 0.46;
            const bottom = fit.y + fit.h * 0.80;
            const torsoW = fit.w * 0.34;
            const reg = {
                x: Math.round(cx - torsoW / 2),
                y: Math.round(top),
                w: Math.round(torsoW),
                h: Math.round(bottom - top),
                ready: false,
            };

            const createCanvasAndContext = (width: number, height: number) => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                if (context) {
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                }
                return { C: canvas, c: context };
            };

            const { C: srcC, c: src } = createCanvasAndContext(reg.w, reg.h);
            const { C: workC, c: work } = createCanvasAndContext(reg.w, reg.h);
            const { C: outC, c: out } = createCanvasAndContext(reg.w, reg.h);
            const { C: maskC, c: mask } = createCanvasAndContext(reg.w, reg.h);

            if (!src || !work || !out || !mask) return;

            const mx = reg.w / 2, my = reg.h / 2;
            const grad = mask.createRadialGradient(mx, my, Math.min(mx, my) * 0.25, mx, my, Math.max(mx, my));
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            mask.fillStyle = grad;
            mask.fillRect(0, 0, reg.w, reg.h);
            
            regionRef.current = { ...reg, srcC, src, workC, work, outC, out, maskC, mask, ready: true };
        };

        const handleResize = () => {
            const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
            const rect = cv.getBoundingClientRect();
            cv.width = Math.round(rect.width * dpr);
            cv.height = Math.round(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (imageRef.current && bufferCanvasRef.current) {
                const img = imageRef.current;
                const buffer = bufferCanvasRef.current;
                const bctx = buffer.getContext('2d');

                const s = Math.min(cv.width / img.width, cv.height / img.height);
                fitRef.current = {
                    w: img.width * s,
                    h: img.height * s,
                    x: (cv.width - (img.width * s)) / 2,
                    y: (cv.height - (img.height * s)) / 2
                };
                
                buffer.width = cv.width;
                buffer.height = cv.height;

                if (bctx) {
                    bctx.imageSmoothingEnabled = true;
                    bctx.imageSmoothingQuality = 'high';
                    bctx.drawImage(img, 0, 0, img.width, img.height, fitRef.current.x, fitRef.current.y, fitRef.current.w, fitRef.current.h);
                }

                setupRegion(buffer);
                drawWarp(buffer, valueToAmount(value));
            }
        };

        let isMounted = true;
        
        const init = async () => {
            try {
                const img = await loadImageWithFallback();
                if (!isMounted) return;
                
                imageRef.current = img;
                bufferCanvasRef.current = document.createElement('canvas');
                
                handleResize(); // This will setup canvas, buffer, region and draw for the first time
                setIsLoading(false);

            } catch (error) {
                console.error("Failed to load image:", error);
                if(isMounted) setIsLoading(false); // show broken state
            }
        };

        init();
        
        window.addEventListener('resize', handleResize);
        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
        };
    }, [drawWarp, value]);

    // Effect to update drawing when value changes
    useEffect(() => {
        const buffer = bufferCanvasRef.current;
        if (buffer && !isLoading) {
            drawWarp(buffer, valueToAmount(value));
        }
        
        const min = 5, max = 45;
        const p = (value - min) / (max - min);
        setBubbleLabel(labelFor(value));
        setBubbleLeft(`calc(${p * 100}% )`);

    }, [value, isLoading, drawWarp]);

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
             <style>{`
                :root{--accent:#ff4d00;}
                input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:12px;border-radius:999px;background:linear-gradient(90deg,#00d084 0%,#ffd000 45%,#ff5c00 70%,#ff1f1f 100%);outline:none}
                input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);cursor:pointer}
                input[type=range]::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);cursor:pointer}
            `}</style>
            <div className="relative w-full max-w-md">
                <canvas ref={canvasRef} className="w-full h-auto aspect-[3/4] rounded-2xl" aria-label="Body fat avatar"></canvas>
                {isLoading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-gray-800/50 backdrop-blur-sm rounded-2xl text-white">
                        Loading Avatar...
                    </div>
                )}
            </div>
            <div className="w-full p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
                <div className="relative mx-2 my-3">
                    <div
                      className="absolute top-[-44px] transform -translate-x-1/2 px-3 py-1.5 rounded-lg bg-gray-700 text-white font-bold text-sm whitespace-nowrap shadow-lg transition-all"
                      style={{ left: bubbleLeft }}
                    >
                        {bubbleLabel}
                        <div className="absolute left-1/2 bottom-[-6px] transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-700" style={{borderWidth: '6px', borderStyle: 'solid', borderColor: '#4a5568 transparent transparent transparent'}}></div>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="45"
                        step="1"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value, 10))}
                        aria-label="Body fat percentage"
                    />
                    <div className="flex justify-between text-gray-400 text-sm mt-2.5">
                        <span>5–9%</span>
                        <span>&gt;40%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Home, PenTool, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { ARABIC_LETTERS, TOTAL_LETTERS } from '@/data/letters';
import { BackHeader } from '@/components/BackHeader';
import {
  buildTargetMask,
  validateStrokes,
  computeCoverage,
  THRESHOLDS,
  type StrokePoint,
  type TargetMask,
} from '@/lib/tracingValidation';

interface Props {
  onHome: () => void;
  startLetter: number; // 1-based
  onProgress: (completedCount: number, unlockedIndex: number) => void;
  selectedClass: 1 | 2 | 3;
}

const STROKE_COLOR = '#0b6453';
const STROKE_WIDTH = 9;
const GUIDE_OPACITY = 0.22;
const COMPLETION_THRESHOLD = 0.60;
const LETTER_LIMITS: Record<1 | 2 | 3, number> = {
  1: TOTAL_LETTERS,
  2: 16,
  3: TOTAL_LETTERS,
};

export function WritingView({ onHome, startLetter, onProgress, selectedClass }: Props) {
  const maxLetters = LETTER_LIMITS[selectedClass];
  const [letterIdx, setLetterIdx] = useState(() => Math.max(0, Math.min(maxLetters - 1, startLetter - 1)));
  const [completed, setCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [showRestart, setShowRestart] = useState(false);

  const current = ARABIC_LETTERS[letterIdx];

  // Refs
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<StrokePoint[]>([]);
  const lastPtRef = useRef<StrokePoint | null>(null);
  const targetMaskRef = useRef<TargetMask | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const validatingRef = useRef(false);

  const completedCount = useMemo(() => {
    if (allDone) return maxLetters;
    return letterIdx + (completed ? 1 : 0);
  }, [letterIdx, completed, allDone, maxLetters]);

  // Notify parent of progress
  useEffect(() => {
    if (allDone) {
      onProgress(maxLetters, maxLetters);
    } else {
      onProgress(completedCount, Math.min(maxLetters, letterIdx + (completed ? 2 : 1)));
    }
  }, [completedCount, letterIdx, completed, allDone, maxLetters, onProgress]);

  // Resize handling — rebuild canvases when container size changes
  useEffect(() => {
    const container = containerRef.current;
    const guide = guideCanvasRef.current;
    const draw = drawCanvasRef.current;
    if (!container || !guide || !draw) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(200, Math.floor(rect.width));
      const h = Math.max(200, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Save current strokes in device-independent coords
      const savedPoints = pointsRef.current.slice();
      const oldW = sizeRef.current.w;
      const oldH = sizeRef.current.h;

      [guide, draw].forEach((cv) => {
        cv.width = w * dpr;
        cv.height = h * dpr;
        cv.style.width = `${w}px`;
        cv.style.height = `${h}px`;
        const ctx = cv.getContext('2d')!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      });

      sizeRef.current = { w, h };

      // Draw guide letter
      drawGuide(current.arabic, w, h);

      // Rebuild target mask
      rebuildMask(guide, w, h);

      // Rescale & redraw existing strokes if we had old dimensions
      if (oldW > 0 && oldH > 0 && savedPoints.length > 0) {
        const scaleX = w / oldW;
        const scaleY = h / oldH;
        const rescaled = savedPoints.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }));
        pointsRef.current = rescaled;
        redrawStrokes(draw.getContext('2d')!, rescaled);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.arabic]);

  const drawGuide = useCallback((letter: string, w: number, h: number) => {
    const guide = guideCanvasRef.current;
    if (!guide) return;
    const ctx = guide.getContext('2d')!;
    // Completely clear any previous guide first
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f0faf6';
    ctx.fillRect(0, 0, w, h);

    // Draw faded, slightly blurred guide letter
    ctx.save();
    ctx.globalAlpha = GUIDE_OPACITY;
    ctx.fillStyle = '#0b6453';
    ctx.shadowColor = 'rgba(13,124,102,0.3)';
    ctx.shadowBlur = 10;
    ctx.filter = 'blur(1.5px)';
    let fontSize = Math.floor(Math.min(w, h) * 0.72);
    ctx.font = `700 ${fontSize}px Amiri, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const measured = ctx.measureText(letter);
    if (measured.width > w * 0.85) {
      fontSize = Math.floor(fontSize * ((w * 0.85) / measured.width));
      ctx.font = `700 ${fontSize}px Amiri, serif`;
    }
    ctx.fillText(letter, w / 2, h / 2 + fontSize * 0.05);
    ctx.restore();
  }, []);

  const rebuildMask = useCallback((guide: HTMLCanvasElement, w: number, h: number) => {
    // Build the target mask from a CLEAN offscreen render of the letter only
    // (no background fill), so only actual letter pixels become target cells.
    // The guide canvas has a full-canvas background fill which would make every
    // pixel opaque and turn the entire canvas into the "target" region.
    void guide;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const offCtx = off.getContext('2d', { willReadFrequently: true })!;
    offCtx.clearRect(0, 0, w, h);
    // Render the letter at full opacity with the same font metrics as drawGuide
    offCtx.save();
    offCtx.fillStyle = '#0b6453';
    let fontSize = Math.floor(Math.min(w, h) * 0.72);
    offCtx.font = `700 ${fontSize}px Amiri, serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    const measured = offCtx.measureText(current.arabic);
    if (measured.width > w * 0.85) {
      fontSize = Math.floor(fontSize * ((w * 0.85) / measured.width));
      offCtx.font = `700 ${fontSize}px Amiri, serif`;
    }
    offCtx.fillText(current.arabic, w / 2, h / 2 + fontSize * 0.05);
    offCtx.restore();

    const data = offCtx.getImageData(0, 0, w, h);
    targetMaskRef.current = buildTargetMask(data, THRESHOLDS.gridN, THRESHOLDS.proximityDilation);
  }, [current.arabic]);

  const redrawStrokes = useCallback((ctx: CanvasRenderingContext2D, pts: StrokePoint[]) => {
    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);
    if (pts.length < 2) {
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = STROKE_COLOR;
        ctx.fill();
      }
      return;
    }
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      // smooth using quadratic midpoint
      const mid = { x: (pts[i - 1].x + pts[i].x) / 2, y: (pts[i - 1].y + pts[i].y) / 2 };
      ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mid.x, mid.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }, []);

  const getPoint = useCallback((e: PointerEvent | React.PointerEvent): StrokePoint => {
    const draw = drawCanvasRef.current!;
    const rect = draw.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (completed || allDone) return;
      e.preventDefault();
      const draw = drawCanvasRef.current!;
      draw.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const p = getPoint(e);
      pointsRef.current.push(p);
      lastPtRef.current = p;
      setFeedback(null);
      const ctx = draw.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, STROKE_WIDTH / 2, 0, Math.PI * 2);
      ctx.fillStyle = STROKE_COLOR;
      ctx.fill();
    },
    [completed, allDone, getPoint],
  );

  const updateLiveProgress = useCallback(() => {
    const mask = targetMaskRef.current;
    if (!mask || pointsRef.current.length < 2) {
      setTraceProgress(0);
      return;
    }
    const cov = computeCoverage(pointsRef.current, mask, THRESHOLDS);
    setTraceProgress(Math.round(cov * 100));
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const draw = drawCanvasRef.current!;
      const ctx = draw.getContext('2d')!;
      const p = getPoint(e);
      const last = lastPtRef.current!;
      const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      ctx.strokeStyle = STROKE_COLOR;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      pointsRef.current.push(p);
      lastPtRef.current = p;
      // Throttled live progress update
      if (pointsRef.current.length % 4 === 0) {
        updateLiveProgress();
      }
    },
    [getPoint, updateLiveProgress],
  );

  const handleSuccess = useCallback(() => {
    setCompleted(true);
    setShowSuccess(true);
    setFeedback(null);
    setTraceProgress(100);
  }, []);

  const tryValidate = useCallback(() => {
    if (validatingRef.current || completed || allDone) return;
    const mask = targetMaskRef.current;
    if (!mask) return;
    validatingRef.current = true;
    requestAnimationFrame(() => {
      const result = validateStrokes(pointsRef.current, mask, THRESHOLDS);
      validatingRef.current = false;
      if (result.pass) {
        handleSuccess();
      } else if (result.reason === 'missing-sections') {
        setFeedback('Continue tracing the remaining parts of the letter');
      } else if (result.reason === 'off-target') {
        setFeedback('Try to trace directly over the letter shape');
      } else if (result.strokeLength >= THRESHOLDS.minStrokeLength) {
        setFeedback('Keep tracing the letter');
      }
    });
  }, [allDone, completed, handleSuccess]);

  const endStroke = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPtRef.current = null;
    updateLiveProgress();
    tryValidate();
  }, [tryValidate, updateLiveProgress]);

  const handleReset = useCallback(() => {
    if (completed) return;
    const draw = drawCanvasRef.current;
    if (draw) {
      const ctx = draw.getContext('2d')!;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
    }
    pointsRef.current = [];
    lastPtRef.current = null;
    setFeedback(null);
    setTraceProgress(0);
  }, [completed]);

  const handleNextManual = useCallback(() => {
    if (!completed) return;

    const draw = drawCanvasRef.current;
    if (draw) {
      const ctx = draw.getContext('2d')!;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
    }
    pointsRef.current = [];
    lastPtRef.current = null;

    if (letterIdx + 1 >= maxLetters) {
      setAllDone(true);
      setShowSuccess(false);
      setCompleted(false);
      setTraceProgress(0);
      return;
    }

    const nextIdx = letterIdx + 1;
    const guide = guideCanvasRef.current;
    if (guide) {
      const ctx = guide.getContext('2d')!;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
    }
    setLetterIdx(nextIdx);
    setCompleted(false);
    setShowSuccess(false);
    setTraceProgress(0);

    window.requestAnimationFrame(() => {
      const { w, h } = sizeRef.current;
      drawGuide(ARABIC_LETTERS[nextIdx].arabic, w, h);
      if (guide) rebuildMask(guide, w, h);
    });
  }, [completed, drawGuide, letterIdx, maxLetters, rebuildMask]);

  const handleRestartLevel = useCallback(() => {
    setShowRestart(false);
    const draw = drawCanvasRef.current;
    if (draw) {
      const ctx = draw.getContext('2d')!;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
    }
    const guide = guideCanvasRef.current;
    if (guide) {
      const ctx = guide.getContext('2d')!;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
    }
    pointsRef.current = [];
    lastPtRef.current = null;
    setLetterIdx(0);
    setCompleted(false);
    setShowSuccess(false);
    setAllDone(false);
    setFeedback(null);
    setTraceProgress(0);
    window.requestAnimationFrame(() => {
      const { w, h } = sizeRef.current;
      drawGuide(ARABIC_LETTERS[0].arabic, w, h);
      if (guide) rebuildMask(guide, w, h);
    });
  }, [drawGuide, rebuildMask]);

  // completion screen
  if (allDone) {
    return (
      <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
        <BackHeader title="Writing Complete" onBack={onHome} />
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 to-gold-700 p-8 text-center shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
            <Sparkles size={40} className="text-gold-600" />
          </div>
          <h2 className="font-arabic text-3xl font-bold text-white">مبروك!</h2>
          <p className="mt-1 text-sm text-white/80">Congratulations!</p>
          <div className="mt-6 rounded-2xl bg-white/15 px-4 py-4 ring-1 ring-white/20">
            <p className="text-3xl font-bold text-white">{maxLetters}/{maxLetters}</p>
            <p className="text-xs uppercase tracking-wide text-white/70">Letters Completed</p>
          </div>
          <p className="mt-4 text-sm font-semibold text-white/90">
            You traced all {maxLetters} Arabic letters. MashaAllah!
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => {
                setAllDone(false);
                setLetterIdx(0);
                setCompleted(false);
                setShowSuccess(false);
                setFeedback(null);
                setTraceProgress(0);
                pointsRef.current = [];
                window.requestAnimationFrame(() => {
                  const { w, h } = sizeRef.current;
                  drawGuide(ARABIC_LETTERS[0].arabic, w, h);
                  const guide = guideCanvasRef.current;
                  if (guide) rebuildMask(guide, w, h);
                });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-gold-700 shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <RotateCcw size={18} /> Practice Again
            </button>
            <button
              onClick={onHome}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-95"
            >
              <Home size={18} /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-shell mx-auto max-w-2xl animate-fade-in px-4 pb-28 pt-6 md:pb-12 md:pt-24">
      <BackHeader title="Writing Practice" onBack={onHome} subtitle="Trace the Arabic letters" />

      {/* progress */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
          Letter {letterIdx + 1} of {TOTAL_LETTERS}
        </span>
        <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-700">
          {completedCount}/28 done
        </span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-primary-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-300"
          style={{ width: `${((letterIdx + (completed ? 1 : 0)) / TOTAL_LETTERS) * 100}%` }}
        />
      </div>

      {/* current letter info */}
      <div className="screen-panel liquid-panel relative z-10 mb-3 flex items-center justify-between rounded-[1.5rem] bg-[#fffdf8] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 font-arabic text-3xl font-bold text-primary-900">
            {current.arabic}
          </span>
          <div className="leading-tight">
            <p className="font-malayalam text-base font-semibold text-primary-900">{current.malayalam}</p>
            <p className="text-xs font-medium text-primary-700">{current.english}</p>
          </div>
        </div>
        {showSuccess ? (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 animate-success-pulse">
            <Check size={14} strokeWidth={3} /> Traced!
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-primary-600">
            <PenTool size={14} /> Trace it
          </span>
        )}
      </div>

      {/* live tracing progress */}
      <div className="screen-panel liquid-panel relative z-10 mb-3 rounded-[1.5rem] bg-[#fffdf8] p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold text-primary-700">Tracing Progress</span>
          <span className={`text-sm font-bold ${traceProgress >= COMPLETION_THRESHOLD * 100 ? 'text-green-600' : 'text-primary-600'}`}>
            {traceProgress}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-100">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              traceProgress >= COMPLETION_THRESHOLD * 100
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : 'bg-gradient-to-r from-primary-500 to-teal-500'
            }`}
            style={{ width: `${traceProgress}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-primary-700">
          Reach 60% to complete the letter, then press Next
        </p>
      </div>

      {/* canvas area */}
      <div
        ref={containerRef}
        data-no-scroll
        className="liquid-panel relative aspect-square w-full overflow-hidden rounded-[2rem] border border-[#d9e8df] bg-[#fffdf8] shadow-2xl shadow-primary-900/10"
        style={{ touchAction: 'none' }}
      >
        <canvas ref={guideCanvasRef} className="absolute inset-0 h-full w-full" />
        <canvas
          ref={drawCanvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
        />
        {showSuccess && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[1px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-xl animate-success-pulse">
              <Check size={36} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* feedback */}
      {feedback && (
        <div className="mt-3 rounded-2xl bg-gold-50 px-4 py-2.5 text-center text-sm font-semibold text-gold-700 animate-fade-in">
          {feedback} — keep going!
        </div>
      )}

      {/* actions */}
      <div className="mt-4 flex gap-2.5">
        <button
          onClick={handleReset}
          disabled={completed}
          className="liquid-button interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-primary-700 shadow-sm ring-1 ring-primary-100 hover:bg-primary-50 active:scale-95 disabled:opacity-40"
        >
          <RotateCcw size={18} /> Reset
        </button>
        <button
          onClick={handleNextManual}
          disabled={!completed}
          className={`liquid-button-primary interactive-card flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold active:scale-95 ${
            completed
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
          }`}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      {/* restart level */}
      <button
        onClick={() => setShowRestart(true)}
        className="liquid-button interactive-card mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-50 px-4 py-2.5 text-sm font-bold text-gold-700 ring-1 ring-gold-200 hover:bg-gold-100 active:scale-95"
      >
        <RefreshCw size={16} /> Restart from Beginning
      </button>

      <p className="mt-3 text-center text-xs text-primary-700">
        Trace over the faded letter. Complete it to enable the Next button.
      </p>

      {/* restart confirmation dialog */}
      {showRestart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in">
          <div className="liquid-dialog w-full max-w-sm rounded-[2rem] border border-[#e4dcc9] bg-[#fffdf8] p-6 shadow-2xl">
            <div className="mb-4 flex justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50">
                <RefreshCw size={28} className="text-gold-600" />
              </span>
            </div>
            <h3 className="text-center text-lg font-bold text-primary-900">Restart this practice from the beginning?</h3>
            <p className="mt-2 text-center text-sm text-primary-900">
              You will go back to the first letter and practice all letters again.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowRestart(false)}
                className="flex flex-1 items-center justify-center rounded-2xl bg-gray-100 px-4 py-3 font-bold text-primary-700 transition-all hover:bg-gray-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartLevel}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                <RefreshCw size={18} /> Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

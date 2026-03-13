import React, { useRef, useEffect, useCallback } from 'react';

interface FaceTrackerProps {
  /** Called each frame with normalised face position: x ∈ [-1,1], y ∈ [-1,1] */
  onFacePosition?: (x: number, y: number) => void;
  /** Called when no face has been detected for a while */
  onFaceLost?: () => void;
  /** Enable/disable the webcam */
  enabled?: boolean;
}

/**
 * Lightweight "face tracker" using simple brightness / skin-colour heuristic.
 * Also renders a small live webcam preview window.
 */
const FaceTracker: React.FC<FaceTrackerProps> = ({
  onFacePosition,
  onFaceLost,
  enabled = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastDetectedRef = useRef(Date.now());
  const faceLostFiredRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { rafRef.current = requestAnimationFrame(detect); return; }

    const w = 160, h = 120;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let sumX = 0, sumY = 0, count = 0;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15 && (r - b) > 15) {
          sumX += x;
          sumY += y;
          count++;
        }
      }
    }

    if (count > 200) {
      const cx = sumX / count;
      const cy = sumY / count;
      const nx = -((cx / w) * 2 - 1);
      const ny = -((cy / h) * 2 - 1);
      onFacePosition?.(nx, ny);
      lastDetectedRef.current = Date.now();
      faceLostFiredRef.current = false;
    } else {
      if (Date.now() - lastDetectedRef.current > 5000 && !faceLostFiredRef.current) {
        onFaceLost?.();
        faceLostFiredRef.current = true;
      }
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [onFacePosition, onFaceLost]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(detect);
      })
      .catch((err) => console.warn('Webcam not available:', err));

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [enabled, detect]);

  return (
    <>
      {/* Hidden canvas for pixel analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {enabled && (
        <>
          {/* Status badge + live preview stacked in top-left */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Webcam active
            </div>
            <div className="rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-lg shadow-purple-500/10"
                 style={{ width: 160, height: 120 }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
            </div>
            <p className="text-white/40 text-[10px] text-center">Live Feed</p>
          </div>
        </>
      )}

      {/* When webcam is off, video element is still needed for when it turns on */}
      {!enabled && (
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      )}
    </>
  );
};

export default FaceTracker;

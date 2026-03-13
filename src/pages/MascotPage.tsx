import React, { useState, useEffect, useRef, useCallback } from 'react';
import MascotScene, { mascotState } from '../components/Mascot/MascotScene';
import ChatBox from '../components/Mascot/ChatBox';
import FaceTracker from '../components/Mascot/FaceTracker';
import { emotionController, EmotionName } from '../components/Mascot/MascotController';

const IDLE_MESSAGES = [
  "Working on something interesting? ✨",
  "Remember to take a deep breath~",
  "I'm here if you need to talk! 💖",
  "Don't forget to stretch a little~",
  "You're doing great today! 🌟",
  "Need a break? I'm always here~",
];

const MascotPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamDetected, setWebcamDetected] = useState(false);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const idleTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Show/hide speech bubble helper
  const showBubble = useCallback((text: string, durationMs = 4000) => {
    setSpeechBubble(text);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setSpeechBubble(null), durationMs);
  }, []);

  // ── Greeting when avatar finishes loading ──
  const handleLoaded = useCallback(() => {
    setIsLoading(false);
    emotionController.setEmotion('happy');
  }, []);

  // ── Greeting handler from ChatBox ──
  const handleGreeting = useCallback((text: string, emotion: EmotionName) => {
    showBubble(text, 5000);
    emotionController.setEmotion(emotion);
  }, [showBubble]);

  // ── Idle dialogue every 30-60s ──
  useEffect(() => {
    const startIdle = () => {
      const delay = 30000 + Math.random() * 30000;
      idleTimerRef.current = setInterval(() => {
        const msg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        showBubble(msg);
      }, delay);
    };
    startIdle();
    return () => clearInterval(idleTimerRef.current);
  }, [showBubble]);

  // ── Face tracking handlers ──
  const handleFacePosition = useCallback((x: number, y: number) => {
    mascotState.headTargetY = x * 0.3; // horizontal → Y rotation
    mascotState.headTargetX = y * 0.2; // vertical → X rotation
    mascotState.useTracking = true;

    if (!webcamDetected) {
      setWebcamDetected(true);
      showBubble("Hi! I can see you~ 👀", 3000);
      emotionController.setEmotion('happy');
    }
  }, [webcamDetected, showBubble]);

  const handleFaceLost = useCallback(() => {
    mascotState.useTracking = false;
    setWebcamDetected(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-3xl" />
      </div>

      {/* Face tracker (hidden elements + webcam badge) */}
      <FaceTracker
        enabled={webcamEnabled}
        onFacePosition={handleFacePosition}
        onFaceLost={handleFaceLost}
      />

      {/* Main layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 px-6 py-8 min-h-screen">
        {/* Left — Mascot */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-1">
            Meet <span className="text-stress-yellow">Amy</span>
          </h1>
          <p className="text-white/50 text-xs mb-3">Your AI wellness companion</p>

          {/* Speech bubble */}
          {speechBubble && (
            <div className="mb-2 max-w-xs bg-white/10 backdrop-blur-sm border border-cyan-400/30 rounded-2xl rounded-bl-sm px-4 py-2 text-white text-sm animate-fade-in">
              {speechBubble}
            </div>
          )}

          {/* 3D Canvas */}
          <div className="relative" style={{ width: 380, height: '60vh' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-white/60 text-sm">Loading Amy...</span>
                </div>
              </div>
            )}
            <MascotScene width="100%" height="100%" fullPage onLoaded={handleLoaded} />
          </div>

          {/* Webcam toggle */}
          <button
            onClick={() => setWebcamEnabled((v) => !v)}
            className={`mt-3 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              webcamEnabled
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white/70'
            }`}
          >
            {webcamEnabled ? '📷 Webcam On' : '📷 Enable Webcam'}
          </button>
        </div>

        {/* Right — Chat */}
        <div className="w-full max-w-md lg:max-w-sm flex flex-col" style={{ height: '70vh' }}>
          <ChatBox onGreeting={handleGreeting} />
        </div>
      </div>
    </div>
  );
};

export default MascotPage;

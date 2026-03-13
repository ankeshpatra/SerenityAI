import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import { emotionController } from './MascotController';

// ═══════════════════════════════════════════════════════════════
// Animation Types & Config
// ═══════════════════════════════════════════════════════════════

export type AnimationName =
  | 'waveHello'
  | 'twirlIdle'
  | 'giggleBend'
  | 'idleLookAround'
  | 'shyLookAway'
  | 'fingerTapShy';

type AnimState = 'idle' | 'activeAnimation';

interface AnimationConfig {
  duration: number;
  emotion: string;
  apply: (vrm: VRM, ease: number, progress: number) => void;
}

// ═══════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════

function getBone(vrm: VRM, name: string) {
  return vrm.humanoid?.getNormalizedBoneNode(name as any) ?? null;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function setExpr(vrm: VRM, name: string, val: number) {
  try { vrm.expressionManager?.setValue(name as VRMExpressionPresetName, val); } catch { /* */ }
}

// ═══════════════════════════════════════════════════════════════
// Animation Definitions — EXAGGERATED for visibility
// ═══════════════════════════════════════════════════════════════

const ANIMATIONS: Record<AnimationName, AnimationConfig> = {

  // ── Wave Hello (2.5s) — BIG arm raise + enthusiastic wrist wave ──
  waveHello: {
    duration: 2.5,
    emotion: 'happy',
    apply: (vrm, _ease, progress) => {
      const rUpperArm = getBone(vrm, 'rightUpperArm');
      const rLowerArm = getBone(vrm, 'rightLowerArm');
      const rHand = getBone(vrm, 'rightHand');
      const head = getBone(vrm, 'head');

      // Fast rise, sustained wave, fast drop
      const envelope = progress < 0.12
        ? progress / 0.12
        : progress > 0.85
          ? (1 - progress) / 0.15
          : 1;
      const e = clamp(envelope, 0, 1);

      // 4 enthusiastic waves
      const wavePhase = Math.sin(progress * Math.PI * 8) * 0.45;

      if (rUpperArm) {
        rUpperArm.rotation.z = clamp(1.1 - e * 2.2, -1.3, 1.1);  // BIG lift to -1.1 (above head)
        rUpperArm.rotation.x = clamp(0.1 - e * 0.5, -0.5, 0.3);
      }
      if (rLowerArm) {
        rLowerArm.rotation.z = clamp(0.15 + e * 0.8, 0, 1.2);    // strong elbow bend
        rLowerArm.rotation.x = clamp(-e * 0.4, -0.6, 0);
      }
      if (rHand) {
        rHand.rotation.z = clamp(e * wavePhase, -0.6, 0.6);       // big wrist wave
        rHand.rotation.x = clamp(-e * 0.3, -0.4, 0);
      }
      if (head) {
        head.rotation.z = clamp(e * 0.15, -0.2, 0.2);             // noticeable tilt
        head.rotation.x = clamp(-e * 0.05, -0.1, 0.05);           // slight nod
      }

      setExpr(vrm, 'happy', e * 0.9);
    },
  },

  // ── Twirl Idle (3.5s) — bigger body rotation ──
  twirlIdle: {
    duration: 3.5,
    emotion: 'happy',
    apply: (vrm, _ease, progress) => {
      const hips = getBone(vrm, 'hips');
      const spine = getBone(vrm, 'spine');
      const head = getBone(vrm, 'head');

      // ±25° body rotation (was ±15°)
      const rotation = Math.sin(progress * Math.PI * 2) * 0.44;

      if (hips) {
        hips.rotation.y = clamp(rotation, -0.5, 0.5);
      }
      if (spine) {
        spine.rotation.y = clamp(-rotation * 0.4, -0.2, 0.2);
        spine.rotation.z = clamp(rotation * 0.08, -0.1, 0.1);  // slight sway
      }
      if (head) {
        head.rotation.y = clamp(-rotation * 0.3, -0.2, 0.2);   // head follows opposite
      }

      const smile = (1 - Math.abs(Math.sin(progress * Math.PI * 2))) * 0.6;
      setExpr(vrm, 'happy', smile);
    },
  },

  // ── Giggle Bend (1.8s) — dramatic forward bend + bouncing ──
  giggleBend: {
    duration: 1.8,
    emotion: 'happy',
    apply: (vrm, ease, progress) => {
      const spine = getBone(vrm, 'spine');
      const head = getBone(vrm, 'head');
      const lUpperArm = getBone(vrm, 'leftUpperArm');
      const rUpperArm = getBone(vrm, 'rightUpperArm');
      const hips = getBone(vrm, 'hips');

      // 4 bounces, decreasing amplitude
      const bounceDecay = Math.max(0, 1 - progress * 0.5);
      const bounce = Math.sin(progress * Math.PI * 8) * ease * 0.12 * bounceDecay;

      if (spine) {
        spine.rotation.x = clamp(0.02 + ease * 0.25 + bounce, -0.1, 0.45);  // BIG forward bend
      }
      if (head) {
        head.rotation.x = clamp(ease * 0.2 + bounce * 0.6, -0.15, 0.35);
      }
      // Shoulders up noticeably
      if (lUpperArm) {
        lUpperArm.rotation.z = clamp(-1.1 + ease * 0.3, -1.4, -0.7);
      }
      if (rUpperArm) {
        rUpperArm.rotation.z = clamp(1.1 - ease * 0.3, 0.7, 1.4);
      }
      // Bounce the whole body via hips
      if (hips) {
        hips.position.y += bounce * 0.008;
      }

      setExpr(vrm, 'happy', ease * 0.9);
      // Eyes close at peak
      if (progress > 0.2 && progress < 0.65) {
        setExpr(vrm, VRMExpressionPresetName.Blink, ease * 0.9);
      }
    },
  },

  // ── Idle Look Around (4s) — bigger head sweep ──
  idleLookAround: {
    duration: 4.0,
    emotion: 'neutral',
    apply: (vrm, _ease, progress) => {
      const head = getBone(vrm, 'head');
      if (!head) return;

      let yRot = 0;
      let xRot = 0;

      if (progress < 0.25) {
        const t = progress / 0.25;
        yRot = t * 0.4;     // bigger sweep (was 0.25)
        xRot = t * 0.12;
      } else if (progress < 0.4) {
        yRot = 0.4;
        xRot = 0.12;
      } else if (progress < 0.7) {
        const t = (progress - 0.4) / 0.3;
        yRot = 0.4 - t * 0.8;   // sweep to -0.4
        xRot = 0.12 - t * 0.24;
      } else if (progress < 0.85) {
        yRot = -0.4;
        xRot = -0.12;
      } else {
        const t = (progress - 0.85) / 0.15;
        yRot = -0.4 * (1 - t);
        xRot = -0.12 * (1 - t);
      }

      head.rotation.y = clamp(yRot, -0.5, 0.5);
      head.rotation.x = clamp(xRot, -0.2, 0.2);

      // Blink at transitions
      if ((progress > 0.37 && progress < 0.43) || (progress > 0.82 && progress < 0.88)) {
        const blinkT = progress > 0.5
          ? (progress - 0.82) / 0.06
          : (progress - 0.37) / 0.06;
        setExpr(vrm, VRMExpressionPresetName.Blink, Math.sin(clamp(blinkT, 0, 1) * Math.PI));
      }
    },
  },

  // ── Shy Look Away (2s) — head down + sideways glance + blush ──
  shyLookAway: {
    duration: 2.0,
    emotion: 'embarrassed',
    apply: (vrm, ease, _progress) => {
      const head = getBone(vrm, 'head');
      const spine = getBone(vrm, 'spine');

      if (head) {
        head.rotation.x = clamp(ease * 0.2, -0.1, 0.3);    // look down
        head.rotation.y = clamp(ease * 0.35, -0.1, 0.45);   // look sideways
        head.rotation.z = clamp(-ease * 0.1, -0.15, 0.05);  // slight tilt
      }
      if (spine) {
        spine.rotation.x = clamp(0.02 + ease * 0.06, 0, 0.1); // slight lean forward
      }

      // Blush = soft smile + half-closed eyes
      setExpr(vrm, 'happy', ease * 0.5);
      setExpr(vrm, VRMExpressionPresetName.Blink, ease * 0.4);
    },
  },

  // ── Finger Tap Shy (2.2s) — shy with hands near chest ──
  fingerTapShy: {
    duration: 2.2,
    emotion: 'embarrassed',
    apply: (vrm, ease, progress) => {
      const head = getBone(vrm, 'head');
      const spine = getBone(vrm, 'spine');
      const lUpperArm = getBone(vrm, 'leftUpperArm');
      const rUpperArm = getBone(vrm, 'rightUpperArm');
      const lLowerArm = getBone(vrm, 'leftLowerArm');
      const rLowerArm = getBone(vrm, 'rightLowerArm');
      const lHand = getBone(vrm, 'leftHand');
      const rHand = getBone(vrm, 'rightHand');

      // Small finger-tap oscillation
      const tap = Math.sin(progress * Math.PI * 8) * ease * 0.1;

      if (head) {
        head.rotation.x = clamp(ease * 0.15, -0.1, 0.25);   // look down shyly
        head.rotation.z = clamp(ease * 0.08, -0.1, 0.15);    // tilt
      }
      if (spine) {
        spine.rotation.x = clamp(0.02 + ease * 0.08, 0, 0.12);
      }
      // Bring both arms inward toward chest
      if (lUpperArm) {
        lUpperArm.rotation.z = clamp(-1.1 + ease * 0.5, -1.1, -0.5);
        lUpperArm.rotation.x = clamp(0.1 - ease * 0.4, -0.4, 0.2);
      }
      if (rUpperArm) {
        rUpperArm.rotation.z = clamp(1.1 - ease * 0.5, 0.5, 1.1);
        rUpperArm.rotation.x = clamp(0.1 - ease * 0.4, -0.4, 0.2);
      }
      // Bend elbows sharply
      if (lLowerArm) {
        lLowerArm.rotation.x = clamp(-ease * 0.8, -1.0, 0);
        lLowerArm.rotation.z = clamp(-0.15 + ease * 0.2, -0.2, 0.2);
      }
      if (rLowerArm) {
        rLowerArm.rotation.x = clamp(-ease * 0.8, -1.0, 0);
        rLowerArm.rotation.z = clamp(0.15 - ease * 0.2, -0.2, 0.2);
      }
      // Finger-tap motion
      if (lHand) {
        lHand.rotation.x = clamp(-ease * 0.3 + tap, -0.5, 0.1);
      }
      if (rHand) {
        rHand.rotation.x = clamp(-ease * 0.3 - tap, -0.5, 0.1);
      }

      setExpr(vrm, 'happy', ease * 0.4);
      setExpr(vrm, VRMExpressionPresetName.Blink, ease * 0.35);
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// Reaction Bubble System
// ═══════════════════════════════════════════════════════════════

export interface ReactionBubble {
  text: string;
  expiresAt: number; // timestamp when bubble should disappear
}

// ═══════════════════════════════════════════════════════════════
// Idle Companion Prompts
// ═══════════════════════════════════════════════════════════════

const IDLE_PROMPTS = [
  "Hey… still there? 👀",
  "What are you working on? 🤔",
  "Don't forget to take breaks! 🌸",
  "I'm getting a little lonely~ 💫",
  "Psst… talk to me! 😊",
  "Did you drink water today? 💧",
  "You're doing great, keep going~! ✨",
];

// ═══════════════════════════════════════════════════════════════
// Animation Controller (singleton)
// ═══════════════════════════════════════════════════════════════

class AnimationController {
  private _state: AnimState = 'idle';
  private _currentAnim: AnimationName | null = null;
  private _progress = 0;
  private _duration = 0;

  // Idle auto-trigger
  private _idleTimer = 0;
  private _nextIdleTrigger = 20 + Math.random() * 20; // 20-40s

  // Reaction bubble
  reactionBubble: ReactionBubble | null = null;

  // Idle prompt callback
  onIdlePrompt: ((text: string) => void) | null = null;
  private _idlePromptTimer = 0;
  private _nextIdlePrompt = 40 + Math.random() * 20; // 40-60s

  get isPlaying(): boolean {
    return this._state === 'activeAnimation';
  }

  get currentAnimation(): AnimationName | null {
    return this._currentAnim;
  }

  /**
   * Trigger a named animation with optional reaction bubble.
   */
  playAnimation(name: AnimationName, reactionText?: string): void {
    const config = ANIMATIONS[name];
    if (!config) return;

    this._state = 'activeAnimation';
    this._currentAnim = name;
    this._progress = 0;
    this._duration = config.duration;

    emotionController.setEmotion(config.emotion as any);

    // Show reaction bubble
    if (reactionText) {
      this.reactionBubble = {
        text: reactionText,
        expiresAt: Date.now() + config.duration * 1000,
      };
    }

    this._idleTimer = 0;
    this._nextIdleTrigger = 20 + Math.random() * 20;
    this._idlePromptTimer = 0;
    this._nextIdlePrompt = 40 + Math.random() * 20;
  }

  update(vrm: VRM, delta: number): void {
    // Clear expired reaction bubble
    if (this.reactionBubble && Date.now() > this.reactionBubble.expiresAt) {
      this.reactionBubble = null;
    }

    // ── Active animation ──
    if (this._state === 'activeAnimation' && this._currentAnim) {
      this._progress += delta / this._duration;

      if (this._progress >= 1) {
        this._state = 'idle';
        this._currentAnim = null;
        this._progress = 0;
        this._idleTimer = 0;
        this._nextIdleTrigger = 20 + Math.random() * 20;
        emotionController.setEmotion('neutral');
        return;
      }

      const ease = Math.sin(this._progress * Math.PI);
      const config = ANIMATIONS[this._currentAnim];
      config.apply(vrm, ease, this._progress);
      return;
    }

    // ── Idle auto-trigger animations ──
    this._idleTimer += delta;
    if (this._idleTimer >= this._nextIdleTrigger) {
      const idleAnims: AnimationName[] = [
        'twirlIdle', 'idleLookAround', 'idleLookAround', 'shyLookAway',
      ];
      const pick = idleAnims[Math.floor(Math.random() * idleAnims.length)];
      this.playAnimation(pick);
      return;
    }

    // ── Idle companion prompts ──
    this._idlePromptTimer += delta;
    if (this._idlePromptTimer >= this._nextIdlePrompt) {
      this._idlePromptTimer = 0;
      this._nextIdlePrompt = 40 + Math.random() * 20;
      const prompt = IDLE_PROMPTS[Math.floor(Math.random() * IDLE_PROMPTS.length)];
      this.onIdlePrompt?.(prompt);
    }
  }

  /**
   * Detect which animation to trigger based on AI reply text.
   * Returns the animation name + optional reaction bubble text, or null.
   */
  detectReplyTrigger(text: string): { anim: AnimationName; bubble?: string } | null {
    const lower = text.toLowerCase();

    // Giggle triggers
    const giggleTriggers = ['hehe', 'haha', 'lol', "that's funny", 'teehee', 'giggle', '😂', '🤣', 'xd'];
    if (giggleTriggers.some(t => lower.includes(t))) {
      return { anim: 'giggleBend', bubble: 'hehe~' };
    }

    // Blush / shy triggers
    const blushTriggers = ['blush', 'making me blush', "that's sweet", "you're sweet", 'flattered'];
    if (blushTriggers.some(t => lower.includes(t))) {
      return { anim: 'shyLookAway', bubble: 'aww~' };
    }

    // Shy / grateful triggers
    const shyTriggers = ["you're nice", "thank you", 'thanks~', "that's kind", 'appreciate'];
    if (shyTriggers.some(t => lower.includes(t))) {
      return { anim: 'fingerTapShy', bubble: '♡' };
    }

    return null;
  }

  /**
   * Detect if user's message is a compliment → trigger shyLookAway.
   */
  detectCompliment(text: string): boolean {
    const lower = text.toLowerCase();
    const compliments = [
      'you look cute', "you're cute", "you're adorable", 'you look nice',
      'you look pretty', "you're pretty", "you're beautiful", 'love you',
      "you're the best", 'so cute', 'kawaii',
    ];
    return compliments.some(t => lower.includes(t));
  }

  // Keep old API for backward compat
  checkGiggleTrigger(text: string): boolean {
    return this.detectReplyTrigger(text) !== null;
  }
}

export const animationController = new AnimationController();

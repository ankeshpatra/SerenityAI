import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import { emotionController, voiceController } from './MascotController';
import { animationController } from './MascotAnimations';

// ─── Shared state for cross-component communication ───
export const mascotState = {
  headTargetX: 0, // face-tracking target (radians)
  headTargetY: 0,
  useTracking: false,
  isLoaded: false,
};

/**
 * Set up a natural resting pose — arms down at the sides instead of T-pose.
 * VRM normalized bones use a specific coordinate system — we use Euler rotations.
 */
function applyNaturalPose(vrm: VRM) {
  const humanoid = vrm.humanoid;
  if (!humanoid) return;

  // Helper to safely rotate a bone
  const rotateBone = (name: string, x: number, y: number, z: number) => {
    const bone = humanoid.getNormalizedBoneNode(name as any);
    if (bone) {
      bone.rotation.set(x, y, z);
    }
  };

  // Upper arms: rotate downward along Z axis (~63° = 1.1 rad)
  // For this VRM model: left arm uses negative Z, right arm uses positive Z
  rotateBone('leftUpperArm', 0.1, 0, -1.1);
  rotateBone('rightUpperArm', 0.1, 0, 1.1);

  // Lower arms: slight bend at elbow for a natural relaxed look
  rotateBone('leftLowerArm', 0, -0.1, -0.15);
  rotateBone('rightLowerArm', 0, 0.1, 0.15);

  // Hands: slight natural curl inward
  rotateBone('leftHand', 0, 0, -0.1);
  rotateBone('rightHand', 0, 0, 0.1);

  // Spine: very slight forward tilt for natural look
  rotateBone('spine', 0.02, 0, 0);
}



// ─── Inner component that loads + animates the VRM inside the R3F canvas ───
function VRMAvatar({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const vrmRef = useRef<VRM | null>(null);
  const { scene } = useThree();
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(2 + Math.random() * 4);
  const isBlinkingRef = useRef(false);
  const blinkProgressRef = useRef(0);
  const elapsedRef = useRef(0);
  // Smoothed head rotation values
  const smoothHeadX = useRef(0);
  const smoothHeadY = useRef(0);
  // Store the base hips Y position so breathing oscillates around it
  const baseHipsY = useRef(0);
  // Eye tracking: lookAt target in world space
  const lookAtTarget = useRef(new THREE.Object3D());
  // Weight shift base X for hips
  const hipsBaseX = useRef(0);

  useEffect(() => {
    // Add lookAt target to the scene  
    scene.add(lookAtTarget.current);
    lookAtTarget.current.position.set(0, 1.4, 3); // default: looking forward

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) return;

        vrm.scene.rotation.y = 0;
        vrm.scene.scale.set(1.2, 1.2, 1.2);
        vrm.scene.position.set(0, -1.0, 0);

        // Set a natural standing pose (arms at sides)
        applyNaturalPose(vrm);

        // Store the initial hips Y so breathing doesn't drift
        const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
        if (hips) {
          baseHipsY.current = hips.position.y;
          hipsBaseX.current = hips.position.x;
        }

        // Setup VRM lookAt target for eye tracking
        if (vrm.lookAt) {
          vrm.lookAt.target = lookAtTarget.current;
        }

        scene.add(vrm.scene);
        vrmRef.current = vrm;
        emotionController.setVRM(vrm);
        mascotState.isLoaded = true;
        onLoaded?.();
        console.log('✅ VRM avatar loaded');
      },
      undefined,
      (err) => console.error('❌ VRM load error:', err)
    );

    return () => {
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene);
        vrmRef.current = null;
        mascotState.isLoaded = false;
      }
      scene.remove(lookAtTarget.current);
    };
  }, [url, scene, onLoaded]);

  // Animation loop
  useFrame((_, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    // ── Breathing (SET position, don't accumulate) ──
    const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
    if (hips) {
      hips.position.y = baseHipsY.current + Math.sin(elapsed * 1.5) * 0.002;
    }

    // ── Eye Tracking via VRM lookAt ──
    // Update the lookAt target position based on face tracking or idle
    if (mascotState.useTracking) {
      // Map face position to a 3D point in front of the avatar
      const lx = mascotState.headTargetY * 3;
      const ly = 1.4 + mascotState.headTargetX * 1.5;
      lookAtTarget.current.position.set(lx, ly, 3);
    } else {
      // Default: look straight at the camera (camera is at z=2.5, y=0.8)
      // A slight gentle drift keeps it alive
      const ix = Math.sin(elapsed * 0.3) * 0.15;
      const iy = 1.3 + Math.sin(elapsed * 0.2) * 0.08;
      lookAtTarget.current.position.set(ix, iy, 2.5);
    }

    // ── Head rotation (tracking or idle sway) ──
    const head = vrm.humanoid?.getNormalizedBoneNode('head');
    if (head) {
      let targetY: number, targetX: number;
      if (mascotState.useTracking) {
        targetY = Math.max(-0.3, Math.min(0.3, mascotState.headTargetY));
        targetX = Math.max(-0.2, Math.min(0.2, mascotState.headTargetX));
      } else {
        targetY = Math.sin(elapsed * 0.5) * 0.04;
        targetX = Math.sin(elapsed * 0.3) * 0.02;
      }
      smoothHeadY.current += (targetY - smoothHeadY.current) * Math.min(1, 5 * delta);
      smoothHeadX.current += (targetX - smoothHeadX.current) * Math.min(1, 5 * delta);
      head.rotation.y = smoothHeadY.current;
      head.rotation.x = smoothHeadX.current;
    }

    // ── Blinking ──
    blinkTimerRef.current += delta;
    if (!isBlinkingRef.current && blinkTimerRef.current >= nextBlinkRef.current) {
      isBlinkingRef.current = true;
      blinkProgressRef.current = 0;
    }
    if (isBlinkingRef.current) {
      blinkProgressRef.current += delta * 8;
      let v: number;
      if (blinkProgressRef.current < 0.5) {
        v = blinkProgressRef.current * 2;
      } else if (blinkProgressRef.current < 1.0) {
        v = 1 - (blinkProgressRef.current - 0.5) * 2;
      } else {
        v = 0;
        isBlinkingRef.current = false;
        blinkTimerRef.current = 0;
        nextBlinkRef.current = 2 + Math.random() * 4;
      }
      try {
        vrm.expressionManager?.setValue(VRMExpressionPresetName.Blink, v);
      } catch { /* model may lack blink */ }
    }

    // ── Lip Sync (procedural mouth movement while speaking) ──
    voiceController.updateLipSync(elapsed);
    if (voiceController.isSpeaking) {
      const mouth = voiceController.mouthOpenness;
      try {
        // Drive multiple mouth shapes for more natural look
        vrm.expressionManager?.setValue('aa' as VRMExpressionPresetName, mouth * 0.7);
        vrm.expressionManager?.setValue('oh' as VRMExpressionPresetName, mouth * 0.3);
      } catch { /* blendshape might not exist */ }
    } else {
      // Reset mouth when not speaking
      try {
        vrm.expressionManager?.setValue('aa' as VRMExpressionPresetName, 0);
        vrm.expressionManager?.setValue('oh' as VRMExpressionPresetName, 0);
      } catch { /* */ }
    }

    // ── Emotion smooth update ──
    emotionController.update(delta);

    vrm.update(delta);

    // Apply base arm pose AFTER vrm.update (which resets normalized bone transforms)
    applyNaturalPose(vrm);

    // ── Expressive animations (applied ON TOP of natural pose) ──
    animationController.update(vrm, delta);
  });

  return null;
}

// ─── Exported wrapper component ───────────────────────────────────────────────
interface MascotSceneProps {
  modelUrl?: string;
  width?: number | string;
  height?: number | string;
  fullPage?: boolean;
  onLoaded?: () => void;
}

const MascotScene: React.FC<MascotSceneProps> = ({
  modelUrl = '/models/waifu.vrm',
  width = 320,
  height = 480,
  fullPage = false,
  onLoaded,
}) => {
  const containerStyle: React.CSSProperties = fullPage
    ? {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }
    : {
        position: 'fixed',
        bottom: 0,
        right: 16,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        zIndex: 40,
        pointerEvents: 'none',
      };

  return (
    <div style={containerStyle}>
      <Canvas
        style={{ pointerEvents: 'auto' }}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.8, 2.5], fov: 30 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} />
        <VRMAvatar url={modelUrl} onLoaded={onLoaded} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
};

export default MascotScene;

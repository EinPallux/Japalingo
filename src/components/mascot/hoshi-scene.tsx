"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Hoshi's intrinsic fur/character palette (theme-independent — see hoshi-static.tsx).
const FUR = "#efc99a";
const FUR_DEEP = "#e3ad6f";
const CREAM = "#fffaf2";
const INK = "#3a3560";
const BLUSH = "#ff9ec4";
const EAR_INNER = "#ffb9d6";

function HoshiModel() {
  const root = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    // gentle pointer parallax
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.5, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.22, 0.05);
  });

  return (
    <group ref={root}>
      <Float speed={2} rotationIntensity={0.25} floatIntensity={0.8}>
        {/* body */}
        <mesh position={[0, -1.15, 0]}>
          <sphereGeometry args={[1.15, 48, 48]} />
          <meshStandardMaterial color={FUR} roughness={0.65} />
        </mesh>
        {/* chest */}
        <mesh position={[0, -1.0, 0.72]}>
          <sphereGeometry args={[0.62, 40, 40]} />
          <meshStandardMaterial color={CREAM} roughness={0.6} />
        </mesh>

        {/* tail */}
        <mesh position={[0.35, -0.7, -0.95]} rotation={[0.7, 0.3, 0.4]}>
          <torusGeometry args={[0.42, 0.16, 16, 32, Math.PI * 1.4]} />
          <meshStandardMaterial color={FUR} roughness={0.65} />
        </mesh>

        {/* head */}
        <mesh position={[0, 0.35, 0.05]}>
          <sphereGeometry args={[1.0, 48, 48]} />
          <meshStandardMaterial color={FUR} roughness={0.65} />
        </mesh>
        {/* muzzle */}
        <mesh position={[0, 0.1, 0.72]}>
          <sphereGeometry args={[0.5, 40, 40]} />
          <meshStandardMaterial color={CREAM} roughness={0.6} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.6, 1.18, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.34, 0.72, 24]} />
          <meshStandardMaterial color={FUR_DEEP} roughness={0.6} />
        </mesh>
        <mesh position={[0.6, 1.18, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.34, 0.72, 24]} />
          <meshStandardMaterial color={FUR_DEEP} roughness={0.6} />
        </mesh>
        <mesh position={[-0.58, 1.1, 0.14]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.17, 0.42, 20]} />
          <meshStandardMaterial color={EAR_INNER} roughness={0.5} />
        </mesh>
        <mesh position={[0.58, 1.1, 0.14]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.17, 0.42, 20]} />
          <meshStandardMaterial color={EAR_INNER} roughness={0.5} />
        </mesh>

        {/* eyes */}
        <mesh position={[-0.34, 0.42, 0.86]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[0.34, 0.42, 0.86]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[-0.3, 0.47, 0.96]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.38, 0.47, 0.96]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* nose */}
        <mesh position={[0, 0.18, 1.15]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color={INK} />
        </mesh>

        {/* cheeks */}
        <mesh position={[-0.6, 0.08, 0.68]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.6, 0.08, 0.68]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={BLUSH} transparent opacity={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

const BITS: { pos: [number, number, number]; color: string; s: number }[] = [
  { pos: [-3, 1.5, -2], color: "#5b5bf6", s: 0.34 },
  { pos: [3.2, 2, -1], color: "#ff5c9d", s: 0.28 },
  { pos: [2.7, -1.8, -2], color: "#ffc53d", s: 0.3 },
  { pos: [-2.8, -1.4, -1], color: "#38bdf8", s: 0.24 },
  { pos: [0.2, 2.8, -3], color: "#3fc77a", s: 0.22 },
];

function FloatingBits() {
  return (
    <>
      {BITS.map((b, i) => (
        <Float key={i} speed={1.4 + i * 0.2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={b.pos}>
            <sphereGeometry args={[b.s, 24, 24]} />
            <meshStandardMaterial color={b.color} roughness={0.35} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function HoshiScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5.2], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <pointLight position={[-4, -2, 2]} intensity={28} color="#ff5c9d" />
      <pointLight position={[4, 3, -2]} intensity={20} color="#5b5bf6" />
      <HoshiModel />
      <FloatingBits />
      <Sparkles count={40} scale={[9, 6, 4]} size={3} speed={0.35} color="#ffc53d" opacity={0.7} />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.22} scale={9} blur={2.6} far={4} color="#2a2a4a" />
    </Canvas>
  );
}

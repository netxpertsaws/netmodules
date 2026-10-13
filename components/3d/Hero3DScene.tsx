"use client";

import { Float, Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh, Points as PointsType } from "three";

function GoldDust() {
  const ref = useRef<PointsType>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      values[index * 3] = (Math.random() - 0.5) * 8;
      values[index * 3 + 1] = (Math.random() - 0.5) * 4;
      values[index * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return values;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial color="#D4A84B" size={0.035} transparent opacity={0.85} depthWrite={false} />
    </Points>
  );
}

function Panels() {
  const group = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });
  return (
    <mesh ref={group}>
      <icosahedronGeometry args={[1.15, 1]} />
      <meshStandardMaterial color="#2EC4B6" wireframe />
    </mesh>
  );
}

export function Hero3DScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      frameloop="always"
    >
      <color attach="background" args={["#0B1530"]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 2, 3]} intensity={18} color="#D4A84B" />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <Panels />
      </Float>
      <GoldDust />
    </Canvas>
  );
}

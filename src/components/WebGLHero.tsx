"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const PHRASES = [
  "Hey Sarah,",
  "I noticed",
  "Congrats on",
  "Your recent",
  "Loved the",
  "That talk at",
  "Since you",
  "After reading",
  "Great move",
  "Saw that",
  "Your team's",
  "The pivot to",
];

interface FloatingTextProps {
  text: string;
  index: number;
  total: number;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
}

function FloatingText({ text, index, total, mousePos }: FloatingTextProps) {
  const ref = useRef<THREE.Group>(null);
  const initialPos = useMemo(() => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 3 + Math.random() * 4;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 3 - 2
    );
  }, [index, total]);

  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    ref.current.position.x =
      initialPos.x + Math.sin(t * speed + phase) * 0.5;
    ref.current.position.y =
      initialPos.y + Math.cos(t * speed * 0.7 + phase) * 0.3;
    ref.current.position.z = initialPos.z;

    // React to mouse
    const mx = mousePos.current.x * 0.3;
    const my = mousePos.current.y * 0.3;
    ref.current.position.x += mx * (0.5 + index * 0.05);
    ref.current.position.y += my * (0.5 + index * 0.05);

    // Fade based on distance
    const dist = ref.current.position.length();
    const opacity = Math.max(0.05, Math.min(0.4, 1 - dist / 10));
    const material = (ref.current.children[0] as THREE.Mesh)
      ?.material as THREE.MeshBasicMaterial;
    if (material) material.opacity = opacity;
  });

  return (
    <group ref={ref} position={initialPos}>
      <Text
        fontSize={0.25 + Math.random() * 0.15}
        color="#C8FF00"
        anchorX="center"
        anchorY="middle"
        font="/fonts/InstrumentSerif-Regular.ttf"
        material-transparent={true}
        material-opacity={0.2}
      >
        {text}
      </Text>
    </group>
  );
}

function Scene() {
  const mousePos = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const handlePointerMove = useCallback(
    (e: THREE.Event & { clientX?: number; clientY?: number }) => {
      const event = e as unknown as { clientX: number; clientY: number };
      mousePos.current.x = (event.clientX / size.width - 0.5) * 2;
      mousePos.current.y = -(event.clientY / size.height - 0.5) * 2;
    },
    [size]
  );

  return (
    <group onPointerMove={handlePointerMove}>
      {/* Invisible plane to capture mouse events */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {PHRASES.map((text, i) => (
        <FloatingText
          key={i}
          text={text}
          index={i}
          total={PHRASES.length}
          mousePos={mousePos}
        />
      ))}
    </group>
  );
}

export default function WebGLHero() {
  return (
    <div className="absolute inset-0 z-0 hidden md:block">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

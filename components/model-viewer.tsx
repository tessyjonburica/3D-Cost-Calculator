"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/ThreeMFLoader.js";
import * as THREE from "three";

interface ModelProps {
    url: string;
    format: string;
}

function Model({ url, format }: ModelProps) {
    const ext = format.toLowerCase();

    let result: any;
    if (ext === "stl") {
        result = useLoader(STLLoader, url);
    } else if (ext === "obj") {
        result = useLoader(OBJLoader, url);
    } else if (ext === "3mf") {
        result = useLoader(ThreeMFLoader, url);
    }

    const mesh = useMemo(() => {
        if (!result) return null;
        if (result instanceof THREE.BufferGeometry) {
            return (
                <mesh geometry={result}>
                    <meshStandardMaterial color="#27272a" />
                </mesh>
            );
        }
        if (result instanceof THREE.Group) {
            return <primitive object={result} />;
        }
        return null;
    }, [result]);

    return mesh;
}

interface ModelViewerProps {
    filename: string;
    format: string;
}

export default function ModelViewer({ filename, format }: ModelViewerProps) {
    const url = `/api/models/${filename}`;

    return (
        <div className="w-full h-full min-h-[500px] relative group overflow-hidden rounded-xl">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 100], fov: 45 }}>
                <Suspense fallback={null}>
                    <Stage environment="studio" intensity={0.5} contactShadow={{ opacity: 0.1, blur: 3 }} adjustCamera={false}>
                        <Center>
                            <Model url={url} format={format} />
                        </Center>
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
            </Canvas>

            <div className="absolute top-6 left-6 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Interactive Geometry</p>
                <div className="flex gap-2 items-center">
                    <span className="h-1 w-1 rounded-full bg-black animate-pulse" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">WebGL 2.0 Acceleration</span>
                </div>
            </div>
        </div>
    );
}

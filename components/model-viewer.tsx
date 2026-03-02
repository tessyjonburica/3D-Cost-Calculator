"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Center, PerspectiveCamera } from "@react-three/drei";
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

    // Loaders based on format
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

        // Handle OBJ (Group) vs STL (BufferGeometry)
        if (result instanceof THREE.BufferGeometry) {
            return (
                <mesh geometry={result}>
                    <meshStandardMaterial color="#A1A1AA" />
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
        <div className="w-full aspect-video rounded-lg border border-zinc-100 bg-white overflow-hidden relative group">
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.2, blur: 2 }}>
                        <Center>
                            <Model url={url} format={format} />
                        </Center>
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
            </Canvas>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-zinc-100 text-[10px] text-zinc-400 uppercase font-medium tracking-tighter">
                Orbit Controls Active
            </div>
        </div>
    );
}

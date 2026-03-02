import { Worker, Job } from "bullmq";
import { connection } from "../lib/queue/connection";
import prisma from "../lib/prisma";
import * as fs from "fs/promises";
import path from "path";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/ThreeMFLoader.js";
import { Decimal } from "@prisma/client/runtime/library";

interface ProgressData {
    projectId: string;
    filePath: string;
    originalFileName: string;
}

async function processModel(job: Job<ProgressData>) {
    const { projectId, filePath, originalFileName } = job.data;
    const fullPath = path.join(process.cwd(), "uploads", filePath);

    console.log(`[worker] Processing ${originalFileName} for project ${projectId}`);

    try {
        await prisma.modelFile.update({
            where: { projectId },
            data: { status: "PROCESSING" },
        });

        const fileBuffer = await fs.readFile(fullPath);
        const extension = path.extname(originalFileName).toLowerCase();

        let geometry: THREE.BufferGeometry | null = null;

        if (extension === ".stl") {
            const loader = new STLLoader();
            geometry = loader.parse(fileBuffer.buffer);
        } else if (extension === ".obj") {
            const loader = new OBJLoader();
            const text = fileBuffer.toString();
            const object = loader.parse(text);
            const geometries: THREE.BufferGeometry[] = [];
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) geometries.push(child.geometry);
            });
            if (geometries.length > 0) geometry = geometries[0];
        } else if (extension === ".3mf") {
            const loader = new ThreeMFLoader();
            // 3MF loader needs a bit more work for server-side if it uses zip, but usually okay
            const group = await (loader as any).parse(fileBuffer.buffer);
            const geometries: THREE.BufferGeometry[] = [];
            group.traverse((child: any) => {
                if (child instanceof THREE.Mesh) geometries.push(child.geometry);
            });
            if (geometries.length > 0) geometry = geometries[0];
        }

        if (!geometry) {
            throw new Error("Could not parse 3D geometry or unsupported format");
        }

        // Compute Bounding Box
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const dimX = box.max.x - box.min.x;
        const dimY = box.max.y - box.min.y;
        const dimZ = box.max.z - box.min.z;

        // Compute Volume
        let volume = 0;
        const position = geometry.attributes.position;
        const index = geometry.index;

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                const v1 = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 0));
                const v2 = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 1));
                const v3 = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 2));
                volume += v1.dot(v2.cross(v3)) / 6.0;
            }
        } else {
            for (let i = 0; i < position.count; i += 3) {
                const v1 = new THREE.Vector3().fromBufferAttribute(position, i + 0);
                const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1);
                const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2);
                volume += v1.dot(v2.cross(v3)) / 6.0;
            }
        }
        volume = Math.abs(volume);

        // Update DB
        await prisma.modelFile.update({
            where: { projectId },
            data: {
                status: "READY",
                dimX: new Decimal(dimX),
                dimY: new Decimal(dimY),
                dimZ: new Decimal(dimZ),
                volume: new Decimal(volume),
                polygonCount: position.count / 3,
            },
        });

        console.log(`[worker] Finished processing ${originalFileName}`);
    } catch (error: any) {
        console.error(`[worker] Error processing ${originalFileName}:`, error);
        await prisma.modelFile.update({
            where: { projectId },
            data: {
                status: "ERROR",
                errorMessage: error.message || "Unknown processing error",
            },
        });
    }
}

const worker = new Worker("modelProcessingQueue", processModel, {
    connection,
    concurrency: 1,
});

worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed with error: ${err.message}`);
});

console.log("[worker] Model processing worker is running...");

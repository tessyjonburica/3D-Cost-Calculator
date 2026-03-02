import { Worker, Job } from "bullmq";
import { connection } from "../lib/queue/connection";
import prisma from "../lib/prisma";
import * as fs from "fs/promises";
import path from "path";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

async function processModel(job: Job) {
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

            // Collect all geometries from the object
            const geometries: THREE.BufferGeometry[] = [];
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    geometries.push(child.geometry);
                }
            });

            if (geometries.length > 0) {
                // For simplicity, handle first mesh or merge them
                geometry = geometries[0];
            }
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

        // Compute Volume (assuming closed manifold mesh)
        let volume = 0;
        const position = geometry.attributes.position;
        const faces = position.count / 3;

        for (let i = 0; i < faces; i++) {
            const v1 = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 0);
            const v2 = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 1);
            const v3 = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 2);
            volume += v1.dot(v2.cross(v3)) / 6.0;
        }
        volume = Math.abs(volume);

        // Polygon Count
        const polygonCount = faces;

        // Update DB
        await prisma.modelFile.update({
            where: { projectId },
            data: {
                status: "READY",
                dimX: new THREE.Decimal(dimX),
                dimY: new THREE.Decimal(dimY),
                dimZ: new THREE.Decimal(dimZ),
                volume: new THREE.Decimal(volume),
                polygonCount,
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

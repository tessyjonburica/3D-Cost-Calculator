import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { modelProcessingQueue } from "@/lib/queue/modelProcessingQueue";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const uploadSchema = z.object({
    projectId: z.string(),
});

export async function POST(
    req: NextRequest,
    context: { params: { projectId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const validation = uploadSchema.safeParse({ projectId });
    if (!validation.success) {
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "No file provided or invalid file" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = path.extname(file.name).toLowerCase();

        if (![".stl", ".obj", ".3mf"].includes(fileExtension)) {
            return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
        }

        const fileName = `${uuidv4()}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), "uploads");
        const filePath = path.join(uploadDir, fileName);

        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, buffer);

        // Update or Create ModelFile record
        const modelFile = await prisma.modelFile.upsert({
            where: { projectId },
            update: {
                originalFileName: file.name,
                storagePath: fileName,
                format: fileExtension.substring(1).toUpperCase(),
                status: "QUEUED",
                errorMessage: null,
            },
            create: {
                projectId,
                originalFileName: file.name,
                storagePath: fileName,
                format: fileExtension.substring(1).toUpperCase(),
                status: "QUEUED",
            },
        });

        // Add to processing queue
        await modelProcessingQueue.add("process-model", {
            projectId,
            filePath: fileName,
            originalFileName: file.name,
        });

        return NextResponse.json({ success: true, modelFile });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

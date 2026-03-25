import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const aiSchema = z.object({
    id: z.string(),
});

export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await context.params;
    const validation = aiSchema.safeParse({ id: projectId });
    if (!validation.success) {
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId: session.user.id },
            include: {
                modelFile: true,
                parameters: true,
                calculation: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Mock AI Generation Logic
        // In a real scenario, this would call an LLM API (OpenAI, Gemini, etc.)
        const name = project.name || "Unnamed Project";
        const tech = project.parameters?.technology || "3D Printing";
        const material = project.parameters?.material || "Standard Material";
        const weight = project.calculation?.weight ? Number(project.calculation.weight).toFixed(2) : "0";
        const price = project.calculation?.finalPricePerPiece ? Number(project.calculation.finalPricePerPiece).toFixed(2) : "0";
        const currency = project.parameters?.currency || "USD";

        const descriptionText = `This project, ${name}, utilizes ${tech} technology with ${material}. Computed geometry indicates a final weight of approximately ${weight}g per unit. The production workflow is optimized for precision and industrial standards.`;

        const commercialText = `Professional ${tech} manufacturing for ${name}. High-quality ${material} finish with a competitive price point of ${price} ${currency} per piece. Optimized for batch production and rapid fulfillment.`;

        const aiContent = await prisma.projectAiContent.upsert({
            where: { projectId },
            update: {
                descriptionText,
                commercialText,
            },
            create: {
                projectId,
                descriptionText,
                commercialText,
            },
        });

        return NextResponse.json({ success: true, aiContent });
    } catch (error) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

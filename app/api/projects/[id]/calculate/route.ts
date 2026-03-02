import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateProjectCosts } from "@/lib/calculations";

export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const project = await prisma.project.findUnique({
            where: { id, userId: session.user.id as string },
            include: {
                modelFile: true,
                parameters: true,
            },
        });

        if (!project || !project.modelFile || !project.parameters) {
            return NextResponse.json({ error: "Required data missing (Model or Parameters not set)" }, { status: 400 });
        }

        const modelFile = project.modelFile;
        const params = project.parameters;

        const results = calculateProjectCosts({
            volume: Number(modelFile.volume || 0),
            density: Number(params.density),
            materialPrice: Number(params.materialPrice),
            printingTime: Number(params.printingTime),
            electricityRate: Number(params.electricityRate),
            depreciationRate: Number(params.depreciationRate),
            postProcessingTime: Number(params.postProcessingTime),
            simulationTime: Number(params.simulationTime),
            markupCoefficient: Number(params.markupCoefficient),
            defectProbability: Number(params.defectProbability),
            taxRate: Number(params.taxRate),
            partsCount: params.partsCount,
        });

        const calculation = await prisma.projectCalculation.upsert({
            where: { projectId: id },
            update: results as any,
            create: {
                projectId: id,
                ...results,
            } as any,
        });

        return NextResponse.json({ success: true, calculation });
    } catch (error) {
        console.error("Calculation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProjectParameters(projectId: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Convert strings to appropriate types if necessary
    const formattedData: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (["density", "materialPrice", "infillPercent", "supportPercent", "printingTime", "postProcessingTime", "simulationTime", "markupCoefficient", "defectProbability", "taxRate", "depreciationRate", "electricityRate"].includes(key)) {
            formattedData[key] = parseFloat(value as string);
        } else if (key === "partsCount") {
            formattedData[key] = parseInt(value as string);
        } else {
            formattedData[key] = value;
        }
    }

    await prisma.projectParameters.upsert({
        where: { projectId },
        update: formattedData,
        create: {
            projectId,
            ...formattedData,
        },
    });

    revalidatePath(`/projects/${projectId}`);
}

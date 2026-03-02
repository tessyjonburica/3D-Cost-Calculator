"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAiContent(projectId: string, data: { descriptionText?: string; commercialText?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.projectAiContent.upsert({
        where: { projectId },
        update: data,
        create: {
            projectId,
            ...data,
        },
    });

    revalidatePath(`/projects/${projectId}`);
}

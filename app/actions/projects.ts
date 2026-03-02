"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    return prisma.project.findMany({
        where: { userId: session.user.id as string },
        orderBy: { updatedAt: "desc" },
    });
}

export async function getProjectById(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    return prisma.project.findUnique({
        where: {
            id,
            userId: session.user.id as string
        },
        include: {
            modelFile: true,
            parameters: true,
            calculation: true,
            aiContent: true,
        }
    });
}

export async function createProject() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const project = await prisma.project.create({
        data: {
            userId: session.user.id as string,
            name: "New Project",
        },
    });

    revalidatePath("/projects");
    redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, data: {
    name?: string;
    clientName?: string;
    clientContact?: string;
    notes?: string
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const project = await prisma.project.findUnique({
        where: {
            id,
            userId: session.user.id as string
        },
    });

    if (!project) throw new Error("Project not found");

    await prisma.project.update({
        where: { id },
        data,
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
}

export async function deleteProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.project.delete({
        where: {
            id,
            userId: session.user.id as string
        },
    });

    revalidatePath("/projects");
    redirect("/projects");
}

import { getProjects, createProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Folder } from "lucide-react";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Projects</h1>
                        <p className="mt-1 text-zinc-500">Manage your 3D printing cost calculations</p>
                    </div>
                    <form action={createProject}>
                        <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </form>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 py-24 text-center">
                        <Folder className="mb-4 h-12 w-12 text-zinc-300" />
                        <h3 className="text-lg font-medium text-zinc-900">No projects yet</h3>
                        <p className="mt-1 text-zinc-500">Create your first project to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <Card className="transition-all hover:border-zinc-400 shadow-none border-zinc-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold truncate">
                                            {project.name}
                                        </CardTitle>
                                        <CardDescription className="truncate">
                                            {project.clientName || "No client specified"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-zinc-400">
                                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

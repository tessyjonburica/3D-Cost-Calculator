import { getProjectById } from "@/app/actions/projects";
import ProjectEditor from "@/components/project-editor";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ModelUpload from "@/components/model-upload";
import ModelViewer from "@/components/model-viewer";
import ProjectParametersForm from "@/components/project-parameters";
import CalculationResults from "@/components/calculation-results";
import AiContent from "@/components/ai-content";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-zinc-100 px-8 py-4">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    <Link href="/projects" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Projects
                    </Link>
                    <div className="text-xs text-zinc-400">
                        Project ID: {project.id}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Project Metadata */}
                    <div className="lg:col-span-4 lg:border-r lg:border-zinc-100 lg:pr-12">
                        <ProjectEditor project={project} />
                    </div>

                    {/* Right Column: Model Upload & Placeholders */}
                    <div className="lg:col-span-8 space-y-8">
                        <ModelUpload
                            projectId={project.id}
                            initialModel={project.modelFile as any}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ProjectParametersForm
                                projectId={project.id}
                                initialParameters={project.parameters}
                            />
                            <CalculationResults
                                calculation={project.calculation}
                                currency={project.parameters?.currency || "USD"}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

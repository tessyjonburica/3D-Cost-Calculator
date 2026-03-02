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
import ModelStatusPoll from "@/components/model-status-poll";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white selection:bg-zinc-100">
            <ModelStatusPoll projectId={project.id} currentStatus={project.modelFile?.status || "NONE"} />
            <header className="px-8 py-6 border-b border-zinc-50">
                <div className="mx-auto max-w-[1600px] flex items-center justify-between">
                    <Link href="/projects" className="group flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                        <ChevronLeft className="mr-2 h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Projects
                    </Link>
                    <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-tighter">
                        PROJ-ID: {project.id.split('-')[0]}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Column 1: Metadata & Tech Parameters (Left) */}
                    <div className="lg:col-span-3 space-y-16">
                        <section className="space-y-10">
                            <ProjectEditor project={project} />
                        </section>
                        <section className="pt-12 border-t border-zinc-50">
                            <ProjectParametersForm
                                projectId={project.id}
                                initialParameters={project.parameters}
                            />
                        </section>
                    </div>

                    {/* Column 2: 3D Visualization (Center) */}
                    <div className="lg:col-span-6 space-y-12">
                        <section className="min-h-[600px] flex flex-col items-center justify-center">
                            {project.modelFile?.status === "READY" ? (
                                <ModelViewer
                                    filename={project.modelFile.storagePath}
                                    format={project.modelFile.format}
                                />
                            ) : (
                                <ModelUpload
                                    projectId={project.id}
                                    initialModel={project.modelFile as any}
                                />
                            )}
                        </section>
                    </div>

                    {/* Column 3: Results & AI (Right) */}
                    <div className="lg:col-span-3 space-y-16">
                        <section>
                            <CalculationResults
                                calculation={project.calculation}
                                currency={project.parameters?.currency || "USD"}
                            />
                        </section>

                        <section className="pt-12 border-t border-zinc-50">
                            <AiContent
                                projectId={project.id}
                                initialContent={project.aiContent}
                            />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}

"use client";

import { useState, useCallback } from "react";
import { updateProject } from "@/app/actions/projects";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectEditorProps {
    project: any;
}

export default function ProjectEditor({ project }: ProjectEditorProps) {
    const [data, setData] = useState({
        name: project.name || "",
        clientName: project.clientName || "",
        clientContact: project.clientContact || "",
        notes: project.notes || "",
    });
    const [saving, setSaving] = useState(false);

    const handleBlur = useCallback(async (field: string, value: string) => {
        if (value === (project as any)[field]) return;

        setSaving(true);
        try {
            await updateProject(project.id, { [field]: value });
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setSaving(false);
        }
    }, [project]);

    const handleChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-12">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Project Name</span>
                    {saving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
                </div>
                <Input
                    value={data.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={(e) => handleBlur("name", e.target.value)}
                    placeholder="Enter project name..."
                    className="h-auto p-0 border-none text-2xl font-black tracking-tight placeholder:text-zinc-100 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Client Details</label>
                    <div className="space-y-1 border-l-2 border-zinc-50 pl-4 py-1">
                        <input
                            value={data.clientName}
                            onChange={(e) => handleChange("clientName", e.target.value)}
                            onBlur={(e) => handleBlur("clientName", e.target.value)}
                            placeholder="Client Name"
                            className="w-full text-xs font-semibold placeholder:text-zinc-200 outline-none"
                        />
                        <input
                            value={data.clientContact}
                            onChange={(e) => handleChange("clientContact", e.target.value)}
                            onBlur={(e) => handleBlur("clientContact", e.target.value)}
                            placeholder="Contact / Email"
                            className="w-full text-xs text-zinc-500 placeholder:text-zinc-200 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Additional Notes</label>
                    <Textarea
                        value={data.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        onBlur={(e) => handleBlur("notes", e.target.value)}
                        placeholder="Project specifics, material requirements, or timeline notes..."
                        className="min-h-[120px] p-0 border-none text-xs leading-relaxed text-zinc-600 placeholder:text-zinc-100 resize-none focus-visible:ring-0"
                    />
                </div>
            </div>
        </div>
    );
}

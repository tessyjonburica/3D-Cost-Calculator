"use client";

import { useState, useCallback } from "react";
import { updateProject } from "@/app/actions/projects";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectEditorProps {
    project: {
        id: string;
        name: string;
        clientName: string | null;
        clientContact: string | null;
        notes: string | null;
    };
}

export default function ProjectEditor({ project }: ProjectEditorProps) {
    const [formData, setFormData] = useState({
        name: project.name,
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
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-8">
            <div>
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-zinc-500">Project Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={(e) => handleBlur("name", e.target.value)}
                    className="mt-1 border-none bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-zinc-300 h-auto"
                    placeholder="Untitled Project"
                />
            </div>

            <div className="grid gap-6">
                <div>
                    <Label htmlFor="clientName" className="text-xs font-medium uppercase tracking-wider text-zinc-500">Client Name</Label>
                    <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleChange("clientName", e.target.value)}
                        onBlur={(e) => handleBlur("clientName", e.target.value)}
                        className="mt-1 border-b border-zinc-100 rounded-none shadow-none focus-visible:ring-0 px-0 h-9"
                        placeholder="Company or Individual"
                    />
                </div>

                <div>
                    <Label htmlFor="clientContact" className="text-xs font-medium uppercase tracking-wider text-zinc-500">Client Contact</Label>
                    <Input
                        id="clientContact"
                        value={formData.clientContact}
                        onChange={(e) => handleChange("clientContact", e.target.value)}
                        onBlur={(e) => handleBlur("clientContact", e.target.value)}
                        className="mt-1 border-b border-zinc-100 rounded-none shadow-none focus-visible:ring-0 px-0 h-9"
                        placeholder="Email or phone"
                    />
                </div>

                <div>
                    <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-zinc-500">Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        onBlur={(e) => handleBlur("notes", e.target.value)}
                        className="mt-1 min-h-[150px] resize-none border-zinc-100 shadow-none focus-visible:ring-0 px-3"
                        placeholder="Internal project notes..."
                    />
                </div>
            </div>

            {saving && (
                <div className="fixed bottom-8 right-8 text-xs text-zinc-400 animate-pulse">
                    Saving...
                </div>
            )}
        </div>
    );
}

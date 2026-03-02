"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { updateAiContent } from "@/app/actions/ai-content";

interface AiContentProps {
    projectId: string;
    initialContent: any;
}

export default function AiContent({ projectId, initialContent }: AiContentProps) {
    const [content, setContent] = useState(initialContent || { descriptionText: "", commercialText: "" });
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/generate-texts`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setContent(data.aiContent);
            }
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleBlur = useCallback(async (field: string, value: string) => {
        if (value === initialContent?.[field]) return;

        setSaving(true);
        try {
            await updateAiContent(projectId, { [field]: value });
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    }, [projectId, initialContent]);

    const handleChange = (field: string, value: string) => {
        setContent((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-12">
            <header className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Artificial Intelligence</h3>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:bg-transparent"
                >
                    {generating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                    {generating ? "Synthesizing" : "Regenerate Content"}
                </Button>
            </header>

            <div className="space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Technical Context</label>
                        {saving && <div className="h-1 w-1 rounded-full bg-zinc-200 animate-pulse" />}
                    </div>
                    <textarea
                        value={content.descriptionText}
                        onChange={(e) => handleChange("descriptionText", e.target.value)}
                        onBlur={(e) => handleBlur("descriptionText", e.target.value)}
                        placeholder="Project analysis pending..."
                        className="w-full min-h-[140px] p-0 border-none bg-transparent text-xs leading-relaxed text-zinc-600 outline-none resize-none placeholder:text-zinc-100"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Commercial Proposal</label>
                    <textarea
                        value={content.commercialText}
                        onChange={(e) => handleChange("commercialText", e.target.value)}
                        onBlur={(e) => handleBlur("commercialText", e.target.value)}
                        placeholder="Offer details pending..."
                        className="w-full min-h-[140px] p-0 border-none bg-transparent text-xs leading-relaxed text-zinc-600 outline-none resize-none placeholder:text-zinc-100"
                    />
                </div>
            </div>
        </div>
    );
}

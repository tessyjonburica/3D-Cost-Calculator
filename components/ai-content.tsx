"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-tighter text-zinc-900">AI Content Generation</h3>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider"
                >
                    {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {generating ? "Generating..." : "Generate AI Description"}
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Technical Description</Label>
                        {saving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
                    </div>
                    <Textarea
                        value={content.descriptionText}
                        onChange={(e) => handleChange("descriptionText", e.target.value)}
                        onBlur={(e) => handleBlur("descriptionText", e.target.value)}
                        placeholder="AI generated technical description will appear here..."
                        className="min-h-[100px] text-xs leading-relaxed border-zinc-100 bg-zinc-50/30 resize-none focus-visible:ring-1 focus-visible:ring-zinc-200"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Commercial Copy</Label>
                    <Textarea
                        value={content.commercialText}
                        onChange={(e) => handleChange("commercialText", e.target.value)}
                        onBlur={(e) => handleBlur("commercialText", e.target.value)}
                        placeholder="AI generated commercial copy will appear here..."
                        className="min-h-[100px] text-xs leading-relaxed border-zinc-100 bg-zinc-50/30 resize-none focus-visible:ring-1 focus-visible:ring-zinc-200"
                    />
                </div>
            </div>
        </div>
    );
}

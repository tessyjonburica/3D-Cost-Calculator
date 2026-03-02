"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, File3D, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ModelFile {
    status: "UPLOADING" | "QUEUED" | "PROCESSING" | "READY" | "ERROR";
    errorMessage?: string;
    dimX?: number;
    dimY?: number;
    dimZ?: number;
    volume?: number;
    polygonCount?: number;
    originalFileName?: string;
}

interface ModelUploadProps {
    projectId: string;
    initialModel?: ModelFile | null;
}

export default function ModelUpload({ projectId, initialModel }: ModelUploadProps) {
    const [model, setModel] = useState<ModelFile | null>(initialModel || null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    // Poll for status updates if processing
    useEffect(() => {
        if (!model || (model.status !== "QUEUED" && model.status !== "PROCESSING")) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.modelFile) {
                        setModel(data.modelFile);
                        if (data.modelFile.status === "READY" || data.modelFile.status === "ERROR") {
                            clearInterval(interval);
                            router.refresh();
                        }
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [model, projectId, router]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/projects/${projectId}/upload-model`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setModel(data.modelFile);
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Upload failed");
            }
        } catch (err) {
            alert("Upload failed. Please check your connection.");
        } finally {
            setUploading(false);
        }
    };

    if (uploading || (model?.status === "QUEUED" || model?.status === "PROCESSING")) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-4" />
                <h3 className="text-sm font-medium text-zinc-900">
                    {uploading ? "Uploading Model..." : "Processing Geometry..."}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">This usually takes a few seconds</p>
            </div>
        );
    }

    if (model?.status === "READY") {
        return (
            <div className="p-6 bg-white rounded-lg border border-zinc-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-zinc-900">{model.originalFileName}</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-tighter">Model Ready</p>
                        </div>
                    </div>
                    <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".stl,.obj,.3mf" onChange={handleUpload} />
                        <span className="text-xs text-zinc-400 hover:text-zinc-600 underline">Replace</span>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-50 pt-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Dimensions (mm)</p>
                        <p className="text-sm font-semibold tabular-nums">
                            {Number(model.dimX).toFixed(1)} × {Number(model.dimY).toFixed(1)} × {Number(model.dimZ).toFixed(1)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-medium text-zinc-400 uppercase">Volume (cm³)</p>
                        <p className="text-sm font-semibold tabular-nums">{(Number(model.volume) / 1000).toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-50 pt-2">
                    <span>POLYGONS: {model.polygonCount?.toLocaleString()}</span>
                </div>
            </div>
        );
    }

    if (model?.status === "ERROR") {
        return (
            <div className="p-6 bg-red-50 rounded-lg border border-red-100 flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-900">Processing Failed</h3>
                    <p className="text-xs text-red-700 mt-1">{model.errorMessage || "An error occurred during analysis."}</p>
                    <label className="mt-3 inline-block cursor-pointer">
                        <input type="file" className="hidden" accept=".stl,.obj,.3mf" onChange={handleUpload} />
                        <span className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700">Retry Upload</span>
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer relative">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".stl,.obj,.3mf" onChange={handleUpload} />
            <Upload className="h-8 w-8 text-zinc-300 mb-4" />
            <h3 className="text-sm font-medium text-zinc-900">Upload 3D Model</h3>
            <p className="text-xs text-zinc-500 mt-1">STL, OBJ, or 3MF up to 50MB</p>
        </div>
    );
}

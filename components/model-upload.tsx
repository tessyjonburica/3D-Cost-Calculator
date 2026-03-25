"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ModelUploadProps {
    projectId: string;
    initialModel?: any;
}

export default function ModelUpload({ projectId }: ModelUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/dashboard/${projectId}/upload-model`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            toast.success("Model uploaded and queued for processing");
            router.refresh();
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.error(err.message || "Failed to upload model");
        } finally {
            setUploading(false);
        }
    };

    return (
        <label 
            className={`w-full h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer group relative 
                ${dragging ? "border-zinc-900 bg-zinc-50/50 scale-[0.99]" : "border-zinc-200 hover:bg-zinc-50/50 hover:border-zinc-300"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
        >
            <input type="file" className="hidden" accept=".stl,.obj,.3mf" onChange={handleFileChange} disabled={uploading} />

            <div className="text-center space-y-6">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 group-hover:scale-110 transition-transform">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <Upload className="h-5 w-5 text-black" />}
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                        {uploading ? "Ingesting Geometry" : "Import 3D Asset"}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-loose">
                        STL / OBJ / 3MF <br /> Maximum 50mb
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                Drag and drop or click to browse
            </div>
        </label>
    );
}

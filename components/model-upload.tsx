"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

interface ModelUploadProps {
    projectId: string;
    initialModel?: any;
}

export default function ModelUpload({ projectId }: ModelUploadProps) {
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await fetch(`/api/projects/${projectId}/upload-model`, {
                method: "POST",
                body: formData,
            });
            router.refresh();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <label className="w-full h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-3xl hover:bg-zinc-50/50 hover:border-zinc-200 transition-all cursor-pointer group relative">
            <input type="file" className="hidden" accept=".stl,.obj,.3mf" onChange={handleUpload} disabled={uploading} />

            <div className="text-center space-y-6">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 group-hover:scale-110 transition-transform">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <Upload className="h-5 w-5 text-black" />}
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black">
                        {uploading ? "Ingesting Geometry" : "Import 3D Asset"}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">
                        STL / OBJ / 3MF <br /> Maximum 50mb
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 text-[8px] font-bold text-zinc-300 uppercase tracking-widest">
                Drag and drop or click to browse
            </div>
        </label>
    );
}

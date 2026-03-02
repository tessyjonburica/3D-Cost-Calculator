"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProjectParameters } from "@/app/actions/parameters";

const TECHNOLOGIES = ["FDM", "SLA", "SLS", "MJF", "DLP", "POLYJET"];
const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"];

interface ProjectParametersProps {
    projectId: string;
    initialParameters: any;
}

export default function ProjectParametersForm({ projectId, initialParameters }: ProjectParametersProps) {
    const [params, setParams] = useState(initialParameters || {});
    const [saving, setSaving] = useState(false);

    const handleBlur = useCallback(async (field: string, value: any) => {
        if (value === initialParameters?.[field]) return;

        setSaving(true);
        try {
            await updateProjectParameters(projectId, { [field]: value });
            await fetch(`/api/projects/${projectId}/calculate`, { method: "POST" });
        } catch (error) {
            console.error("Failed to save parameters:", error);
        } finally {
            setSaving(false);
        }
    }, [projectId, initialParameters]);

    const handleChange = (field: string, value: any) => {
        setParams((prev: any) => ({ ...prev, [field]: value }));
    };

    const renderInput = (id: string, label: string, type: string = "text") => (
        <div className="flex items-center justify-between py-2 group">
            <Label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">{label}</Label>
            <input
                id={id}
                type={type}
                value={params[id] || ""}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={(e) => handleBlur(id, e.target.value)}
                className="w-24 text-right text-xs font-mono font-bold outline-none bg-transparent"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Print Settings</h3>
                {saving && <div className="h-1 w-1 rounded-full bg-black animate-ping" />}
            </header>

            <div className="divide-y divide-zinc-50 border-t border-b border-zinc-50">
                <div className="flex items-center justify-between py-2 group">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">Technology</Label>
                    <Select
                        value={params.technology}
                        onValueChange={(val) => {
                            handleChange("technology", val);
                            handleBlur("technology", val);
                        }}
                    >
                        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent text-xs font-mono font-bold outline-none focus:ring-0 shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {TECHNOLOGIES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {renderInput("material", "Material")}
                {renderInput("density", "Density (g/cm³)", "number")}
                {renderInput("materialPrice", "Material Price/kg", "number")}
                {renderInput("printingTime", "Printing Time (h)", "number")}
                {renderInput("partsCount", "Parts Count", "number")}
                {renderInput("markupCoefficient", "Markup Ratio", "number")}

                <div className="flex items-center justify-between py-2 group">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">Currency</Label>
                    <Select
                        value={params.currency}
                        onValueChange={(val) => {
                            handleChange("currency", val);
                            handleBlur("currency", val);
                        }}
                    >
                        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent text-xs font-mono font-bold outline-none focus:ring-0 shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

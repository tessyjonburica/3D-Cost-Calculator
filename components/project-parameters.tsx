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
    const [params, setParams] = useState(initialParameters || {
        technology: "FDM",
        material: "PLA",
        density: "1.25",
        materialPrice: "20.00",
        infillPercent: "20.00",
        supportPercent: "10.00",
        printingTime: "5.00",
        postProcessingTime: "1.00",
        simulationTime: "0.50",
        partsCount: 1,
        batchMode: false,
        markupCoefficient: "1.50",
        defectProbability: "0.05",
        taxRate: "0.07",
        depreciationRate: "0.10",
        electricityRate: "0.15",
        currency: "USD",
        language: "EN",
    });

    const [saving, setSaving] = useState(false);

    const handleBlur = useCallback(async (field: string, value: any) => {
        if (value === initialParameters?.[field]) return;

        setSaving(true);
        try {
            await updateProjectParameters(projectId, { [field]: value });
            // Re-trigger calculation via API
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

    const renderInput = (id: string, label: string, type: string = "text", placeholder: string = "") => (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{label}</Label>
            <Input
                id={id}
                type={type}
                value={params[id]}
                placeholder={placeholder}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={(e) => handleBlur(id, e.target.value)}
                className="h-8 border-zinc-100 bg-zinc-50/50 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-zinc-200"
            />
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-lg border border-zinc-100 relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-tighter">Production Parameters</h3>
                {saving && <span className="text-[10px] text-zinc-400 animate-pulse">Saving...</span>}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Technology</Label>
                    <Select
                        value={params.technology}
                        onValueChange={(val) => {
                            handleChange("technology", val);
                            handleBlur("technology", val);
                        }}
                    >
                        <SelectTrigger className="h-8 border-zinc-100 bg-zinc-50/50 text-xs shadow-none focus:ring-1 focus:ring-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TECHNOLOGIES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {renderInput("material", "Material", "text", "PLA, Resin...")}
                {renderInput("density", "Density (g/cm³)", "number")}
                {renderInput("materialPrice", "Price per kg", "number")}
                {renderInput("infillPercent", "Infill %", "number")}
                {renderInput("supportPercent", "Support %", "number")}
                {renderInput("printingTime", "Print Time (h)", "number")}
                {renderInput("postProcessingTime", "Post-process (h)", "number")}
                {renderInput("partsCount", "Parts Count", "number")}
                {renderInput("markupCoefficient", "Markup (e.g. 1.5)", "number")}
                {renderInput("electricityRate", "Elec Rate ($/h)", "number")}

                <div className="space-y-1.5">
                    <Label className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Currency</Label>
                    <Select
                        value={params.currency}
                        onValueChange={(val) => {
                            handleChange("currency", val);
                            handleBlur("currency", val);
                        }}
                    >
                        <SelectTrigger className="h-8 border-zinc-100 bg-zinc-50/50 text-xs shadow-none focus:ring-1 focus:ring-zinc-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

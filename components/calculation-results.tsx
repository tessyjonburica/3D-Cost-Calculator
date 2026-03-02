"use client";

import { useMemo } from "react";

interface CalculationResultsProps {
    calculation: any;
    currency: string;
}

export default function CalculationResults({ calculation, currency }: CalculationResultsProps) {
    if (!calculation) {
        return (
            <div className="h-[200px] flex items-center justify-center text-center opacity-20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Computation Pending</p>
            </div>
        );
    }

    const formatPrice = (val: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(Number(val));
    };

    const breakdownItems = [
        { label: "Material", price: calculation.materialCost },
        { label: "Electricity", price: calculation.electricityCost },
        { label: "Depreciation", price: calculation.depreciationCost },
        { label: "Process Fees", price: calculation.preparationCost },
        { label: "Defect Margin", price: calculation.defectCost },
        { label: "Net Profit", price: calculation.profit },
        { label: "Tax Obligation", price: calculation.tax },
    ];

    return (
        <div className="space-y-12">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Financial Summary</h3>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Unit Price</p>
                    <p className="text-5xl font-black tracking-tighter text-black tabular-nums">
                        {formatPrice(calculation.finalPricePerPiece)}
                    </p>
                </div>
            </header>

            <div className="space-y-8">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Cost Breakdown</p>
                    <div className="space-y-3">
                        {breakdownItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500 font-medium">{item.label}</span>
                                <span className="font-mono text-zinc-900 font-bold tabular-nums">
                                    {formatPrice(item.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Batch Total</p>
                        <p className="text-lg font-black tracking-tight text-zinc-900 tabular-nums">
                            {formatPrice(calculation.finalPriceBatch)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Weight Est.</p>
                        <p className="text-lg font-black tracking-tight text-zinc-900 tabular-nums">
                            {Number(calculation.weight).toFixed(1)}g
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

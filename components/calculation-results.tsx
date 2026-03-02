"use client";

interface CalculationResultsProps {
    calculation: any;
    currency: string;
}

export default function CalculationResults({ calculation, currency }: CalculationResultsProps) {
    if (!calculation) {
        return (
            <div className="p-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-center">
                <p className="text-xs text-zinc-400 font-medium">Complete parameters to see breakdown</p>
            </div>
        );
    }

    const formatPrice = (val: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(Number(val));
    };

    const items = [
        { label: "Material Cost", value: formatPrice(calculation.materialCost) },
        { label: "Electricity", value: formatPrice(calculation.electricityCost) },
        { label: "Depreciation", value: formatPrice(calculation.depreciationCost) },
        { label: "Preparation", value: formatPrice(calculation.preparationCost) },
        { label: "Defect Cost", value: formatPrice(calculation.defectCost) },
        { label: "Profit", value: formatPrice(calculation.profit) },
        { label: "Tax", value: formatPrice(calculation.tax) },
    ];

    return (
        <div className="p-6 bg-zinc-900 text-white rounded-lg border border-zinc-800 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-tighter text-zinc-400">Calculation Breakdown</h3>

            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-zinc-500">{item.label}</span>
                        <span className="font-mono">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Price per Piece</p>
                        <p className="text-2xl font-bold tracking-tight">{formatPrice(calculation.finalPricePerPiece)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Batch</p>
                        <p className="text-lg font-semibold text-zinc-300">{formatPrice(calculation.finalPriceBatch)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

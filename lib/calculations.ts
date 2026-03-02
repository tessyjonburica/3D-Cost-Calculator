import { Decimal } from "@prisma/client/runtime/library";

interface CalculationInputs {
    volume: number; // in mm³
    density: number; // in g/cm³
    materialPrice: number; // per kg
    printingTime: number; // in hours
    electricityRate: number; // per hour
    depreciationRate: number; // per hour
    postProcessingTime: number; // in hours
    simulationTime: number; // in hours
    markupCoefficient: number; // multiplier (e.g., 1.5)
    defectProbability: number; // percentage (0 to 1)
    taxRate: number; // percentage (0 to 1)
    partsCount: number;
}

export function calculateProjectCosts(inputs: CalculationInputs) {
    const {
        volume,
        density,
        materialPrice,
        printingTime,
        electricityRate,
        depreciationRate,
        postProcessingTime,
        simulationTime,
        markupCoefficient,
        defectProbability,
        taxRate,
        partsCount
    } = inputs;

    // 1. Weight calculation (g)
    // volume is in mm³, convert to cm³ (1000 mm³ = 1 cm³)
    const volumeCm3 = volume / 1000;
    const weightG = volumeCm3 * density;
    const weightKg = weightG / 1000;

    // 2. Material Cost
    const materialCost = weightKg * materialPrice;

    // 3. Production Time (hours) - already provided as input
    const productionTime = printingTime;

    // 4. Electricity Cost
    const electricityCost = electricityRate * printingTime;

    // 5. Depreciation Cost
    const depreciationCost = depreciationRate * printingTime;

    // 6. Preparation/Post-Processing Cost
    // Assuming a base hourly rate for manual labor if needed, but here we just sum times
    const totalLaborTime = postProcessingTime + simulationTime;
    const preparationCost = totalLaborTime * 15; // Example base labor rate $15/hr if not specified

    // 7. Defect Cost
    const baseProductionCost = materialCost + electricityCost + depreciationCost + preparationCost;
    const defectCost = baseProductionCost * defectProbability;

    // 8. Total Direct Cost
    const totalDirectCost = baseProductionCost + defectCost;

    // 9. Profit (Markup)
    // Profit = TotalDirectCost * (Markup - 1)
    const profit = totalDirectCost * (markupCoefficient - 1);

    // 10. Pre-Tax Price
    const preTaxPrice = totalDirectCost + profit;

    // 11. Tax
    const tax = preTaxPrice * taxRate;

    // 12. Final Price
    const finalPricePerPiece = preTaxPrice + tax;
    const finalPriceBatch = finalPricePerPiece * partsCount;

    return {
        weight: weightG,
        materialCost,
        productionTime,
        electricityCost,
        depreciationCost,
        preparationCost,
        defectCost,
        profit,
        tax,
        finalPricePerPiece,
        finalPriceBatch
    };
}

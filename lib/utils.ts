import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function serialize<T>(data: T): T {
    return JSON.parse(
        JSON.stringify(data, (key, value) => {
            if (typeof value === "bigint") return value.toString();
            // Handle Prisma Decimal objects
            if (value && typeof value === "object" && value.constructor?.name === "Decimal") {
                return Number(value);
            }
            return value;
        })
    );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModelStatusPoll({ projectId, currentStatus }: { projectId: string, currentStatus: string }) {
    const router = useRouter();

    useEffect(() => {
        if (currentStatus === "READY" || currentStatus === "ERROR") return;

        const interval = setInterval(() => {
            router.refresh();
        }, 3000);

        return () => clearInterval(interval);
    }, [currentStatus, router]);

    return null;
}

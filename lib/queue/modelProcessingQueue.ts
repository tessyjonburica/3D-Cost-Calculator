import { Queue } from "bullmq";
import { connection } from "./connection";

export type ModelProcessingJobData = {
    projectId: string;
    filePath: string;
    originalFileName: string;
};

export const modelProcessingQueue = new Queue("modelProcessingQueue", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
    },
});

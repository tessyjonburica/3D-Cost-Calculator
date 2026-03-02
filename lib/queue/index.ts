import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
});

export const modelProcessingQueue = new Queue("model-processing", {
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

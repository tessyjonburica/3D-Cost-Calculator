export type ModelProcessingJobData = {
    jobId: string;
    uploadedModelId: string;
    filePath: string;
    userId: string;
};

export type ModelProcessingJobResult = {
    volume: number;
    surfaceArea: number;
    boundingBox: {
        x: number;
        y: number;
        z: number;
    };
    estimatedPrintTimeSeconds: number;
};

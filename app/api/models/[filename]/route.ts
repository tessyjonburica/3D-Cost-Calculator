import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
    req: NextRequest,
    context: { params: { filename: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "uploads", filename);

    try {
        const fileBuffer = await readFile(filePath);
        const ext = path.extname(filename).toLowerCase();

        let contentType = "application/octet-stream";
        if (ext === ".stl") contentType = "model/stl";
        if (ext === ".obj") contentType = "text/plain";
        if (ext === ".3mf") contentType = "model/3mf";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        return new NextResponse("File not found", { status: 404 });
    }
}

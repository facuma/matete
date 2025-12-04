import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { resizeImage, getResizedFilename } from "@/lib/imageUtils";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, '-');
        const filename = `${timestamp}-${originalName}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        // Save original file
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        // Generate resized version (width 800px)
        const resizedFilename = getResizedFilename(filename);
        const resizedFilepath = path.join(uploadsDir, resizedFilename);
        await resizeImage(filepath, resizedFilepath, 800);

        const imageUrl = `/uploads/${filename}`;
        const resizedUrl = `/uploads/${resizedFilename}`;

        return NextResponse.json({ imageUrl, resizedUrl }, { status: 200 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import sharp from "sharp";
import { uploadObject, listObjects, deleteObject } from "@/lib/storage/r2";

// Ensure this runs in Node.js runtime for Sharp
export const runtime = 'nodejs';

/**
 * POST: Upload Image
 * Optimizes image with Sharp and uploads to Cloudflare R2.
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const url = formData.get("url");

        if (!file && !url) {
            return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
        }

        let buffer;
        let originalFilename = "image.jpg";

        // 1. Get Buffer from File or URL
        if (file) {
            if (!(file instanceof File)) {
                return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
            }
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            originalFilename = file.name;
        } else if (url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch image from URL");
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                originalFilename = url.split('/').pop().split('?')[0] || 'imported-image.jpg';
            } catch (fetchError) {
                console.error("Error fetching URL source:", fetchError);
                return NextResponse.json({ error: "Failed to process external URL" }, { status: 400 });
            }
        }

        // 2. Optimize with Sharp
        // Resize to width 1200 (maintain aspect ratio), WebP, Quality 80
        const optimizedBuffer = await sharp(buffer)
            .rotate() // Auto-orient based on EXIF
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // 3. Upload to R2
        // Change extension to .webp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filenameBase = originalFilename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-]/g, '-');
        const r2Key = `uploads/${filenameBase}-${uniqueSuffix}.webp`;

        const { url: publicUrl } = await uploadObject({
            key: r2Key,
            body: optimizedBuffer,
            contentType: 'image/webp'
        });

        // Return expected format
        return NextResponse.json({
            imageUrl: publicUrl,
            resizedUrl: publicUrl
        }, { status: 200 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error uploading file: " + error.message }, { status: 500 });
    }
}

/**
 * GET: List Images
 * Lists images from Cloudflare R2.
 */
export async function GET() {
    try {
        const files = await listObjects(100);

        // Map to format expected by frontend
        const mappedFiles = files.map(file => ({
            name: file.key.replace('uploads/', ''), // Display name (optional clean up)
            url: file.url,
            created_at: file.lastModified,
            size: file.size,
            source: 'r2'
        }));

        // Sort by date desc
        mappedFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return NextResponse.json(mappedFiles);

    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE: Remove Image
 * Deletes from Cloudflare R2.
 */
export async function DELETE(request) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        // The filename coming from frontend might be just the name or full path.
        // Our list returns "uploads/..." masked as key, or name.
        // If we look at GET above, we sent `name: file.key.replace('uploads/', '')`?
        // Wait, if we send `name` as just the filename, the frontend might send that back.
        // R2 `uploadObject` used `uploads/...` as key.
        // Let's assume the frontend sends what we gave it in `name`.
        // If `name` was "foo.webp", real key is "uploads/foo.webp".
        // But wait, `listObjects` in `r2.ts` returns `key` as the full key. 
        // In GET above: `name: file.key.replace('uploads/', '')`.
        // So frontend receives simplified name.
        // We should reconstruct the key or handle it.
        // Ideally, the frontend should send the full key or we assume prefix.
        // Legacy code used `uploads/${filename}` for deletion.
        // Let's stick to that pattern: prepend `uploads/` if missing.

        const key = filename.startsWith('uploads/') ? filename : `uploads/${filename}`;

        await deleteObject(key);

        return NextResponse.json({ success: true, source: 'r2' });

    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

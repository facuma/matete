import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";

// Configuration
const EXTERNAL_API_URL = process.env.EXTERNAL_IMAGE_API_URL || "https://images.cubells.com.ar";
const EXTERNAL_AUTH_TOKEN = process.env.EXTERNAL_IMAGE_AUTH_TOKEN;

// Ensure this runs in Node.js runtime for Sharp
export const runtime = 'nodejs';

/**
 * POST: Upload Image
 * Optimizes image with Sharp and uploads to External API.
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
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        // 3. Prepare FormData for External API
        const externalFormData = new FormData();
        // The external API expects 'file'. We send the optimized buffer as a file.
        // We need to pass a Blob-like object. In Node, we can append a Blob or try Buffer with options.
        // Standard FormData in Node context (from 'undici' or native in Node 18+) might behave differently.
        // Let's create a Blob from the buffer.
        const optimizedBlob = new Blob([optimizedBuffer], { type: 'image/webp' });

        // Change extension to .webp
        const requestFilename = originalFilename.replace(/\.[^/.]+$/, "") + ".webp";

        externalFormData.append("file", optimizedBlob, requestFilename);

        // 4. Send to External API
        const uploadResponse = await fetch(`${EXTERNAL_API_URL}/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${EXTERNAL_AUTH_TOKEN}`
            },
            body: externalFormData,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("External API Error:", errorText);
            throw new Error(`External API responded with ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();

        // Return expected format
        return NextResponse.json({
            imageUrl: data.url,
            resizedUrl: data.url // Legacy support if needed
        }, { status: 200 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error uploading file: " + error.message }, { status: 500 });
    }
}

/**
 * GET: List Images
 * Combines images from Supabase Storage (Legacy) and External API (New).
 */
export async function GET() {
    try {
        // 1. Fetch from Supabase (Legacy)
        const supabasePromise = (async () => {
            if (!supabaseAdmin) return [];
            const { data, error } = await supabaseAdmin.storage
                .from('products')
                .list('uploads', {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) {
                console.error("Supabase list error:", error);
                return [];
            }

            return data
                .filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(`uploads/${file.name}`);
                    return {
                        name: file.name,
                        url: publicUrl,
                        created_at: file.created_at,
                        size: file.metadata?.size || 0,
                        source: 'supabase'
                    };
                });
        })();

        // 2. Fetch from External API (New)
        const externalPromise = (async () => {
            try {
                const res = await fetch(`${EXTERNAL_API_URL}/files`, {
                    headers: {
                        "Authorization": `Bearer ${EXTERNAL_AUTH_TOKEN}`
                    }
                });
                if (!res.ok) throw new Error("External API list failed");
                return await res.json();
            } catch (err) {
                console.error("External API list error:", err);
                return [];
            }
        })();

        // Wait for both
        const [supabaseFiles, externalFiles] = await Promise.all([supabasePromise, externalPromise]);

        // Validate structure of external files
        const validExternalFiles = Array.isArray(externalFiles) ? externalFiles.map(f => ({
            ...f,
            source: 'external'
        })) : [];

        // Combine and Sort
        const allFiles = [...validExternalFiles, ...supabaseFiles].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        return NextResponse.json(allFiles);

    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE: Remove Image
 * Tries to delete from External API first, then falls back to Supabase.
 */
export async function DELETE(request) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        // Try deleting from External API
        let deletedFromExternal = false;
        try {
            const res = await fetch(`${EXTERNAL_API_URL}/uploads/${filename}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${EXTERNAL_AUTH_TOKEN}`
                }
            });
            if (res.ok) {
                deletedFromExternal = true;
            } else if (res.status === 404) {
                deletedFromExternal = false;
            } else {
                console.error("External delete error stauts:", res.status);
                // If 500 or other error, logic says "Intentar borrar de Supabase Storage si falla"
                // So we assume not deleted and try supabase? 
                // Or "Si devuelve 404 (o falla)". "o falla" implies any failure.
                // So we continue to Supabase.
            }
        } catch (err) {
            console.error("External delete fetch error:", err);
        }

        if (deletedFromExternal) {
            return NextResponse.json({ success: true, source: 'external' });
        }

        // If not deleted from external (e.g. 404), try Supabase
        if (!supabaseAdmin) {
            // If supabase not configured, but we failed external, we might just fail.
            // But let's verify if we need legacy cleanup.
            console.error("Supabase Admin not configured for fallback delete");
            // We can't do much if Supabase invalid. 
            // Return error or success? If external failed, we probably want to try Supabase.
            return NextResponse.json({ error: "Configuration error for fallback delete" }, { status: 500 });
        }

        const { error } = await supabaseAdmin.storage
            .from('products')
            .remove([`uploads/${filename}`]);

        if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json({ error: "Failed to delete file from both sources" }, { status: 500 });
        }

        return NextResponse.json({ success: true, source: 'supabase' });

    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

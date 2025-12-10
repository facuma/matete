import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";
import { getResizedFilename } from "@/lib/imageUtils";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const url = formData.get("url");

        if (!file && !url) {
            return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
        }

        // Validate server configuration
        if (!supabaseAdmin) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Convert file or URL to buffer
        let buffer;
        let originalFilename;

        if (file) {
            const bytes = await file.arrayBuffer();
            buffer = Buffer.from(bytes);
            originalFilename = file.name;
        } else if (url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch image from URL");
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                // Extract filename from URL or use default
                originalFilename = url.split('/').pop().split('?')[0] || 'imported-image.jpg';
            } catch (fetchError) {
                console.error("Error fetching URL:", fetchError);
                return NextResponse.json({ error: "Failed to fetch image from URL" }, { status: 400 });
            }
        }

        // OPTIMIZATION: Resize & Compress BEFORE Upload
        let optimizedBuffer;
        try {
            optimizedBuffer = await sharp(buffer)
                .rotate() // Respect EXIF orientation
                .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
                .webp({ quality: 80 }) // Convert to WebP, 80% quality
                .toBuffer();
        } catch (resizeError) {
            console.error("Optimization failed, falling back to original:", resizeError);
            optimizedBuffer = buffer;
        }

        // Create unique filename (ensure .webp extension if optimized)
        const timestamp = Date.now();
        const originalName = originalFilename.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${timestamp}-${originalName}.webp`;

        // Upload One Optimized File
        const { data, error } = await supabaseAdmin.storage
            .from('products')
            .upload(`uploads/${filename}`, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: false
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
        }

        // Get Public URL
        const { data: { publicUrl: imageUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(`uploads/${filename}`);

        return NextResponse.json({
            imageUrl,
            resizedUrl: imageUrl // Backwards compatibility
        }, { status: 200 });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin.storage
            .from('products')
            .list('uploads', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error("Error listing files:", error);
            return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
        }

        const files = data
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => {
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(`uploads/${file.name}`);

                return {
                    name: file.name,
                    url: publicUrl,
                    created_at: file.created_at,
                    size: file.metadata?.size || 0 // Add size
                };
            });

        return NextResponse.json(files);
    } catch (error) {
        console.error("Error getting files:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Delete from 'products' bucket
        const { error } = await supabaseAdmin.storage
            .from('products')
            .remove([`uploads/${filename}`]);

        if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";
import { getResizedFilename } from "@/lib/imageUtils";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate server configuration
        if (!supabaseAdmin) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: "Server configuration error: Missing Service Role Key" }, { status: 500 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${timestamp}-${originalName}`;
        const resizedFilename = getResizedFilename(filename);

        // Upload Original to Supabase (using Admin client to bypass RLS)
        const { data: originalData, error: originalError } = await supabaseAdmin.storage
            .from('products')
            .upload(`uploads/${filename}`, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (originalError) {
            console.error("Supabase upload error:", originalError);
            return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
        }

        // Resize image (memory buffer)
        let resizedBuffer;
        try {
            resizedBuffer = await sharp(buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .toBuffer();
        } catch (resizeError) {
            console.error("Error resizing image:", resizeError);
            resizedBuffer = buffer;
        }

        // Upload Resized to Supabase (using Admin client)
        const { data: resizedData, error: resizedError } = await supabaseAdmin.storage
            .from('products')
            .upload(`uploads/${resizedFilename}`, resizedBuffer, {
                contentType: file.type,
                upsert: false
            });


        if (resizedError) {
            console.error("Supabase resized upload error:", resizedError);
            // Proceed with original if resized fails, or fail? Let's verify original URL exists.
        }

        // Get Public URLs
        const { data: { publicUrl: imageUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(`uploads/${filename}`);

        const { data: { publicUrl: resizedUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(`uploads/${resizedFilename}`);

        return NextResponse.json({
            imageUrl,
            resizedUrl: resizedError ? imageUrl : resizedUrl // Fallback to original if resize upload failed
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
                    created_at: file.created_at
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

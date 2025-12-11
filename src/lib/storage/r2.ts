import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 Configuration
 * 
 * Required Environment Variables:
 * - R2_ACCOUNT_ID
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 * - R2_BUCKET_NAME (Default: 'matete')
 * - R2_PUBLIC_BASE_URL (Default: 'https://71d8d3b62199ecc25ad7c3c3d2588842.r2.cloudflarestorage.com/matete')
 */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'matete';
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || 'https://71d8d3b62199ecc25ad7c3c3d2588842.r2.cloudflarestorage.com/matete';

// Initialize S3 Client targeting Cloudflare R2
// https://developers.cloudflare.com/r2/api/s3/tokens/
const r2Config = {
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID || '',
        secretAccessKey: SECRET_ACCESS_KEY || '',
    },
};

// Singleton Client
// Note: In Next.js dev environment this might re-init on reload, but for stateless functions it is fine.
const r2Client = new S3Client(r2Config);

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.warn("⚠️ Warning: Missing R2 Environment Variables. Storage operations via R2 will fail.");
}

/**
 * Uploads an object to Cloudflare R2
 * @param {string} key - The file path/name in the bucket
 * @param {Buffer|Uint8Array|Blob|string} body - The file content
 * @param {string} contentType - Mime type of the file
 * @returns {Promise<{ url: string, key: string }>} - Public URL and Key
 */
export async function uploadObject({ key, body, contentType }: { key: string; body: Buffer | Uint8Array | Blob | string; contentType: string }) {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await r2Client.send(command);

        return {
            url: getPublicUrl(key),
            key: key
        };
    } catch (error) {
        console.error(`[R2] Upload failed for key: ${key}`, error);
        throw new Error(`Failed to upload to R2: ${(error as Error).message}`);
    }
}

/**
 * Deletes an object from Cloudflare R2
 * @param {string} key - The file path/name in the bucket
 */
export async function deleteObject(key: string) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error(`[R2] Delete failed for key: ${key}`, error);
        // We log but maybe we shouldn't throw to avoid blocking other cleanup logic?
        // But for strictness let's throw.
        throw new Error(`Failed to delete from R2: ${(error as Error).message}`);
    }
}

/**
 * Generates the public URL for a given key
 * @param {string} key - The file path/name in the bucket
 * @returns {string} - Full public URL
 */
export function getPublicUrl(key: string): string {
    // Ensure no double slashes if key starts with /
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    // Determine base url, remove trailing slash if present
    const cleanBase = PUBLIC_BASE_URL.endsWith('/') ? PUBLIC_BASE_URL.slice(0, -1) : PUBLIC_BASE_URL;
    return `${cleanBase}/${cleanKey}`;
}

/**
 * Lists objects from Cloudflare R2
 * @param {number} limit - Max number of items to return
 * @returns {Promise<Array<{ key: string, url: string, lastModified: Date, size: number }>>}
 */
export async function listObjects(limit: number = 100) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: limit,
        });

        const response = await r2Client.send(command);

        return (response.Contents || []).map(item => ({
            key: item.Key || '',
            url: getPublicUrl(item.Key || ''),
            lastModified: item.LastModified || new Date(),
            size: item.Size || 0
        }));
    } catch (error) {
        console.error("[R2] List objects failed", error);
        throw new Error(`Failed to list R2 objects: ${(error as Error).message}`);
    }
}

/**
 * Helper to get the S3 client instance if needed directly
 */
export function getR2Client() {
    return r2Client;
}

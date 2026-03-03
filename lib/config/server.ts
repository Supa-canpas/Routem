//サーバーで用いる環境変数を取得するための関数を定義するファイル

import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


let prisma: PrismaClient | null = null;
let s3Client: S3Client | null = null;

export function getPrisma() {
    if (prisma) return prisma;

    const dbType = process.env.DB_TYPE || 'local';
    const connectionString = dbType === 'vercel' 
        ? process.env.VERCEL_DATABASE_URL 
        : process.env.LOCAL_DATABASE_URL;

    if (!connectionString) {
        throw new Error(`Database connection string for type '${dbType}' is not defined.`);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    
    return prisma;
}

// MinIO を使った S3クライアントのゲッター
// 必要な環境変数:
// - MINIO_ENDPOINT (例: "localhost")
// - MINIO_PORT (例: "9000")
// - MINIO_ACCESS_KEY
// - MINIO_SECRET_KEY
// - MINIO_USE_SSL ("true" or "false")
export function getS3Client() {
    if (s3Client) return s3Client;

    const rawEndpoint = process.env.MINIO_ENDPOINT || "localhost";
    const endpointPort = process.env.MINIO_PORT || "9000";
    const accessKeyId = process.env.MINIO_ACCESS_KEY;
    const secretAccessKey = process.env.MINIO_SECRET_KEY;
    const useSSL = (process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";

    if (!rawEndpoint || !accessKeyId || !secretAccessKey) {
        throw new Error("Missing MinIO env: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY are required");
    }

    const protocol = useSSL ? "https" : "http";

    // Normalize endpoint: allow MINIO_ENDPOINT to be either host[:port] or full URL
    let endpoint: string;
    if (/^https?:\/\//i.test(rawEndpoint)) {
        // Use as-is, just trim trailing slashes
        endpoint = rawEndpoint.replace(/\/+$/g, "");
    } else {
        const hostNoPort = rawEndpoint.replace(/:\d+$/, "");
        const port = endpointPort;
        endpoint = `${protocol}://${hostNoPort}:${port}`;
    }

    s3Client = new S3Client({
        region: "us-east-1", // MinIOは任意、S3互換のため固定でOK
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
    });

    return s3Client;
}

import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { sanitizeUploadFilename } from "@/lib/security";

const LOCAL_UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const LOCAL_UPLOAD_PREFIX = "/uploads/";

type StorageProvider = "local" | "s3";

type StorageConfig = {
  provider: StorageProvider;
  bucket?: string;
  region?: string;
  endpoint?: string;
  publicBaseUrl?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER?.trim().toLowerCase() || "local") as StorageProvider;

  if (provider === "s3") {
    return {
      provider,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    };
  }

  return { provider: "local" };
}

function assertS3Config(config: StorageConfig) {
  const requiredFields = [
    ["S3_BUCKET", config.bucket],
    ["S3_ENDPOINT", config.endpoint],
    ["S3_ACCESS_KEY_ID", config.accessKeyId],
    ["S3_SECRET_ACCESS_KEY", config.secretAccessKey],
    ["S3_PUBLIC_BASE_URL", config.publicBaseUrl],
  ] as const;

  const missing = requiredFields.filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`S3 storage is not fully configured. Missing env vars: ${missing.join(", ")}`);
  }
}

function createObjectKey(filename: string) {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `uploads/${year}/${month}/${Date.now()}-${sanitizeUploadFilename(filename)}`;
}

async function writeLocalUpload(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

  const filename = `${Date.now()}-${sanitizeUploadFilename(file.name)}`;
  const filepath = join(LOCAL_UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);
  return `${LOCAL_UPLOAD_PREFIX}${filename}`;
}

async function deleteLocalUploadFromUrl(imageUrl: string | null | undefined) {
  if (!imageUrl || !imageUrl.startsWith(LOCAL_UPLOAD_PREFIX)) {
    return;
  }

  try {
    const filepath = join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
    await unlink(filepath);
  } catch (error) {
    console.error("Failed to remove local uploaded image:", error);
  }
}

function getS3Client(config: StorageConfig) {
  assertS3Config(config);

  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  });
}

function buildPublicUrl(config: StorageConfig, objectKey: string) {
  const baseUrl = config.publicBaseUrl!.replace(/\/+$/, "");
  return `${baseUrl}/${objectKey}`;
}

function getObjectKeyFromUrl(imageUrl: string, config: StorageConfig) {
  const baseUrl = config.publicBaseUrl?.replace(/\/+$/, "");
  if (!baseUrl || !imageUrl.startsWith(`${baseUrl}/`)) {
    return null;
  }

  return imageUrl.slice(baseUrl.length + 1);
}

async function writeS3Upload(file: File, config: StorageConfig) {
  const client = getS3Client(config);
  const objectKey = createObjectKey(file.name);
  const bytes = await file.arrayBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket!,
      Key: objectKey,
      Body: Buffer.from(bytes),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return buildPublicUrl(config, objectKey);
}

async function deleteS3UploadFromUrl(imageUrl: string | null | undefined, config: StorageConfig) {
  if (!imageUrl) {
    return;
  }

  const objectKey = getObjectKeyFromUrl(imageUrl, config);
  if (!objectKey) {
    return;
  }

  try {
    const client = getS3Client(config);
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucket!,
        Key: objectKey,
      })
    );
  } catch (error) {
    console.error("Failed to remove object storage image:", error);
  }
}

export function getActiveStorageProvider() {
  return getStorageConfig().provider;
}

export function getStorageReadiness() {
  const config = getStorageConfig();

  if (config.provider === "local") {
    return {
      ok: true as const,
      provider: "local" as const,
      configured: true,
      missing: [] as string[],
    };
  }

  const requiredFields = [
    ["S3_BUCKET", config.bucket],
    ["S3_ENDPOINT", config.endpoint],
    ["S3_ACCESS_KEY_ID", config.accessKeyId],
    ["S3_SECRET_ACCESS_KEY", config.secretAccessKey],
    ["S3_PUBLIC_BASE_URL", config.publicBaseUrl],
  ] as const;

  const missing = requiredFields.filter(([, value]) => !value).map(([key]) => key);

  return {
    ok: missing.length === 0,
    provider: "s3" as const,
    configured: missing.length === 0,
    missing,
  };
}

export async function writeUpload(file: File) {
  const config = getStorageConfig();

  if (config.provider === "s3") {
    return writeS3Upload(file, config);
  }

  // TEMP(tech-debt): local disk storage remains only as a transitional development adapter.
  return writeLocalUpload(file);
}

export async function deleteUploadFromUrl(imageUrl: string | null | undefined) {
  const config = getStorageConfig();

  if (config.provider === "s3") {
    return deleteS3UploadFromUrl(imageUrl, config);
  }

  // TEMP(tech-debt): local disk delete remains only as a transitional development adapter.
  return deleteLocalUploadFromUrl(imageUrl);
}

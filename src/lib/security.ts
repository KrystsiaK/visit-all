const DEV_FALLBACK_AUTH_SECRET = "local-dev-auth-secret-change-me";

export function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_AUTH_SECRET;
  }

  throw new Error("AUTH_SECRET is required in production.");
}

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_MB = Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024));

export function validateImageUpload(file: File | null | undefined) {
  if (!file) {
    throw new Error("No file uploaded");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Use JPG, PNG, WEBP, or GIF.");
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large. Maximum upload size is ${MAX_UPLOAD_MB}MB.`);
  }
}

export function sanitizeUploadFilename(filename: string) {
  return filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}

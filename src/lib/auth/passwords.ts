import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";

import bcrypt from "bcryptjs";
import {
  getPasswordPolicyErrors,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./password-policy";
import { normalizeEmail } from "./email-policy";

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;
const SCRYPT_N = 1 << 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_R * 2;

type PasswordPolicyResult = {
  ok: boolean;
  message: string | null;
};

function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number }
) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { ...options, maxmem: SCRYPT_MAXMEM }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey as Buffer);
    });
  });
}

function encodeScryptHash(salt: Buffer, derivedKey: Buffer) {
  return [
    "scrypt",
    SCRYPT_N.toString(),
    SCRYPT_R.toString(),
    SCRYPT_P.toString(),
    salt.toString("base64"),
    derivedKey.toString("base64"),
  ].join("$");
}

async function hashWithScrypt(password: string) {
  const salt = randomBytes(SCRYPT_SALT_LENGTH);
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return encodeScryptHash(salt, derivedKey);
}

async function verifyScryptHash(password: string, encodedHash: string) {
  const [scheme, n, r, p, saltBase64, hashBase64] = encodedHash.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !saltBase64 || !hashBase64) {
    return false;
  }

  const salt = Buffer.from(saltBase64, "base64");
  const storedKey = Buffer.from(hashBase64, "base64");
  const derivedKey = await scryptAsync(password, salt, storedKey.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  return timingSafeEqual(storedKey, derivedKey);
}

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const errors = getPasswordPolicyErrors(password);
  if (errors.length > 0) {
    return { ok: false, message: errors[0] };
  }

  return { ok: true, message: null };
}

export { getPasswordPolicyErrors, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH };
export { normalizeEmail };

export async function hashPassword(password: string) {
  return hashWithScrypt(password);
}

export async function verifyPassword(password: string, storedHash: string, algorithm?: string | null) {
  if (!storedHash) {
    return false;
  }

  if (algorithm === "bcrypt" || storedHash.startsWith("$2")) {
    return bcrypt.compare(password, storedHash);
  }

  if (algorithm === "scrypt" || storedHash.startsWith("scrypt$")) {
    return verifyScryptHash(password, storedHash);
  }

  return false;
}

export async function needsPasswordUpgrade(storedHash: string, algorithm?: string | null) {
  return algorithm === "bcrypt" || storedHash.startsWith("$2");
}

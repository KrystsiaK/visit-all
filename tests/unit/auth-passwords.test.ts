import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";

import {
  hashPassword,
  needsPasswordUpgrade,
  normalizeEmail,
  validatePasswordPolicy,
  verifyPassword,
} from "@/lib/auth/passwords";

describe("auth password utilities", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmail("  USER@Example.com ")).toBe("user@example.com");
  });

  it("accepts strong enough passwords", () => {
    expect(validatePasswordPolicy("CorrectHorseBattery1!").ok).toBe(true);
  });

  it("rejects passwords shorter than 12 chars", () => {
    expect(validatePasswordPolicy("short").ok).toBe(false);
  });

  it("returns the first password policy error message", () => {
    expect(validatePasswordPolicy("password").message).toBe("Use at least 12 characters.");
  });

  it("hashes and verifies passwords with scrypt", async () => {
    const password = "CorrectHorseBattery1!";
    const hash = await hashPassword(password);

    await expect(verifyPassword(password, hash, "scrypt")).resolves.toBe(true);
    await expect(verifyPassword("wrong password", hash, "scrypt")).resolves.toBe(false);
  });

  it("rejects empty or malformed stored hashes", async () => {
    await expect(verifyPassword("CorrectHorseBattery1!", "", "scrypt")).resolves.toBe(false);
    await expect(verifyPassword("CorrectHorseBattery1!", "scrypt$broken", "scrypt")).resolves.toBe(
      false
    );
    await expect(
      verifyPassword("CorrectHorseBattery1!", "unknown$hash$value", "argon2")
    ).resolves.toBe(false);
  });

  it("verifies bcrypt hashes and marks them for upgrade", async () => {
    const password = "CorrectHorseBattery1!";
    const bcryptHash = await bcrypt.hash(password, 10);

    await expect(verifyPassword(password, bcryptHash, "bcrypt")).resolves.toBe(true);
    await expect(verifyPassword("wrong password", bcryptHash, "bcrypt")).resolves.toBe(false);
    await expect(needsPasswordUpgrade(bcryptHash, "bcrypt")).resolves.toBe(true);
  });

  it("does not request upgrade for scrypt hashes", async () => {
    const hash = await hashPassword("CorrectHorseBattery1!");

    await expect(needsPasswordUpgrade(hash, "scrypt")).resolves.toBe(false);
  });
});

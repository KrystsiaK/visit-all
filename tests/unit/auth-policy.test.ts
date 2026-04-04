import { describe, expect, it } from "vitest";

import {
  EMAIL_LOCAL_PART_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  getEmailPolicyErrors,
  validateEmailPolicy,
} from "@/lib/auth/email-policy";
import {
  getPasswordPolicyErrors,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/password-policy";

describe("auth policy utilities", () => {
  describe("email policy", () => {
    it("normalizes before validating", () => {
      expect(validateEmailPolicy("  USER@Example.com ")).toEqual({
        ok: true,
        message: null,
      });
    });

    it("accepts a normal email address", () => {
      expect(validateEmailPolicy("user@example.com").ok).toBe(true);
    });

    it("rejects missing at sign", () => {
      expect(getEmailPolicyErrors("user.example.com")).toContain("Enter a valid email address.");
    });

    it("rejects spaces", () => {
      expect(getEmailPolicyErrors("user name@example.com")).toContain(
        "Email addresses cannot contain spaces."
      );
    });

    it("rejects overly long local parts", () => {
      const localPart = "a".repeat(EMAIL_LOCAL_PART_MAX_LENGTH + 1);
      expect(getEmailPolicyErrors(`${localPart}@example.com`)).toContain(
        `Use at most ${EMAIL_LOCAL_PART_MAX_LENGTH} characters before '@'.`
      );
    });

    it("rejects overly long addresses", () => {
      const domain = `${"a".repeat(EMAIL_MAX_LENGTH)}.com`;
      expect(getEmailPolicyErrors(`u@${domain}`)).toContain(
        `Use at most ${EMAIL_MAX_LENGTH} characters.`
      );
    });

    it("rejects incomplete domains", () => {
      expect(getEmailPolicyErrors("user@example")).toContain(
        "Use a full email domain like 'name@example.com'."
      );
    });

    it("rejects dotted local and domain edge cases", () => {
      expect(getEmailPolicyErrors(".user@example.com")).toContain(
        "Email addresses cannot start or end with a dot before '@'."
      );
      expect(getEmailPolicyErrors("us..er@example.com")).toContain(
        "Email addresses cannot contain consecutive dots before '@'."
      );
      expect(getEmailPolicyErrors("user@.example.com")).toContain("Enter a valid email address.");
      expect(getEmailPolicyErrors("user@example..com")).toContain("Enter a valid email address.");
    });

    it("rejects empty local or domain parts", () => {
      expect(getEmailPolicyErrors("@example.com")).toContain("Enter a valid email address.");
      expect(getEmailPolicyErrors("user@")).toContain("Enter a valid email address.");
    });

    it("returns the first validation error as the summary message", () => {
      expect(validateEmailPolicy("user example.com")).toEqual({
        ok: false,
        message: "Email addresses cannot contain spaces.",
      });
    });
  });

  describe("password policy", () => {
    it("accepts passwords that satisfy every rule", () => {
      expect(getPasswordPolicyErrors("CorrectHorse1!").length).toBe(0);
    });

    it("rejects passwords shorter than the minimum", () => {
      expect(getPasswordPolicyErrors("Short1!")).toContain(
        `Use at least ${PASSWORD_MIN_LENGTH} characters.`
      );
    });

    it("rejects passwords longer than the maximum", () => {
      expect(getPasswordPolicyErrors(`${"A".repeat(PASSWORD_MAX_LENGTH)}1!a`)).toContain(
        `Use at most ${PASSWORD_MAX_LENGTH} characters.`
      );
    });

    it("requires lowercase, uppercase, number, and special character", () => {
      expect(getPasswordPolicyErrors("ALLUPPERCASE1!")).toContain(
        "Include at least one lowercase letter."
      );
      expect(getPasswordPolicyErrors("alllowercase1!")).toContain(
        "Include at least one uppercase letter."
      );
      expect(getPasswordPolicyErrors("NoNumberPassword!")).toContain(
        "Include at least one number."
      );
      expect(getPasswordPolicyErrors("NoSpecialPassword1")).toContain(
        "Include at least one special character."
      );
    });
  });
});

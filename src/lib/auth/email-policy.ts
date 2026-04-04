export const EMAIL_MAX_LENGTH = 254;
export const EMAIL_LOCAL_PART_MAX_LENGTH = 64;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getEmailPolicyErrors(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const errors: string[] = [];

  if (normalizedEmail.length === 0) {
    errors.push("Enter a valid email address.");
    return errors;
  }

  if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
    errors.push(`Use at most ${EMAIL_MAX_LENGTH} characters.`);
  }

  if (/\s/.test(normalizedEmail)) {
    errors.push("Email addresses cannot contain spaces.");
  }

  const parts = normalizedEmail.split("@");

  if (parts.length !== 2) {
    errors.push("Enter a valid email address.");
    return errors;
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    errors.push("Enter a valid email address.");
    return errors;
  }

  if (localPart.length > EMAIL_LOCAL_PART_MAX_LENGTH) {
    errors.push(`Use at most ${EMAIL_LOCAL_PART_MAX_LENGTH} characters before '@'.`);
  }

  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    errors.push("Email addresses cannot start or end with a dot before '@'.");
  }

  if (localPart.includes("..")) {
    errors.push("Email addresses cannot contain consecutive dots before '@'.");
  }

  if (domain.startsWith(".") || domain.endsWith(".")) {
    errors.push("Enter a valid email address.");
  }

  if (domain.includes("..")) {
    errors.push("Enter a valid email address.");
  }

  if (!domain.includes(".")) {
    errors.push("Use a full email domain like 'name@example.com'.");
  }

  return Array.from(new Set(errors));
}

export function validateEmailPolicy(email: string) {
  const errors = getEmailPolicyErrors(email);

  if (errors.length > 0) {
    return {
      ok: false as const,
      message: errors[0],
    };
  }

  return {
    ok: true as const,
    message: null,
  };
}

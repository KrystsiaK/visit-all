export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/;

export function getPasswordPolicyErrors(password: string) {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Use at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Use at most ${PASSWORD_MAX_LENGTH} characters.`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Include at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Include at least one uppercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Include at least one number.");
  }

  if (!PASSWORD_SPECIAL_CHARACTER_PATTERN.test(password)) {
    errors.push("Include at least one special character.");
  }

  return errors;
}

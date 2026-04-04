import { getEmailPolicyErrors } from "./email-policy";
import { getPasswordPolicyErrors } from "./password-policy";

export function getEmailFieldErrors(email: string) {
  return getEmailPolicyErrors(email);
}

export function getPasswordFieldErrors(password: string) {
  return getPasswordPolicyErrors(password);
}

export function getRequiredPasswordErrors(password: string, label = "password") {
  if (password.length > 0) {
    return [];
  }

  return [`Enter your ${label}.`];
}

export function getConfirmPasswordErrors(password: string, confirmPassword: string) {
  if (confirmPassword.length === 0) {
    return ["Confirm your password."];
  }

  if (password !== confirmPassword) {
    return ["Passwords must match."];
  }

  return [];
}

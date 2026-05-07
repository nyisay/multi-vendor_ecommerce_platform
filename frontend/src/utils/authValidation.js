const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /\d/;
const SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/;
const VERIFICATION_CODE_REGEX = /^\d{6}$/;

export const PASSWORD_REQUIREMENTS_TEXT =
  "Use at least 8 characters with uppercase, lowercase, a number, and a symbol.";

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim().toLowerCase());
}

export function getPasswordValidationError(password) {
  const normalizedPassword = String(password || "");

  if (normalizedPassword.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!UPPERCASE_REGEX.test(normalizedPassword)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!LOWERCASE_REGEX.test(normalizedPassword)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!NUMBER_REGEX.test(normalizedPassword)) {
    return "Password must include at least one number.";
  }

  if (!SPECIAL_CHARACTER_REGEX.test(normalizedPassword)) {
    return "Password must include at least one special character.";
  }

  return "";
}

export function isValidVerificationCode(code) {
  return VERIFICATION_CODE_REGEX.test(String(code || "").trim());
}

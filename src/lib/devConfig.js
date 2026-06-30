// Dev mode is gated to a single account, regardless of environment.
const DEV_USER_EMAILS = ["jonathan@rainbowheart.studio"];

export function isDevUser(email) {
  if (!email) return false;
  return DEV_USER_EMAILS.includes(email.toLowerCase());
}

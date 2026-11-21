import { createClient } from "@supabase/supabase-js";

// Independent student PIN sign-in uses a dedicated account tied to one student.

const KID_EMAIL_DOMAIN = "kids.heartbeats.app";

export const AVATARS = ["🐯", "🐼", "🦊", "🐸", "🦄", "🐙", "🦖", "🐳", "🦉", "🐝", "🐨", "🌟"];

export const INSTRUMENTS = ["Piano", "Guitar", "Ukulele", "Voice", "Drums", "Other"];

export function makeKidEmail(studentId) {
  return `kid-${studentId}@${KID_EMAIL_DOMAIN}`;
}

export function makeKidPassword(familyCode, pin) {
  return `hb-${familyCode.toUpperCase().trim()}-${pin}`;
}

export function randomPin() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value % 10).join("");
}

export function normalizeFamilyCode(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "-").replace(/-+/g, "-");
}

// A second client that never persists its session — used to create kid auth
// accounts during the family wizard without signing the parent out of the
// main client. (supabase.auth.signUp signs in the new user on whichever
// client makes the call.)
let secondaryClient = null;
export function createSignupClient() {
  return createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY, {
    auth: { storageKey: "hb-family-signup", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function getSecondaryClient() {
  if (!secondaryClient) {
    secondaryClient = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY,
      { auth: { storageKey: "hb-kid-registration", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );
  }
  return secondaryClient;
}

export async function registerIndependentKid(studentId, name, familyCode, pin) {
  const credentials = { email: makeKidEmail(studentId), password: makeKidPassword(familyCode, pin) };
  const client = getSecondaryClient();
  const result = await client.auth.signUp({
    ...credentials, options: { data: { role: "student", display_name: name.trim() } },
  });
  if (result.data?.session) return result.data.session.user.id;
  // Recover the same student's login if an earlier signup succeeded before the link was saved.
  const retry = await client.auth.signInWithPassword(credentials);
  if (retry.error) throw result.error || retry.error;
  return retry.data.user.id;
}

import { createClient } from "@supabase/supabase-js";

// Kid accounts are real Supabase users behind the scenes, but kids never see
// an email or password. Each kid gets a synthetic email derived from their
// student id, and their password is derived from the family code + their PIN.

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
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function normalizeFamilyCode(raw) {
  return raw.toUpperCase().replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// A second client that never persists its session — used to create kid auth
// accounts during the family wizard without signing the parent out of the
// main client. (supabase.auth.signUp signs in the new user on whichever
// client makes the call.)
let secondaryClient = null;
export function getSecondaryClient() {
  if (!secondaryClient) {
    secondaryClient = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );
  }
  return secondaryClient;
}

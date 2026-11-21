// Reset a kid's login PIN.
//
// Kids sign in with a password derived from their family code + 4-digit PIN
// (see src/lib/familyAuth.js). Changing that password requires admin rights,
// which the browser must never hold — so this function does it, after
// verifying the caller is the kid's parent or their teacher.
//
// POST body: { student_id: string, new_pin: string }
// Auth: caller's Supabase JWT (verify_jwt is on).

import { createClient } from "npm:@supabase/supabase-js@2";
import { isSafePinResetTarget } from "./target-safety.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, x-hb-space, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "POST only" });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the caller from their JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const caller = userData?.user;
    if (userError || !caller) {
      return json(401, { error: "Not signed in" });
    }

    const { student_id, new_pin } = await req.json();
    if (typeof student_id !== "string" || !/^[0-9a-f-]{36}$/i.test(student_id) || !/^\d{4}$/.test(String(new_pin))) {
      return json(400, { error: "Need student_id and a 4-digit new_pin" });
    }

    const callerDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader, "x-hb-space": req.headers.get("x-hb-space") || "" } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: allowed, error: permissionError } = await callerDb.rpc("hb_can_reset_kid", { p_student: student_id });
    if (permissionError || allowed !== true) return json(403, { error: "Open Parent space or ask your teacher for help." });

    const { data: student } = await admin.from("students")
      .select("id, family_id, auth_user_id, name").eq("id", student_id).maybeSingle();
    if (!student?.auth_user_id || !student.family_id) {
      return json(409, { error: "Use Family sign-in for this student." });
    }

    const { data: family } = await admin
      .from("families")
      .select("code")
      .eq("id", student.family_id)
      .single();
    if (!family) {
      return json(400, { error: "No family record for this student" });
    }

    // Legacy records can point at a parent's actual login or at an account
    // shared by more than one student. Never change either account's password.
    const { data: targetAuth, error: targetError } = await admin.auth.admin.getUserById(student.auth_user_id);
    const { data: accountStudents, error: accountStudentsError } = await admin
      .from("students")
      .select("id")
      .eq("auth_user_id", student.auth_user_id);
    if (targetError || accountStudentsError || !isSafePinResetTarget({
      studentId: student.id,
      accountEmail: targetAuth?.user?.email,
      linkedStudentIds: accountStudents?.map((row) => row.id),
    })) {
      return json(409, { error: "This login needs help from the studio before its PIN can be changed." });
    }

    // Must mirror makeKidPassword() in src/lib/familyAuth.js.
    const newPassword = `hb-${family.code.toUpperCase().trim()}-${new_pin}`;
    const { error: updateError } = await admin.auth.admin.updateUserById(
      student.auth_user_id,
      { password: newPassword }
    );
    if (updateError) {
      return json(500, { error: "Could not update the student PIN." });
    }

    return json(200, { ok: true, student: student.name });
  } catch {
    return json(500, { error: "Could not update the student PIN." });
  }
});

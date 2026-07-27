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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    if (typeof student_id !== "string" || !/^\d{4}$/.test(String(new_pin))) {
      return json(400, { error: "Need student_id and a 4-digit new_pin" });
    }

    const { data: student } = await admin
      .from("students")
      .select("id, teacher_id, family_id, auth_user_id, name")
      .eq("id", student_id)
      .single();
    if (!student) {
      return json(404, { error: "Student not found" });
    }
    if (!student.auth_user_id || !student.family_id) {
      return json(400, { error: "This student doesn't use PIN login" });
    }

    // Caller must be the kid's teacher or a linked parent.
    const isTeacher = student.teacher_id === caller.id;
    const { data: links } = await admin
      .from("parent_students")
      .select("id")
      .eq("student_id", student_id)
      .or(`parent_auth_user_id.eq.${caller.id},parent_email.eq.${caller.email}`);
    if (!isTeacher && !(links && links.length > 0)) {
      return json(403, { error: "You're not linked to this student" });
    }

    const { data: family } = await admin
      .from("families")
      .select("code")
      .eq("id", student.family_id)
      .single();
    if (!family) {
      return json(400, { error: "No family record for this student" });
    }

    // Must mirror makeKidPassword() in src/lib/familyAuth.js.
    const newPassword = `hb-${family.code.toUpperCase().trim()}-${new_pin}`;
    const { error: updateError } = await admin.auth.admin.updateUserById(
      student.auth_user_id,
      { password: newPassword }
    );
    if (updateError) {
      return json(500, { error: updateError.message });
    }

    return json(200, { ok: true, student: student.name });
  } catch (err) {
    return json(500, { error: (err as Error).message ?? "Unexpected error" });
  }
});

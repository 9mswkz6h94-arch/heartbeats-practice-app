// Text a parent when a teacher flags a communication_log message.
//
// Called directly by the client right after CommLog inserts a message with
// notify=true (fire-and-forget from the caller's side — see CommLog.js).
// Never sends message content, only a pointer, per the plan's privacy rule.
//
// POST body: { message_id: string }
// Auth: caller's Supabase JWT (verify_jwt is on) — must be the message's teacher.

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

async function sendTwilioSms(to: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const from = Deno.env.get("TWILIO_FROM_NUMBER")!;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Twilio error ${res.status}`);
  return data;
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

    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const caller = userData?.user;
    if (userError || !caller) {
      return json(401, { error: "Not signed in" });
    }

    const { message_id } = await req.json();
    if (typeof message_id !== "string") {
      return json(400, { error: "Need message_id" });
    }

    const { data: message } = await admin
      .from("communication_log")
      .select("id, student_id, notify, notified_at")
      .eq("id", message_id)
      .single();
    if (!message) return json(404, { error: "Message not found" });
    if (!message.notify) return json(200, { ok: true, skipped: "not flagged" });
    if (message.notified_at) return json(200, { ok: true, skipped: "already notified" });

    const { data: student } = await admin
      .from("students")
      .select("id, name, teacher_id")
      .eq("id", message.student_id)
      .single();
    if (!student) return json(404, { error: "Student not found" });
    if (student.teacher_id !== caller.id) {
      return json(403, { error: "You're not this student's teacher" });
    }

    const { data: parents } = await admin
      .from("parent_students")
      .select("id, parent_phone")
      .eq("student_id", student.id)
      .eq("notify_sms", true)
      .not("parent_phone", "is", null);

    const appUrl = Deno.env.get("APP_URL") || "https://heartbeats-practice-app.netlify.app";
    const firstName = (student.name || "your child").split(" ")[0];
    const body = `Heart Beats: new message about ${firstName} — open the app: ${appUrl}`;

    const results = [];
    for (const p of parents || []) {
      try {
        await sendTwilioSms(p.parent_phone!, body);
        results.push({ parent_students_id: p.id, ok: true });
      } catch (err) {
        results.push({ parent_students_id: p.id, ok: false, error: (err as Error).message });
      }
    }

    // Mark notified if we reached at least one recipient (or there were none to reach —
    // either way the "pending" state shouldn't hang forever with no eligible parents).
    await admin
      .from("communication_log")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", message_id)
      .is("notified_at", null);

    return json(200, { ok: true, sent: results });
  } catch (err) {
    return json(500, { error: (err as Error).message ?? "Unexpected error" });
  }
});

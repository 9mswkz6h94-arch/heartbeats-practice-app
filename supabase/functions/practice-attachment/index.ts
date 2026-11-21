import { createClient } from "npm:@supabase/supabase-js@2";
import { assignmentObjectPath } from "./object-path.js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, x-hb-space, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
const unavailable = () => new Response("Assignment sheet unavailable", { status: 404, headers });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return new Response(null, { status: 405, headers });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const bearer = req.headers.get("Authorization");
    if (!bearer) return new Response(null, { status: 401, headers });
    const { assignment_id } = await req.json();
    if (typeof assignment_id !== "string" || !/^[0-9a-f-]{36}$/i.test(assignment_id)) return unavailable();
    const viewer = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: bearer, "x-hb-space": req.headers.get("x-hb-space") || "" } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await viewer.from("assignments").select("teacher_id,attachment_url").eq("id", assignment_id).maybeSingle();
    if (error || !data) return unavailable();
    const path = assignmentObjectPath(data.attachment_url, data.teacher_id, url);
    if (!path) return unavailable();
    const store = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const file = await store.storage.from("assignment-attachments").download(path);
    if (file.error || !file.data) return unavailable();
    return new Response(file.data, { headers: { ...headers, "Content-Type": "application/octet-stream" } });
  } catch { return unavailable(); }
});

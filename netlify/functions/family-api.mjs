import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const cookieName = "__Host-hb-family";
const prefix = "/.netlify/functions/family-api/";
const week = 7 * 86400;
const readable = new Set(["students","assignments","practice_steps","completions","daily_practice_status","repertoire",
  "student_badges","teacher_badge_awards","sightreading_attempts","pets","pet_creatures","student_zoo_preferences",
  "parent_students","families","lessons","reschedule_requests","communication_log","comm_thread_reads"]);
const writable = {
  POST: new Set(["completions","daily_practice_status","sightreading_attempts","student_badges","student_zoo_preferences",
    "reschedule_requests","communication_log","comm_thread_reads"]),
  DELETE: new Set(["daily_practice_status"]),
  PATCH: new Set(["daily_practice_status","student_zoo_preferences"]),
};
const routines = new Set(["hb_family_state","hb_unlock_family","hb_choose_space","hb_forget_device",
  "hb_save_contact_preferences","hb_cancel_reschedule","hatch_egg","merge_creatures","set_pet_name","choose_pet_species"]);

export function allowedRequest(path, method, query) {
  if (path.startsWith("functions/v1/")) return method === "POST" && ["functions/v1/reset-kid-pin","functions/v1/practice-attachment"].includes(path);
  if (path.startsWith("rest/v1/rpc/")) return method === "POST" && routines.has(path.slice(12)) && !query.toString();
  const table = path.startsWith("rest/v1/") && path.slice(8);
  if (!readable.has(table)) return false;
  for (const select of query.getAll("select")) {
    if (!/^[\w\s*,()]+$/.test(select)) return false;
    for (const match of select.matchAll(/(\w+)\s*\(/g)) if (!["practice_steps","assignments"].includes(match[1])) return false;
  }
  return method === "GET" || method === "HEAD" || Boolean(writable[method]?.has(table));
}

function seal(session, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm",key,iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(session),"utf8"),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),data]).toString("base64url");
}
function unseal(raw, key) {
  if (!raw || raw.length > 4060) return null;
  try {
    const bytes = Buffer.from(raw,"base64url");
    const cipher = createDecipheriv("aes-256-gcm",key,bytes.subarray(0,12));
    cipher.setAuthTag(bytes.subarray(12,28));
    const session = JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString());
    return session.until > Date.now() ? session : null;
  } catch { return null; }
}
function cookie(value, seconds) {
  return cookieName+"="+value+"; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age="+seconds;
}
const safeHeaders = { "Cache-Control":"private, no-store", "Netlify-CDN-Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" };
function json(status, data, setCookie) {
  return Response.json(data,{ status,headers:{ ...safeHeaders,...(setCookie ? { "Set-Cookie":setCookie } : {}) } });
}

export default async function handler(req) {
  const url = new URL(req.url);
  if ((req.headers.has("origin") && req.headers.get("origin") !== url.origin) ||
      req.headers.get("x-hb-app") !== "family" || !url.pathname.startsWith(prefix)) {
    return json(403,{error:"Open the practice app to continue."});
  }
  const api = process.env.REACT_APP_SUPABASE_URL;
  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const secret = process.env.HB_FAMILY_COOKIE_KEY;
  if (!api || !anon || !/^[a-f\d]{64}$/i.test(secret || "")) return json(503,{error:"Family sign-in is temporarily unavailable."});
  const key = Buffer.from(secret,"hex");
  const path = url.pathname.slice(prefix.length);
  const remote = (route, opts = {}, token = anon) => fetch(api+"/"+route,{
    ...opts, redirect:"error", headers:{apikey:anon, Authorization:"Bearer "+token,...opts.headers},
  });
  const tokenRequest = async (method, data) => {
    const res = await remote("auth/v1/token?grant_type="+method,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),
    });
    if (res.status >= 500) throw new Error("Authentication service unavailable");
    return res.ok ? res.json() : null;
  };
  const packet = (t,until) => ({
    id:t.user.id, access:t.access_token, refresh:t.refresh_token, expires:Date.now()+t.expires_in*1000, until,
  });
  try {
    if (path === "login" && req.method === "POST") {
      const body = await req.text();
      if (body.length>4096) return json(400,{error:"Check your email and password."});
      const { email,password } = JSON.parse(body);
      if (typeof email!=="string" || typeof password!=="string") return json(400,{error:"Enter your email and password."});
      const t = await tokenRequest("password",{email,password});
      if (!t) return json(401,{error:"Check your family email and password."});
      const verified = await remote("rest/v1/rpc/hb_family_state",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"},t.access_token);
      if (!verified.ok || !(await verified.json()).family) {
        await remote("auth/v1/logout?scope=local",{method:"POST"},t.access_token);
        return json(403,{error:"This login has no active family connection. Ask your teacher to check the link."});
      }
      return json(200,{id:t.user.id},cookie(seal(packet(t,Date.now()+week*1000),key),week));
    }
    const match = (req.headers.get("cookie") || "").split(/;\s*/).find(c=>c.startsWith(cookieName+"="));
    let session = unseal(match?.slice(cookieName.length+1),key);
    const signedOut = () => {
      if (path==="logout" && req.method==="POST") return json(200,{ok:true},cookie("",0));
      if (path==="self" && req.method==="GET") return json(200,{id:null},match ? cookie("",0) : null);
      return json(401,{error:"Sign in to the family again."},match ? cookie("",0) : null);
    };
    if (!session) return signedOut();
    let renewed;
    if (session.expires < Date.now()+60000) {
      const t = await tokenRequest("refresh_token",{refresh_token:session.refresh});
      if (!t || t.user.id!==session.id) return signedOut();
      session=packet(t,session.until);
      renewed=cookie(seal(session,key),Math.max(0,Math.floor((session.until-Date.now())/1000)));
    }
    if (path==="self" && req.method==="GET") return json(200,{id:session.id},renewed);
    if (path==="logout" && req.method==="POST") {
      const forget=await remote("rest/v1/rpc/hb_forget_device",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"},session.access);
      if (!forget.ok && forget.status!==401) return json(503,{error:"Could not lock this device. Please try again."},renewed);
      await remote("auth/v1/logout?scope=local",{method:"POST"},session.access);
      return json(200,{ok:true},cookie("",0));
    }
    if (!allowedRequest(path,req.method,url.searchParams)) return json(403,{error:"Unavailable in this workspace."});
    const headers={};
    for (const name of ["accept","content-type","prefer","range","range-unit","x-hb-space"]) {
      if (req.headers.has(name)) headers[name]=req.headers.get(name);
    }
    const body=["GET","HEAD"].includes(req.method) ? undefined : await req.text();
    if ((body?.length || 0)>131072) return json(413,{error:"Request too large."});
    const result=await remote(path+url.search,{method:req.method,headers,body},session.access);
    const responseHeaders=new Headers(safeHeaders);
    for (const name of ["content-type","content-range","preference-applied"]) {
      if (result.headers.has(name)) responseHeaders.set(name,result.headers.get(name));
    }
    if (renewed) responseHeaders.set("Set-Cookie",renewed);
    return new Response(req.method==="HEAD" || [204,205,304].includes(result.status) ? null : result.body,{
      status:result.status,headers:responseHeaders,
    });
  } catch { return json(503,{error:"The family service could not connect. Please try again."}); }
}

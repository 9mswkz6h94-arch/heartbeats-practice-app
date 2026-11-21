import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import handler, { allowedRequest } from "../netlify/functions/family-api.mjs";

test("shared-device cookie only authorizes the practice API", async () => {
  const oldFetch=globalThis.fetch;
  const domain="https://practice.example.test", base=domain+"/.netlify/functions/family-api/";
  const settings={REACT_APP_SUPABASE_URL:"https://data.example.test",REACT_APP_SUPABASE_ANON_KEY:"public-test-key",HB_FAMILY_COOKIE_KEY:randomBytes(32).toString("hex")};
  const before=Object.fromEntries(Object.keys(settings).map(k=>[k,process.env[k]]));
  Object.assign(process.env,settings);
  let forwardedScope;
  globalThis.fetch=async (url,opts) => {
    const path=new URL(url).pathname;
    if(path==="/auth/v1/token") return Response.json({user:{id:"guardian"},access_token:"test-adult-access",refresh_token:"test-adult-refresh",expires_in:3600});
    if(path==="/rest/v1/rpc/hb_family_state") return Response.json({family:true});
    if(path==="/rest/v1/assignments"){
      forwardedScope=opts.headers["x-hb-space"];
      assert.equal(opts.headers.Authorization,"Bearer test-adult-access");
      return Response.json([{title:"A tune"}]);
    }
    if(path==="/rest/v1/rpc/hb_forget_device" || path==="/auth/v1/logout") return new Response(null,{status:204});
    throw new Error("Unexpected backend route");
  };
  const req=(path,method="GET",headers={},body) => new Request(base+path,{method,headers:{origin:domain,"x-hb-app":"family",...headers},body});
  try {
    const logged=await handler(req("login","POST",{},JSON.stringify({email:"adult@example.test",password:"test-only"})));
    assert.deepEqual(await logged.json(),{id:"guardian"});
    const setCookie=logged.headers.get("set-cookie");
    for(const attr of ["HttpOnly","Secure","SameSite=Strict","Path=/"]) assert.ok(setCookie.includes(attr));
    assert.ok(!setCookie.includes("test-adult-"));
    const cookie=setCookie.split(";")[0];
    const result=await handler(req("rest/v1/assignments?select=title,practice_steps(id)","GET",{cookie,"x-hb-space":"only-this-child"}));
    assert.equal(forwardedScope,"only-this-child");
    assert.deepEqual(await result.json(),[{title:"A tune"}]);
    assert.match(result.headers.get("cache-control"),/no-store/);
    assert.equal((await handler(req("auth/v1/user","GET",{cookie}))).status,403);
    assert.equal((await handler(req("self","GET",{cookie,origin:"https://external.example.test"}))).status,403);
    const valueStart=cookie.indexOf("=")+1;
    const changed=cookie.slice(0,valueStart)+(cookie[valueStart]==="A" ? "B" : "A")+cookie.slice(valueStart+1);
    assert.deepEqual(await (await handler(req("self","GET",{cookie:changed}))).json(),{id:null});
    assert.deepEqual(await (await handler(req("logout","POST",{cookie:changed}))).json(),{ok:true});
    const loggedOut=await handler(req("logout","POST",{cookie}));
    assert.equal(loggedOut.status,200);
    assert.match(loggedOut.headers.get("set-cookie"),/Max-Age=0/);
  } finally {
    globalThis.fetch=oldFetch;
    for(const [key,value] of Object.entries(before)) {if(value===undefined) delete process.env[key]; else process.env[key]=value;}
  }
});
test("ordinary read and write routes are explicitly scoped", () => {
  const q=new URLSearchParams("select=title,practice_steps(id,title)");
  assert.ok(allowedRequest("rest/v1/assignments","GET",q));
  assert.ok(allowedRequest("rest/v1/rpc/hb_choose_space","POST",new URLSearchParams()));
  assert.equal(allowedRequest("rest/v1/assignments","POST",q),false);
  assert.equal(allowedRequest("rest/v1/parent_students","PATCH",new URLSearchParams()),false);
  assert.equal(allowedRequest("rest/v1/rpc/hb_issue_parent_setup","POST",new URLSearchParams()),false);
  assert.equal(allowedRequest("rest/v1/assignments","GET",new URLSearchParams("select=other_workspace(*)")),false);
});

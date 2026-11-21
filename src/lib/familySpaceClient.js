import { createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export const FamilySpaceContext = createContext(null);
export const useWorkspaceClient = () => useContext(FamilySpaceContext) || supabase;

// Each mounted workspace keeps its own immutable credential. Delayed writes
// from a previous workspace still carry its revoked credential.
export function createSignupSpaceClient(scopeToken, signup) {
  const client = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY, {
    global: { headers: { "x-hb-space": scopeToken } },
    accessToken: async () => {
      const { data, error } = await signup.auth.getSession();
      if (error || !data.session) throw new Error("Please sign in again.");
      return data.session.access_token;
    },
  });
  return {
    from: client.from.bind(client),
    rpc: client.rpc.bind(client),
    functions: client.functions,
    auth: { getUser: () => signup.auth.getUser() },
  };
}

const gateway = "/.netlify/functions/family-api";
async function account(path, method = "GET", body) {
  const response = await fetch(gateway + "/" + path, {
    method, credentials: "same-origin", cache: "no-store",
    headers: { "x-hb-app": "family", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (path === "self" && (!response.headers.get("content-type")?.includes("application/json") || response.status === 401)) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not connect to family sign-in.");
  return data.id || null;
}
export const familyIdentity = () => account("self");
export const familySignIn = (email, password) => account("login", "POST", { email, password });
export const familySignOut = () => account("logout", "POST");

export function createFamilySpaceClient(scopeToken, userId) {
  const client = createClient(window.location.origin + gateway, "family-browser", {
    accessToken: async () => null,
    global: { headers: { "x-hb-app": "family", ...(scopeToken ? { "x-hb-space": scopeToken } : {}) } },
  });
  return {
    from: client.from.bind(client), rpc: client.rpc.bind(client), functions: client.functions,
    auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
  };
}
let chooser;
export const familyRpc = (name, args) => {
  if (!chooser) chooser = createFamilySpaceClient(null, null);
  return chooser.rpc(name, args);
};

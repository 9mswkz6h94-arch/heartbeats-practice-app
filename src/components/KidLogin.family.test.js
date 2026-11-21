import React, { act } from "react";
import { createRoot } from "react-dom/client";
import KidLogin from "./KidLogin";
import { supabase } from "../lib/supabaseClient";

global.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    rpc: jest.fn(async () => ({ data: [
      { student_id: "synthetic-one", name: "One" },
      { student_id: "synthetic-two", name: "Two" },
    ], error: null })),
    auth: { signInWithPassword: jest.fn(async () => ({ error: null })) },
  },
}));

test("remembered family code offers two students and signs in the selected child", async () => {
  supabase.rpc.mockResolvedValue({ data: [{ student_id: "synthetic-one", name: "One" }, { student_id: "synthetic-two", name: "Two" }], error: null });
  supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
  localStorage.setItem("hb_family_code", " TEST-CODE-42 ");
  const host = document.createElement("div"); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(<KidLogin onUseEmailInstead={() => {}} />); });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  expect(supabase.rpc).toHaveBeenCalledWith("get_family_kids", { p_code: "TEST-CODE-42" });
  const click = async (label) => {
    const button = [...host.querySelectorAll("button")].find((item) => item.textContent.trim() === label);
    expect(button).toBeDefined();
    await act(async () => { button.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  };
  expect(host.textContent).toContain("One"); expect(host.textContent).toContain("Two");
  await click("🎵Two");
  for (const digit of ["1", "2", "3", "4"]) await click(digit);
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "kid-synthetic-two@kids.heartbeats.app", password: "hb-TEST-CODE-42-1234" });
  await act(async () => root.unmount()); host.remove(); localStorage.clear();
});

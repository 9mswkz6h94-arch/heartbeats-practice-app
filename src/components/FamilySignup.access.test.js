import React, { act } from "react";
import { createRoot } from "react-dom/client";
import FamilySignup from "./FamilySignup";
import { createSignupClient, registerIndependentKid } from "../lib/familyAuth";
import { createSignupSpaceClient } from "../lib/familySpaceClient";

jest.mock("../lib/familyAuth", () => ({
  AVATARS: ["🎵"], INSTRUMENTS: ["Piano"], randomPin: () => "1432",
  createSignupClient: jest.fn(), registerIndependentKid: jest.fn(),
}));
jest.mock("../lib/familySpaceClient", () => ({ createSignupSpaceClient: jest.fn() }));

test("shared students use the family email and only an opted-in child gets an independent login", async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const initialCrypto = Object.getOwnPropertyDescriptor(global, "crypto");
  let counter = 0;
  Object.defineProperty(global, "crypto", { configurable: true, value: { randomUUID: () => "fixture-" + ++counter } });
  const signup = {
    auth: { signUp: jest.fn().mockResolvedValue({ data: { session: { user: { id: "guardian" } } } }) },
    rpc: jest.fn().mockResolvedValue({ data: { family_id: "household", family_code: "SAMPLE",
      token: "fixture", expires: new Date(Date.now()+600000).toISOString() } }),
  };
  const register = jest.fn().mockResolvedValue({ error: null });
  createSignupClient.mockReturnValue(signup);
  createSignupSpaceClient.mockReturnValue({ rpc: register });
  registerIndependentKid.mockResolvedValue("independent-account");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const submit = () => act(async () => host.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  const type = (selector, value) => act(async () => {
    const field = host.querySelector(selector);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
  try {
    await act(async () => root.render(<FamilySignup />));
    await submit();
    expect(host.querySelector('[aria-label="Kid 1 PIN"]')).toBeNull();
    await type('[aria-label="Kid 1 name"]', "River");
    await act(async () => host.querySelector(".btn-add-kid").click());
    await type('[aria-label="Kid 2 name"]', "Sky");
    await act(async () => host.querySelectorAll('input[type="checkbox"]')[1].click());
    await submit();
    expect(registerIndependentKid.mock.calls).toEqual([["fixture-2","Sky","SAMPLE","1432"]]);
    expect(register.mock.calls.map(([routine, args]) => [routine,args.p_profile.name,args.p_account])).toEqual([
      ["hb_register_family_student","River",null], ["hb_register_family_student","Sky","independent-account"],
    ]);
    expect(host.querySelector(".pin-recap").textContent).toContain("Sky");
    expect(host.querySelector(".pin-recap").textContent).not.toContain("River");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    if (initialCrypto) Object.defineProperty(global, "crypto", initialCrypto); else delete global.crypto;
  }
});

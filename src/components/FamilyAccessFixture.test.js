import React, { act } from "react";
import { createRoot } from "react-dom/client";
import FamilyAccessFixture from "./FamilyAccessFixture";

global.IS_REACT_ACT_ENVIRONMENT = true;

test("sample students have separate progress when switching through the chooser", async () => {
  const host = document.createElement("div"); document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<FamilyAccessFixture />));
  const click = async (text) => {
    const button = [...host.querySelectorAll("button")].find((item) => item.textContent.includes(text));
    expect(button).toBeDefined();
    await act(async () => button.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  };
  await click("Sam"); await click("Mark complete"); await click("Choose another person");
  await click("Alex"); expect(host.textContent).toContain("Ready when you are");
  await click("Choose another person"); await click("Sam");
  expect(host.textContent).toContain("Complete in this preview");
  await click("Choose another person"); await click("Parent space");
  expect(host.textContent).toContain("does not provide access to actual family information");
  await act(async () => root.unmount()); host.remove();
});

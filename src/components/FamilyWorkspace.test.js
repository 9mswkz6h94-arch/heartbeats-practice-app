import React, { act } from "react";
import { createRoot } from "react-dom/client";
import FamilyWorkspace from "./FamilyWorkspace";
import { familyRpc } from "../lib/familySpaceClient";

global.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock("../lib/familySpaceClient", () => ({
  familyRpc: jest.fn(), familySignOut: jest.fn(),
  FamilySpaceContext: require("react").createContext(null),
  createFamilySpaceClient: token => ({ token }),
}));
jest.mock("./StudentDashboard", () => props => <><h1>{props.studentName}</h1><button onClick={props.onChoosePerson}>Choose another person</button></>);
jest.mock("./ParentDashboard", () => props => <><h1>Private family information</h1><button onClick={props.onChoosePerson}>Choose another person</button></>);

test("a shared device needs guardian approval, switches student scopes, and prompts again for Parent space", async () => {
  const students = [{ id: "a", name: "Sam", status: "active" }, { id: "b", name: "Alex", status: "active" }];
  let approved = false, revision = 0;
  familyRpc.mockImplementation(async (name, args) => {
    if (name === "hb_family_state") return { data: { family: true, setup: false, approved, revision, students: approved ? students : [] } };
    if (name === "hb_unlock_family") {
      if (args.p_pin !== "123456") return { data: { error: "Check your PIN" } };
      approved = true;
    }
    return { data: { revision: ++revision, token: "synthetic-scope-" + revision, expires: new Date(Date.now() + 600000).toISOString() } };
  });
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const click = async label => {
    const button = [...host.querySelectorAll("button")].find(b => b.textContent.includes(label));
    expect(button).toBeDefined();
    await act(async () => button.click());
  };
  const submit = async pin => {
    const input = host.querySelector("#hb-private-pin");
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,pin);
      input.dispatchEvent(new Event("input",{ bubbles: true }));
    });
    await act(async () => host.querySelector("form").dispatchEvent(new Event("submit",{ bubbles: true, cancelable: true })));
  };
  await act(async () => root.render(<FamilyWorkspace userId="sample-parent" onLogout={jest.fn()} />));
  expect(host.textContent).toContain("Approve this device");
  expect(host.textContent).not.toContain("Sam");
  await submit("123456");
  await click("Sam");
  expect(host.querySelector("h1").textContent).toBe("Sam");
  await click("Choose another person");
  await click("Alex");
  expect(host.querySelector("h1").textContent).toBe("Alex");
  await click("Choose another person");
  await click("Parent space");
  expect(host.textContent).not.toContain("Private family information");
  await submit("000000");
  expect(host.querySelector("[role=alert]").textContent).toContain("Check your PIN");
  await submit("123456");
  expect(host.textContent).toContain("Private family information");
  await click("Choose another person");
  expect(host.textContent).not.toContain("Private family information");
  await act(async () => root.unmount());
  host.remove();
});

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ParentDashboard from "./ParentDashboard";

global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("./KidPracticePanel", () => {
  const React = require("react");
  return function SyntheticPanel({ kid }) {
    const [resetOpen, setResetOpen] = React.useState(false);
    return <div><span>Showing {kid.name}</span><button onClick={() => setResetOpen(true)}>Open reset</button>{resetOpen && <span>Reset form for {kid.name}</span>}</div>;
  };
});

jest.mock("../lib/supabaseClient", () => ({
  supabase: { from: (table) => table === "parent_students" ? {
    update: () => ({ eq: () => ({ is: async () => ({ error: null }) }) }),
    select: () => ({ eq: async () => ({ data: [{ student_id: "one" }, { student_id: "two" }], error: null }) }),
  } : {
    select: () => ({ in: () => ({ order: async () => ({ data: [
      { id: "one", name: "Student One", family_id: null },
      { id: "two", name: "Student Two", family_id: null },
    ], error: null }) }) }),
  } },
}));

test("switching siblings clears an open student-specific form", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(<ParentDashboard userId="synthetic-parent" userEmail="parent@example.test" />); });
  const click = async (text) => {
    const button = [...container.querySelectorAll("button")].find((item) => item.textContent.includes(text));
    expect(button).toBeDefined();
    await act(async () => { button.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  };
  await click("Open reset");
  expect(container.textContent).toContain("Reset form for Student One");
  const siblingButtons = [...container.querySelectorAll(".kid-tab")];
  await act(async () => { siblingButtons[1].dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  expect(container.textContent).toContain("Showing Student Two");
  expect(container.textContent).not.toContain("Reset form for Student Two");
  expect(container.textContent).not.toContain("Reset form for Student One");
  await act(async () => root.unmount());
  container.remove();
});

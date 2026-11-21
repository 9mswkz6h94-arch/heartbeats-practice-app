import { assignmentObjectPath as resolve } from "../../supabase/functions/practice-attachment/object-path";

test("legacy and new sheets resolve only inside the assignment teacher’s bucket folder", () => {
  const site = "https://test.supabase.co";
  const old = site + "/storage/v1/object/public/assignment-attachments/teacher/123.pdf";
  expect(resolve(old, "teacher", site)).toBe("teacher/123.pdf");
  expect(resolve("assignment-file:teacher/123.png", "teacher", site)).toBe("teacher/123.png");
  expect(resolve(old, "other", site)).toBeNull();
  expect(resolve(old, "teacher", "https://different.example")).toBeNull();
  expect(resolve("assignment-file:teacher/../other/123.pdf", "teacher", site)).toBeNull();
});

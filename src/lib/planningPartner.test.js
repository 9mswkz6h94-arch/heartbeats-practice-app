import {
  answerPlanningQuestion,
  buildStudioPlanningPrompts,
} from "./planningPartner";

const student = {
  name: "Alex Rivera",
  memory: { activeWorkTitle: "Easy chorus starts", draft: { id: "draft-1" } },
  nextLesson: "Today · 4:30 PM",
};

test("builds useful local prompts from the current workspace", () => {
  const prompts = buildStudioPlanningPrompts([student]);
  expect(prompts).toHaveLength(3);
  expect(prompts.join(" ")).toMatch(/Alex|draft/i);
});

test("answers from teacher-entered notes without publishing anything", () => {
  const answer = answerPlanningQuestion("What is the next assignment?", {
    student,
    notes: [{ categoryId: "next-time", text: "Begin with the chorus once." }],
  });
  expect(answer).toMatch(/Begin with the chorus once/);
  expect(answer).toMatch(/comfortable|publish/i);
});

test("reports waiting drafts from the studio view", () => {
  expect(answerPlanningQuestion("Any drafts?", { students: [student] })).toMatch(/Alex.*waiting/i);
});

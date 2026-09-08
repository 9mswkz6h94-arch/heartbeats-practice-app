function firstName(name = "your student") {
  return String(name).trim().split(/\s+/)[0] || "your student";
}

function noteFor(notes, categoryId) {
  return [...(notes || [])].reverse().find((note) => note.categoryId === categoryId)?.text;
}

export function buildStudioPlanningPrompts(students = []) {
  const withLessons = students.filter((student) => student.lesson || student.nextLesson);
  const withDrafts = students.filter((student) => student.memory?.draft?.id);
  return [
    withLessons.length
      ? `What should I remember before ${firstName(withLessons[0].name)} arrives?`
      : "What is a calm way to begin today?",
    withDrafts.length
      ? "Which assignment drafts still need my review?"
      : "Which students have an open thread?",
    "Help me make the next step smaller.",
  ];
}

export function answerPlanningQuestion(question, { students = [], student, notes = [] } = {}) {
  const cleanQuestion = String(question || "").trim();
  const lower = cleanQuestion.toLowerCase();

  if (student) {
    const name = firstName(student.name || student.shortName);
    const nextTime = noteFor(notes, "next-time");
    const studentVoice = noteFor(notes, "student-voice");
    const growth = noteFor(notes, "keep-exploring");
    const focus = noteFor(notes, "worked-on") || student.memory?.activeWorkTitle;

    if (/assign|practice|next step|next time|start|smaller/.test(lower)) {
      return nextTime
        ? `For ${name}, start with: “${nextTime}” Keep it to one comfortable first step, then add more only if the lesson supports it.`
        : `For ${name}, make the next assignment one small, observable musical action. Add a “start here next time” note before you publish anything.`;
    }
    if (/interest|choice|voice|want/.test(lower) && studentVoice) {
      return `${name} said: “${studentVoice}” Use that as the choice point, while keeping the current technique in service of music they care about.`;
    }
    if (/stuck|hard|strug|explor/.test(lower) && growth) {
      return `Keep this in the “still growing” frame: “${growth}” Try a smaller range, slower tempo, or shorter phrase before changing the goal.`;
    }
    return focus
      ? `The current thread for ${name} is “${focus}” — begin by noticing what still feels familiar, then choose one gentle next move from today’s notes.`
      : `Begin with a quick musical check-in for ${name}. Capture what they choose, what clicks, and one exact doorway for next time.`;
  }

  const drafts = students.filter((item) => item.memory?.draft?.id);
  if (/draft|assign/.test(lower)) {
    return drafts.length
      ? `${drafts.map((item) => firstName(item.name)).join(", ")} ${drafts.length === 1 ? "has" : "have"} a private draft waiting. Review each suggestion before publishing it.`
      : "No private assignment drafts are waiting. Let the next lesson notes create the next step instead of inventing work early.";
  }

  const nextStudent = students.find((item) => item.lesson || /today|tomorrow/i.test(item.nextLesson || "")) || students[0];
  if (nextStudent) {
    return `${firstName(nextStudent.name)}’s current thread is “${nextStudent.memory?.activeWorkTitle || "an open musical check-in"}.” Start there, notice what the student remembers, and keep the first request small.`;
  }

  return "There are no active student threads in this view yet. Start with the roster or schedule; the helper will use only the information already in this workspace.";
}

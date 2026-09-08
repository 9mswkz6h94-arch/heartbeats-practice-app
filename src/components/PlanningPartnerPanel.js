import React, { useMemo, useState } from "react";
import {
  answerPlanningQuestion,
  buildStudioPlanningPrompts,
} from "../lib/planningPartner";
import "./PlanningPartnerPanel.css";

export default function PlanningPartnerPanel({ students = [], student, notes = [], onClose }) {
  const prompts = useMemo(
    () => student
      ? [
          "What should we start with next time?",
          "Help me make the next assignment smaller.",
          "What student choice should I remember?",
        ]
      : buildStudioPlanningPrompts(students),
    [student, students],
  );
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);

  const ask = (event, suggestedQuestion) => {
    event?.preventDefault();
    const nextQuestion = suggestedQuestion || question.trim();
    if (!nextQuestion) return;
    setQuestion(nextQuestion);
    setAnswer(answerPlanningQuestion(nextQuestion, { students, student, notes }));
  };

  return (
    <section className="planning-partner-panel" aria-labelledby="planning-partner-title">
      <header>
        <div>
          <p>Local planning helper</p>
          <h3 id="planning-partner-title">Think through the next musical step</h3>
        </div>
        {onClose && <button type="button" onClick={onClose}>Close</button>}
      </header>
      <p className="planning-partner-privacy">
        Uses only the notes already visible in this workspace. Nothing is sent to an outside AI service, and nothing is published automatically.
      </p>
      <div className="planning-partner-prompts" aria-label="Suggested planning questions">
        {prompts.map((prompt) => (
          <button type="button" key={prompt} onClick={(event) => ask(event, prompt)}>{prompt}</button>
        ))}
      </div>
      <form onSubmit={ask}>
        <label htmlFor={student ? `planning-question-${student.id || "student"}` : "planning-question-studio"}>Your planning question</label>
        <div>
          <input
            id={student ? `planning-question-${student.id || "student"}` : "planning-question-studio"}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about pacing, an assignment, or where to begin…"
          />
          <button type="submit" disabled={!question.trim()}>Think it through</button>
        </div>
      </form>
      {answer && (
        <div className="planning-partner-answer" role="status" aria-live="polite">
          <span>Planning note</span>
          <p>{answer}</p>
        </div>
      )}
    </section>
  );
}

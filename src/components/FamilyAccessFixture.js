import React, { useState } from "react";
import "./FamilyAccessFixture.css";

// Fictional, in-memory design review only. No auth, parent PIN, or data access.
const SAMPLE_STUDENTS = [
  { id: "sam", name: "Sam", activity: "Play a favorite melody" },
  { id: "alex", name: "Alex", activity: "Try a comfortable rhythm" },
];

export default function FamilyAccessFixture() {
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState({});
  const student = SAMPLE_STUDENTS.find((item) => item.id === selected);
  return <main className="family-access-review">
    <p className="family-access-review-label">Design preview · sample family · nothing saved</p>
    {!selected && <section aria-labelledby="family-choose-title">
      <h1 id="family-choose-title">Welcome to your family space</h1>
      <p>Choose who’s here today.</p>
      <div className="family-access-choices">
        {SAMPLE_STUDENTS.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item.id)}><strong>{item.name}</strong><span>Open my practice</span></button>)}
        <button type="button" onClick={() => setSelected("parent")}><strong>Parent space</strong><span>Family information and settings</span></button>
      </div>
    </section>}
    {student && <section aria-labelledby="family-student-title">
      <button type="button" className="family-back" onClick={() => setSelected(null)}>← Choose another person</button>
      <p>Student practice</p><h1 id="family-student-title">{student.name}’s practice</h1>
      <article><h2>{student.activity}</h2><p>{completed[student.id] ? "Complete in this preview" : "Ready when you are"}</p><button type="button" disabled={Boolean(completed[student.id])} onClick={() => setCompleted((current) => ({ ...current, [student.id]: true }))}>Mark complete in preview</button></article>
    </section>}
    {selected === "parent" && <section aria-labelledby="family-parent-title"><button type="button" className="family-back" onClick={() => setSelected(null)}>← Choose another person</button><p>Parent space</p><h1 id="family-parent-title">Family settings</h1><p>This preview does not provide access to actual family information. The real parent area needs secure re-entry protection before it can be used from a shared screen.</p></section>}
  </main>;
}

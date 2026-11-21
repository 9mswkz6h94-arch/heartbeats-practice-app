import React from "react";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import StudentZooExperience from "./StudentZooExperience";
import BadgeShowcase from "./BadgeShowcase";
import "./Dashboard.css";
import "./StudentDashboard.css";

export default function StudentDashboard({ studentId, onLogout, studentName, onChoosePerson }) {
  return (
    <div className="dashboard rainbow-heart-student-review">
      <header className="dashboard-header">
        <div><p className="dashboard-context">Student workspace</p><h1>{studentName ? `${studentName}’s practice` : "Today’s practice"}</h1></div>
        <button type="button" onClick={onChoosePerson || onLogout} className="btn-logout">
          {onChoosePerson ? "Choose another person" : "Switch account"}
        </button>
      </header>

      <main className="student-dashboard-content">
        <StudentZooExperience studentId={studentId} />
        <StudentPracticeCards studentId={studentId} />
        <BadgeShowcase studentId={studentId} />
        <StudentRepertoire studentId={studentId} />
      </main>
    </div>
  );
}

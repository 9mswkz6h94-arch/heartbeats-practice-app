import React, { useState } from "react";
import "./TeacherDashboard.css";
import "./Dashboard.css";
import "./StudentDashboard.css";
import "./ParentDashboard.css";
import "./ScaffoldShellReview.css";
import "./TeacherLessonPrepDashboard.css";
import "./StudentPracticeCards.css";
import "./PracticeCardDetail.css";

const navItems = ["Studio", "New assignment", "Students"];

function ReviewState({ title, children, kind = "empty" }) {
  return <section className={`review-state review-state-${kind}`}><h2>{title}</h2><p>{children}</p></section>;
}

function LessonPrepFixture() {
  const students = [
    { name: "Alexandria Montgomery-Rivera", state: "attention", label: "Needs a nudge", streak: 0, week: 1, songs: 2 },
    { name: "Sam Lee", state: "streak", label: "On a roll", streak: 5, week: 4, songs: 7 },
  ];
  return <div className="lesson-prep-container"><section className="pulse" aria-label="Studio at a glance">{[["01","12","sessions this week"],["02","1","needs a nudge"],["03","1","on a roll"],["04","8","students"]].map(([index,value,label])=><div className={`pulse-tile ${index === "02" ? "warm" : ""}`} key={index}><div className="pulse-top"><span className="pulse-index">{index}</span></div><span className="pulse-num">{value}</span><span className="pulse-lab">{label}</span></div>)}</section><div className="prep-content"><section className="students-list"><h2 className="list-title">Studio · today</h2><div className="student-cards">{students.map((student,index)=><button type="button" className={`triage-card status-${student.state} ${index===0?"selected":""}`} key={student.name}><span className="triage-top"><span className="triage-name">{student.name}</span><span className={`triage-pill ${student.state}`}>{student.label}</span></span><span className="triage-meta"><span className="tm"><span className="tm-num">{student.streak}</span><span className="tm-lab">day streak</span></span><span className="tm"><span className="tm-num">{student.week}</span><span className="tm-lab">this week</span></span><span className="tm"><span className="tm-num">{student.songs}</span><span className="tm-lab">songs</span></span></span></button>)}</div></section><section className="student-detail"><div className="detail-head"><h3>Alexandria Montgomery-Rivera</h3><button className="btn-preview-parent">Preview parent view</button><button className="detail-close">Close</button></div><div className="detail-stats">{[["Sessions this week","1"],["Current streak","0 days"],["Songs memorized","2"],["Total completions","38"]].map(([label,value])=><div className="detail-stat" key={label}><span className="detail-stat-label">{label}</span><span className="detail-value">{value}</span></div>)}</div><div className="assignments-section"><h4>Assignments</h4><div className="assignment-item"><div className="assignment-header"><span className="assignment-title">Chromatic warmup across the entire comfortable range</span><span className="assignment-type">Guitar</span></div><div className="assignment-meta"><span>4 steps</span><span>8/16/2026</span></div><button className="btn-reassign">Reset now</button></div></div></section></div></div>;
}

function StudentPracticeFixture() {
  const [selectedCard, setSelectedCard] = useState(null);
  const cards = [
    {
      id: "warmup",
      assignment: "Chromatic warmup across the entire comfortable range",
      instrument: "Guitar",
      title: "Slow and even with relaxed shoulders",
      step: 1,
      description: "Play the pattern slowly from the sixth string to the first string. Pause if your hands feel tight. The goal today is an even sound, not speed.",
    },
    {
      id: "song",
      assignment: "You Are My Sunshine — verse and chorus",
      instrument: "Voice",
      title: "Sing the chorus with clear breaths between phrases",
      step: 2,
      description: "Sing the chorus twice. Mark one comfortable breath before each long phrase, then try it once more with the recording.",
    },
  ];

  return <div className="practice-container">
    <div className="practice-header"><div className="header-top"><div className="streak-badge"><span className="streak-label">Current streak</span><span className="streak-count">5 days</span></div><div className="counter"><span className="remaining">2</span><span className="remaining-label">of 4 remaining today</span></div></div></div>
    <div className="practice-grid">{cards.map((card) => <button type="button" className="practice-card-tile" key={card.id} onClick={() => setSelectedCard(card)}><span className="tile-header"><span className="tile-assignment-title">{card.assignment}</span><span className="instrument-tag">{card.instrument}</span></span><span className="tile-body"><span className="step-title">{card.title}</span><span className="step-number">Step {card.step}</span></span><span className="tile-action"><span className="tap-hint">Open practice card</span></span></button>)}</div>
    {selectedCard && <div className="detail-modal-overlay" onClick={() => setSelectedCard(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="review-practice-detail-title" onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setSelectedCard(null)}>Close</button><div className="preview-banner" role="status">Sandbox preview — nothing here is saved</div><div className="detail-header"><div className="detail-assignment"><h2 id="review-practice-detail-title">{selectedCard.assignment}</h2><span className="detail-instrument">{selectedCard.instrument}</span></div><div className="detail-step-number">Step {selectedCard.step}</div></div><div className="detail-body"><h3 className="detail-step-title">{selectedCard.title}</h3><p className="detail-step-description">{selectedCard.description}</p></div><div className="detail-actions"><button type="button" className="btn-complete">I practiced this</button><button type="button" className="btn-skip">Skip for today</button></div></div></div>}
  </div>;
}

export default function ScaffoldShellReview({ screen }) {
  if (screen === "teacher") {
    return <div className="hud"><aside className="hud-sidebar"><div className="hud-brand"><span className="hud-brand-mark">HB</span><span><span className="hud-brand-text">Heart Beats</span><span className="hud-brand-context">Teacher workspace</span></span></div><nav className="hud-nav" aria-label="Teacher workspace">{navItems.map((label, index) => <button key={label} className={`hud-nav-item ${index === 0 ? "active" : ""}`} aria-current={index === 0 ? "page" : undefined}><span className="hud-nav-index">0{index + 1}</span><span className="hud-nav-label">{label}</span></button>)}</nav><div className="hud-side-foot"><div className="hud-user"><span className="hud-user-email">teacher.review@example.com</span></div><button className="hud-logout">Log out</button></div></aside><div className="hud-main"><header className="hud-topbar"><div><p className="hud-view-context">Teacher workspace</p><h1 className="hud-view-title">Studio · today</h1></div></header><main className="hud-content"><LessonPrepFixture /></main></div></div>;
  }

  if (screen === "parent") {
    return <div className="parent-dashboard"><header className="parent-dashboard-header"><div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div><button className="btn-logout">Log out</button></header><main><ReviewState title="No students linked yet">Ask your teacher to link a student to this account, then reload this page.</ReviewState></main></div>;
  }

  return <div className="dashboard"><header className="dashboard-header"><div><p className="dashboard-context">Student workspace</p><h1>Today’s practice</h1></div><button className="btn-logout">Log out</button></header><main className="student-dashboard-content"><StudentPracticeFixture /></main></div>;
}

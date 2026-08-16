import React from "react";
import "./TeacherDashboard.css";
import "./Dashboard.css";
import "./StudentDashboard.css";
import "./ParentDashboard.css";
import "./ScaffoldShellReview.css";
import "./TeacherLessonPrepDashboard.css";

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

export default function ScaffoldShellReview({ screen }) {
  if (screen === "teacher") {
    return <div className="hud"><aside className="hud-sidebar"><div className="hud-brand"><span className="hud-brand-mark">HB</span><span><span className="hud-brand-text">Heart Beats</span><span className="hud-brand-context">Teacher workspace</span></span></div><nav className="hud-nav" aria-label="Teacher workspace">{navItems.map((label, index) => <button key={label} className={`hud-nav-item ${index === 0 ? "active" : ""}`} aria-current={index === 0 ? "page" : undefined}><span className="hud-nav-index">0{index + 1}</span><span className="hud-nav-label">{label}</span></button>)}</nav><div className="hud-side-foot"><div className="hud-user"><span className="hud-user-email">teacher.review@example.com</span></div><button className="hud-logout">Log out</button></div></aside><div className="hud-main"><header className="hud-topbar"><div><p className="hud-view-context">Teacher workspace</p><h1 className="hud-view-title">Studio · today</h1></div></header><main className="hud-content"><LessonPrepFixture /></main></div></div>;
  }

  if (screen === "parent") {
    return <div className="parent-dashboard"><header className="parent-dashboard-header"><div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div><button className="btn-logout">Log out</button></header><main><ReviewState title="No students linked yet">Ask your teacher to link a student to this account, then reload this page.</ReviewState></main></div>;
  }

  return <div className="dashboard"><header className="dashboard-header"><div><p className="dashboard-context">Student workspace</p><h1>Today’s practice</h1></div><button className="btn-logout">Log out</button></header><main className="student-dashboard-content"><ReviewState title="Practice is loading" kind="loading">We’re preparing today’s cards. This review screen does not connect to student data.</ReviewState></main></div>;
}

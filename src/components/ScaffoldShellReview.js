import React from "react";
import "./TeacherDashboard.css";
import "./Dashboard.css";
import "./StudentDashboard.css";
import "./ParentDashboard.css";
import "./ScaffoldShellReview.css";

const navItems = ["Studio", "New assignment", "Students"];

function ReviewState({ title, children, kind = "empty" }) {
  return <section className={`review-state review-state-${kind}`}><h2>{title}</h2><p>{children}</p></section>;
}

export default function ScaffoldShellReview({ screen }) {
  if (screen === "teacher") {
    return <div className="hud"><aside className="hud-sidebar"><div className="hud-brand"><span className="hud-brand-mark">HB</span><span><span className="hud-brand-text">Heart Beats</span><span className="hud-brand-context">Teacher workspace</span></span></div><nav className="hud-nav" aria-label="Teacher workspace">{navItems.map((label, index) => <button key={label} className={`hud-nav-item ${index === 0 ? "active" : ""}`} aria-current={index === 0 ? "page" : undefined}><span className="hud-nav-index">0{index + 1}</span><span className="hud-nav-label">{label}</span></button>)}</nav><div className="hud-side-foot"><div className="hud-user"><span className="hud-user-email">teacher.review@example.com</span></div><button className="hud-logout">Log out</button></div></aside><div className="hud-main"><header className="hud-topbar"><div><p className="hud-view-context">Teacher workspace</p><h1 className="hud-view-title">Studio · today</h1></div></header><main className="hud-content"><ReviewState title="No lesson activity yet">Student lesson summaries will appear here when sandbox fixtures are added.</ReviewState></main></div></div>;
  }

  if (screen === "parent") {
    return <div className="parent-dashboard"><header className="parent-dashboard-header"><div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div><button className="btn-logout">Log out</button></header><main><ReviewState title="No students linked yet">Ask your teacher to link a student to this account, then reload this page.</ReviewState></main></div>;
  }

  return <div className="dashboard"><header className="dashboard-header"><div><p className="dashboard-context">Student workspace</p><h1>Today’s practice</h1></div><button className="btn-logout">Log out</button></header><main className="student-dashboard-content"><ReviewState title="Practice is loading" kind="loading">We’re preparing today’s cards. This review screen does not connect to student data.</ReviewState></main></div>;
}

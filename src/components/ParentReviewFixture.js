import React, { useState } from "react";
import "./ParentDashboard.css";
import "./NotificationSettings.css";
import "./CommLog.css";
import "./RescheduleRequests.css";

const REVIEW_KIDS = [
  { id: "alex", name: "Alexandria Montgomery-Rivera", shortName: "Alexandria", avatar: "🎸", instrument: "Guitar", day: "Tuesday", time: "4:30 PM", sessions: 4, streak: 5, songs: 7 },
  { id: "sam", name: "Sam Lee", shortName: "Sam", avatar: "🎹", instrument: "Piano", day: "Sunday", time: "5:15 PM", sessions: 2, streak: 2, songs: 3 },
];

export default function ParentReviewFixture() {
  const [selectedId, setSelectedId] = useState(REVIEW_KIDS[0].id);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [request, setRequest] = useState("Requested 8/25/2026 at 5:30 PM — school orientation runs late that afternoon");
  const [phone, setPhone] = useState("(512) 555-0147");
  const [notifySms, setNotifySms] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, mine: false, author: "Teacher", body: "Alexandria made a great connection between the warmup and the song today. Keeping the tempo comfortable is the goal this week." },
    { id: 2, mine: true, author: "Parent", body: "Thank you! We’ll keep the metronome slow and let you know how Tuesday goes." },
  ]);
  const [status, setStatus] = useState(null);
  const kid = REVIEW_KIDS.find((item) => item.id === selectedId) || REVIEW_KIDS[0];

  const switchKid = (kidId) => {
    setSelectedId(kidId);
    setRescheduleOpen(false);
    setStatus(null);
  };

  const submitReschedule = (event) => {
    event.preventDefault();
    setRequest("New schedule request saved in this local review");
    setRescheduleOpen(false);
    setStatus("The request is ready for teacher review. No real message was sent.");
  };

  const submitMessage = (event) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: Date.now(), mine: true, author: "Parent", body: clean }]);
    setMessage("");
    setStatus("Message added to the local review conversation.");
  };

  return (
    <div className="parent-dashboard">
      <header className="parent-dashboard-header">
        <div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div>
        <button type="button" className="btn-logout" disabled>Review mode</button>
      </header>
      <main className="parent-dashboard-main">
        <section className="parent-family-code">
          <div><p className="parent-code-label">Family code for kid login</p><p className="parent-code-value">RH-4827</p></div>
          <p className="parent-code-hint">On your kid’s device: open the app, choose Student, enter this code, then select their name and enter their PIN.</p>
        </section>

        <nav className="kid-switcher" aria-label="Choose a student">
          {REVIEW_KIDS.map((item) => (
            <button type="button" className={`kid-tab${selectedId === item.id ? " active" : ""}`} aria-pressed={selectedId === item.id} onClick={() => switchKid(item.id)} key={item.id}>
              <span className="kid-tab-avatar">{item.avatar}</span>{item.shortName}
            </button>
          ))}
        </nav>

        <section className="kid-panel" key={kid.id}>
          <div className="kid-panel-header"><span className="parent-kid-avatar">{kid.avatar}</span><div className="parent-kid-info"><span className="parent-kid-name">{kid.name}</span><span className="parent-kid-instrument">{kid.instrument}</span></div><span className="parent-kid-status active">Approved</span></div>
          <button type="button" className="btn-reset-pin" onClick={() => setStatus(`PIN reset review opened for ${kid.shortName}. No login credential changed.`)}>Reset PIN</button>
          {status && <p className="parent-review-status" role="status">{status}</p>}

          <div className="lesson-info-row" id="parent-calendar-review">
            <span>Lessons every <strong>{kid.day}</strong> at <strong>{kid.time}</strong> — Rainbow Heart Studio</span>
            <a className="btn-add-calendar" href="#parent-calendar-review" onClick={() => setStatus("Calendar link preview opened. No outside calendar was changed.")}>Add to calendar</a>
            <button type="button" className="btn-request-reschedule" aria-expanded={rescheduleOpen} onClick={() => setRescheduleOpen((current) => !current)}>Request a different time</button>
          </div>

          {rescheduleOpen && <form className="reschedule-editor" onSubmit={submitReschedule}><label htmlFor={`review-parent-date-${kid.id}`}>New date</label><input id={`review-parent-date-${kid.id}`} type="date" defaultValue="2026-09-15"/><label htmlFor={`review-parent-time-${kid.id}`}>New time</label><input id={`review-parent-time-${kid.id}`} type="time" defaultValue="17:30"/><label htmlFor={`review-parent-reason-${kid.id}`}>Reason (optional)</label><input id={`review-parent-reason-${kid.id}`} defaultValue="School orientation runs late that afternoon"/><div className="reschedule-editor-actions"><button type="submit" className="btn-pin-save">Save review request</button><button type="button" className="btn-pin-cancel" onClick={() => setRescheduleOpen(false)}>Cancel</button></div></form>}

          {request && <div className="reschedule-pending-row"><span>{request}</span><span className="reschedule-status">Waiting for teacher</span><button type="button" className="btn-pin-cancel" onClick={() => { setRequest(null); setStatus("The local review request was cancelled."); }}>Cancel request</button></div>}

          <div className="week-stats">
            {[[kid.sessions,"sessions this week"],[kid.streak,"day rhythm"],[kid.songs,"songs memorized"]].map(([value,label]) => <div className="week-stat" key={label}><span className="week-stat-value">{value}</span><span className="week-stat-label">{label}</span></div>)}
          </div>

          <h3 className="kid-section-title">This week’s practice</h3>
          <div className="parent-assignment"><div className="parent-assignment-head"><span className="parent-assignment-title">Chromatic warmup across the entire comfortable range</span><span className="parent-category-chip">Technique</span></div><div className="parent-step"><span className="parent-step-mark">Done</span><span className="parent-step-title">Slow and even with relaxed shoulders</span></div><div className="parent-step"><span className="parent-step-mark">Open</span><span className="parent-step-title">Increase the metronome only when every note sounds clear</span></div></div>

          <form className="notif-settings" onSubmit={(event) => { event.preventDefault(); setStatus("Notification preference saved in this local review."); }}><h4 className="notif-settings-title">Text notifications</h4><label className="notif-settings-toggle"><input type="checkbox" checked={notifySms} onChange={(event) => setNotifySms(event.target.checked)}/>Text me when the teacher sends a flagged message</label><input className="notif-settings-phone" aria-label="Parent phone number" value={phone} onChange={(event) => setPhone(event.target.value)}/><div className="notif-settings-actions"><button type="submit" className="btn-notif-save">Save</button></div></form>

          <div className="comm-log"><h3 className="comm-log-title">Chat with your teacher</h3><div className="comm-log-list">{messages.map((item) => <div className={`comm-msg ${item.mine ? "mine" : "theirs"}`} key={item.id}><div className="comm-msg-meta"><span className="comm-msg-author">{item.author}</span><span className="comm-msg-time">Just now</span></div><div className="comm-msg-body">{item.body}</div></div>)}</div><form className="comm-log-compose" onSubmit={submitMessage}><textarea aria-label="Message to teacher" placeholder="Write a message…" value={message} onChange={(event) => setMessage(event.target.value)}/><div className="comm-log-actions"><button type="submit" className="btn-comm-send" disabled={!message.trim()}>Add review message</button></div></form></div>
        </section>
      </main>
    </div>
  );
}

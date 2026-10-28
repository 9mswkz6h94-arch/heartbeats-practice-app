import React, { useCallback, useEffect, useState } from "react";
import { attendanceApi, attendanceLabels, billingLabels } from "../lib/lessonAttendance";
import "./LessonAttendance.css";

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function LessonAttendance({ teacherId, students, demo = false }) {
  const [date, setDate] = useState(localDate);
  const [month, setMonth] = useState(() => localDate().slice(0, 7));
  const [studentId, setStudentId] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("missed");
  const [billing, setBilling] = useState("undecided");
  const [note, setNote] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(!demo);
  const load = useCallback(async () => {
    if (demo) return;
    setLoading(true); setError("");
    try { setRecords(await attendanceApi.list(teacherId, month)); }
    catch { setRecords([]); setError("Lesson records could not load. The attendance database setup may not be available yet; try again later."); }
    finally { setLoading(false); }
  }, [teacherId, month, demo]);
  useEffect(() => { load(); }, [load]);

  async function save(event) {
    event.preventDefault();
    if (!studentId || !date || !time) { setError("Choose a student and enter the original lesson date and time."); return; }
    setBusy(true); setError(""); setNotice("");
    const record = { student_id: studentId, lesson_date: date, lesson_time: time, status, billing_status: billing, note: note.trim(), rescheduled_date: status === "rescheduled" ? newDate || null : null, rescheduled_time: status === "rescheduled" ? newTime || null : null };
    try {
      if (demo) setRecords((previous) => [...previous.filter((r) => !(r.student_id === studentId && r.lesson_date === date && r.lesson_time === time)), { ...record, id: `review-${Date.now()}` }]);
      else await attendanceApi.save(teacherId, record);
      setMonth(date.slice(0, 7)); setNote(""); setEditing(false); setNotice(demo ? "Saved in this review only." : "Lesson note saved.");
      if (!demo && month === date.slice(0, 7)) await load();
    } catch { setError("Could not save the lesson note. Your entries are still here; try again."); }
    finally { setBusy(false); }
  }
  function edit(record) {
    setStudentId(record.student_id); setDate(record.lesson_date); setTime(record.lesson_time.slice(0, 5));
    setStatus(record.status); setBilling(record.billing_status); setNote(record.note || "");
    setNewDate(record.rescheduled_date || ""); setNewTime(record.rescheduled_time?.slice(0, 5) || "");
    setEditing(true); setNotice("Edit the fields above, then save the lesson note."); setError("");
  }
  function printReport() {
    document.body.classList.add("attendance-print");
    try { window.print(); } finally { document.body.classList.remove("attendance-print"); }
  }
  const visible = records.filter((record) => record.lesson_date.startsWith(month));
  return <section className="attendance" aria-labelledby="attendance-title">
    <header><div><p>Studio notes</p><h2 id="attendance-title">Lesson changes & billing review</h2><span>Record what happened, then review each month before billing.</span></div></header>
    <form onSubmit={save} className="attendance-form">
      <label>Student<select required disabled={editing} value={studentId} onChange={(e) => { const id = e.target.value; setStudentId(id); setTime(students.find((s) => s.id === id)?.lesson?.start_time?.slice(0, 5) || ""); }}><option value="">Choose a student</option>{students.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label>Original lesson date<input type="date" required readOnly={editing} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <label>Original lesson time<input type="time" required readOnly={editing} value={time} onChange={(e) => setTime(e.target.value)} /></label>
      <label>What happened<select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(attendanceLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
      <label>Billing decision<select value={billing} onChange={(e) => setBilling(e.target.value)}>{Object.entries(billingLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
      {status === "rescheduled" && <><label>New date (optional)<input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} /></label><label>New time (optional)<input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} /></label></>}
      <label className="attendance-note">Note (optional)<textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <div className="attendance-submit"><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save lesson note"}</button>{editing && <button type="button" onClick={() => { setEditing(false); setStudentId(""); setTime(""); setNote(""); }}>Cancel edit</button>}<small>Saving the same student, date, and time updates that lesson’s note. Reschedule notes do not change the calendar.</small></div>
    </form>
    {error && <p className="attendance-message" role="alert">{error}</p>}{notice && <p className="attendance-message" role="status">{notice}</p>}
    <section className="attendance-report" aria-labelledby="attendance-report-title"><div className="attendance-report-heading"><div><h3 id="attendance-report-title">Monthly billing review</h3><p>Review the notes and billing choices before sending any invoice.</p></div><label>Month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label><button type="button" onClick={printReport}>Print report</button></div>
      {loading ? <p role="status">Loading lesson notes…</p> : visible.length === 0 ? <p>No lesson changes recorded for this month.</p> : <><p>{visible.length} recorded · {visible.filter((r) => r.billing_status === "undecided").length} need a billing decision</p><div className="attendance-list">{visible.map((r) => <article key={r.id}><strong>{students.find((s) => s.id === r.student_id)?.name || "Student"}</strong><span>{r.lesson_date} · {r.lesson_time.slice(0, 5)} · {attendanceLabels[r.status]}</span><b>{billingLabels[r.billing_status]}</b>{r.rescheduled_date && <span>New date: {r.rescheduled_date}{r.rescheduled_time ? ` ${r.rescheduled_time.slice(0, 5)}` : ""}</span>}{r.note && <p>{r.note}</p>}<button type="button" onClick={() => edit(r)}>Edit lesson note</button></article>)}</div></>}
    </section>
  </section>;
}


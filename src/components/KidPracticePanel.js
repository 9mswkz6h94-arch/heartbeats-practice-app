import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { randomPin } from "../lib/familyAuth";
import { fetchStudentStats, dayStr } from "../lib/studentStats";
import { buildGoogleCalendarUrl, dayName } from "../lib/calendarLink";
import BadgeShowcase from "./BadgeShowcase";
import CommLog from "./CommLog";
import "./ParentDashboard.css";

const RESCHED_STATUS_LABEL = {
  pending: "⏳ Waiting for teacher",
  approved: "✅ Confirmed",
  declined: "❌ Declined",
  cancelled: "Cancelled",
};

const CATEGORY_COLORS = {
  Warmup: "var(--red, #FF6B6B)",
  Technique: "var(--yellow, #FECA57)",
  Theory: "var(--teal, #1DD1A1)",
  Pieces: "var(--blue, #54A0FF)",
  Performance: "var(--purple, #A29BFE)",
};

// The kid-level practice view: stats, lesson + calendar link, reschedule
// status, assignments, badges, repertoire. Used two ways:
//   mode="parent"          — full interactive view (PIN reset, request
//                             reschedule, chat) on the parent dashboard.
//   mode="teacher-preview" — same data, read-only, no PIN/reschedule
//                             controls, no duplicate chat — used by the
//                             teacher's "Preview as Parent" button so
//                             Jonathan can see exactly what a parent sees.
export default function KidPracticePanel({ kid, mode = "parent" }) {
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedDraft, setReschedDraft] = useState({ proposed_date: "", proposed_time: "16:00", reason: "" });
  const [reschedBusy, setReschedBusy] = useState(false);
  const [reschedMsg, setReschedMsg] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!kid) return;
    setDetailLoading(true);
    try {
      const stats = await fetchStudentStats(kid.id);

      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, title, category, description, created_at, practice_steps(id, title, sequence_order)")
        .eq("student_id", kid.id)
        .order("created_at", { ascending: false });

      const { data: todayRows } = await supabase
        .from("daily_practice_status")
        .select("practice_step_id, status")
        .eq("student_id", kid.id)
        .eq("date", dayStr(new Date()));
      const todayStatus = {};
      (todayRows || []).forEach((r) => { todayStatus[r.practice_step_id] = r.status; });

      const { data: repertoire } = await supabase
        .from("repertoire")
        .select("id, memorized_at, assignments(title)")
        .eq("student_id", kid.id)
        .order("memorized_at", { ascending: false });

      const { data: lesson } = await supabase
        .from("lessons")
        .select("day_of_week, start_time, duration_minutes, location")
        .eq("student_id", kid.id)
        .maybeSingle();

      const { data: reschedules } = await supabase
        .from("reschedule_requests")
        .select("id, proposed_date, proposed_time, reason, status, teacher_note, created_at")
        .eq("student_id", kid.id)
        .order("created_at", { ascending: false });

      setDetail({
        stats,
        assignments: assignments || [],
        todayStatus,
        repertoire: repertoire || [],
        lesson: lesson || null,
        reschedules: reschedules || [],
      });
    } catch (err) {
      console.error("Kid detail fetch failed:", err);
    } finally {
      setDetailLoading(false);
    }
  }, [kid]);

  useEffect(() => {
    setDetail(null);
    fetchDetail();
  }, [fetchDetail]);

  const startPinReset = () => {
    setResetting(true);
    setResetPin(randomPin());
    setResetMsg(null);
  };

  const submitPinReset = async () => {
    if (!/^\d{4}$/.test(resetPin)) {
      setResetMsg({ ok: false, text: "PIN must be exactly 4 digits" });
      return;
    }
    setResetBusy(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("reset-kid-pin", {
        body: { student_id: kid.id, new_pin: resetPin },
      });
      if (fnError) throw new Error(fnError.message || "Reset failed");
      if (data?.error) throw new Error(data.error);
      setResetMsg({ ok: true, text: `Done! ${kid.name} now logs in with PIN ${resetPin}` });
      setResetting(false);
    } catch (err) {
      setResetMsg({ ok: false, text: err.message || "Reset failed — try again" });
    } finally {
      setResetBusy(false);
    }
  };

  const openReschedule = () => {
    setReschedDraft({ proposed_date: "", proposed_time: "16:00", reason: "" });
    setReschedMsg(null);
    setReschedOpen(true);
  };

  const submitReschedule = async () => {
    if (!reschedDraft.proposed_date) {
      setReschedMsg({ ok: false, text: "Pick a proposed date" });
      return;
    }
    setReschedBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("reschedule_requests").insert([
        {
          student_id: kid.id,
          requested_by: userData.user.id,
          proposed_date: reschedDraft.proposed_date,
          proposed_time: reschedDraft.proposed_time,
          reason: reschedDraft.reason.trim() || null,
        },
      ]);
      if (insertError) throw insertError;
      setReschedOpen(false);
      setReschedMsg({ ok: true, text: "Request sent — your teacher will confirm soon." });
      fetchDetail();
    } catch (err) {
      setReschedMsg({ ok: false, text: err.message || "Could not send request" });
    } finally {
      setReschedBusy(false);
    }
  };

  const cancelReschedule = async (requestId) => {
    await supabase.from("reschedule_requests").update({ status: "cancelled" }).eq("id", requestId);
    fetchDetail();
  };

  if (!kid) return null;
  const interactive = mode === "parent";

  return (
    <section className="kid-panel">
      <div className="kid-panel-header">
        <span className="parent-kid-avatar">{kid.avatar || "🎵"}</span>
        <div className="parent-kid-info">
          <span className="parent-kid-name">{kid.name}</span>
          <span className="parent-kid-instrument">{kid.instrument || "—"}</span>
        </div>
        <span className={`parent-kid-status ${kid.status === "active" ? "active" : "pending"}`}>
          {kid.status === "active" ? "✓ Approved" : "Waiting for teacher approval"}
        </span>
      </div>

      {interactive && kid.family_id && !resetting && (
        <button type="button" className="btn-reset-pin" onClick={startPinReset}>
          🔑 Reset PIN
        </button>
      )}
      {interactive && resetting && (
        <div className="pin-reset-editor">
          <label htmlFor={`pin-${kid.id}`}>New 4-digit PIN</label>
          <div className="pin-reset-controls">
            <input
              id={`pin-${kid.id}`}
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={resetPin}
              onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ""))}
              disabled={resetBusy}
            />
            <button type="button" className="btn-pin-save" onClick={submitPinReset} disabled={resetBusy}>
              {resetBusy ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn-pin-cancel" onClick={() => { setResetting(false); setResetMsg(null); }} disabled={resetBusy}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {interactive && resetMsg && <p className={`pin-reset-msg ${resetMsg.ok ? "ok" : "err"}`}>{resetMsg.text}</p>}

      {detailLoading && !detail && <p className="parent-loading">Loading practice info...</p>}

      {detail && (
        <>
          {detail.lesson && (
            <div className="lesson-info-row">
              <span>
                📅 Lessons every <strong>{dayName(detail.lesson.day_of_week)}</strong> at{" "}
                <strong>{detail.lesson.start_time.slice(0, 5)}</strong>
                {detail.lesson.location ? ` — ${detail.lesson.location}` : ""}
              </span>
              <a
                className="btn-add-calendar"
                href={buildGoogleCalendarUrl({
                  studentName: kid.name,
                  dayOfWeek: detail.lesson.day_of_week,
                  startTime: detail.lesson.start_time.slice(0, 5),
                  durationMinutes: detail.lesson.duration_minutes,
                  location: detail.lesson.location,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                📆 Add to Google Calendar
              </a>
              {interactive && !reschedOpen && (
                <button type="button" className="btn-request-reschedule" onClick={openReschedule}>
                  🔁 Request a different time
                </button>
              )}
            </div>
          )}

          {interactive && reschedOpen && (
            <div className="reschedule-editor">
              <label>New date</label>
              <input
                type="date"
                value={reschedDraft.proposed_date}
                onChange={(e) => setReschedDraft({ ...reschedDraft, proposed_date: e.target.value })}
                disabled={reschedBusy}
              />
              <label>New time</label>
              <input
                type="time"
                value={reschedDraft.proposed_time}
                onChange={(e) => setReschedDraft({ ...reschedDraft, proposed_time: e.target.value })}
                disabled={reschedBusy}
              />
              <label>Reason (optional)</label>
              <input
                type="text"
                placeholder="e.g., dentist appointment"
                value={reschedDraft.reason}
                onChange={(e) => setReschedDraft({ ...reschedDraft, reason: e.target.value })}
                disabled={reschedBusy}
              />
              <div className="reschedule-editor-actions">
                <button type="button" className="btn-pin-save" disabled={reschedBusy} onClick={submitReschedule}>
                  {reschedBusy ? "Sending..." : "Send Request"}
                </button>
                <button type="button" className="btn-pin-cancel" disabled={reschedBusy} onClick={() => setReschedOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {interactive && reschedMsg && <p className={`pin-reset-msg ${reschedMsg.ok ? "ok" : "err"}`}>{reschedMsg.text}</p>}
          {detail.reschedules?.filter((r) => r.status === "pending").map((r) => (
            <div key={r.id} className="reschedule-pending-row">
              <span>
                Requested {new Date(`${r.proposed_date}T00:00`).toLocaleDateString()} at {r.proposed_time.slice(0, 5)}
                {r.reason ? ` — ${r.reason}` : ""}
              </span>
              <span className="reschedule-status">{RESCHED_STATUS_LABEL[r.status]}</span>
              {interactive && (
                <button type="button" className="btn-pin-cancel" onClick={() => cancelReschedule(r.id)}>
                  Cancel request
                </button>
              )}
            </div>
          ))}

          <div className="week-stats">
            <div className="week-stat">
              <span className="week-stat-value">{detail.stats.thisWeek}</span>
              <span className="week-stat-label">sessions this week</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-value">{detail.stats.streak > 0 ? `🔥 ${detail.stats.streak}` : "—"}</span>
              <span className="week-stat-label">day streak</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-value">{detail.stats.songsMemorized}</span>
              <span className="week-stat-label">songs memorized</span>
            </div>
          </div>

          <h3 className="kid-section-title">This Week's Practice</h3>
          {detail.assignments.length === 0 && (
            <p className="parent-muted">No assignments yet — they'll appear here after the next lesson.</p>
          )}
          {detail.assignments.map((a) => (
            <div key={a.id} className="parent-assignment">
              <div className="parent-assignment-head">
                <span className="parent-assignment-title">{a.title}</span>
                {a.category && (
                  <span className="parent-category-chip" style={{ background: CATEGORY_COLORS[a.category] || "var(--border)" }}>
                    {a.category}
                  </span>
                )}
              </div>
              {(a.practice_steps || [])
                .slice()
                .sort((x, y) => (x.sequence_order ?? 0) - (y.sequence_order ?? 0))
                .map((step) => (
                  <div key={step.id} className="parent-step">
                    <span className="parent-step-mark">
                      {detail.todayStatus[step.id] === "completed" ? "✅" : "⬜"}
                    </span>
                    <span className="parent-step-title">{step.title}</span>
                  </div>
                ))}
            </div>
          ))}

          <h3 className="kid-section-title">Badges</h3>
          <BadgeShowcase studentId={kid.id} />

          <h3 className="kid-section-title">Songs Memorized</h3>
          {detail.repertoire.length === 0 && (
            <p className="parent-muted">The repertoire list grows as songs get memorized. 🎵</p>
          )}
          {detail.repertoire.map((r) => (
            <div key={r.id} className="parent-repertoire-row">
              <span>🎵 {r.assignments?.title || "Song"}</span>
              <span className="parent-repertoire-date">
                {r.memorized_at ? new Date(r.memorized_at).toLocaleDateString() : ""}
              </span>
            </div>
          ))}

          {interactive && <CommLog studentId={kid.id} role="parent" />}
        </>
      )}
    </section>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { randomPin } from "../lib/familyAuth";
import { fetchStudentStats, dayStr } from "../lib/studentStats";
import BadgeShowcase from "./BadgeShowcase";
import CommLog from "./CommLog";
import "./ParentDashboard.css";

// Read-only parent view: per-kid weekly practice summary, current
// assignments (with today's step status), badges, and repertoire —
// plus the family code and per-kid PIN reset. Parents can look at
// everything and change nothing about the practice data itself.
export default function ParentDashboard({ userId, userEmail, onLogout }) {
  const [kids, setKids] = useState([]);
  const [family, setFamily] = useState(null);
  const [selectedKidId, setSelectedKidId] = useState(null);
  const [kidData, setKidData] = useState({}); // kidId -> { stats, assignments, todayStatus, repertoire }
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  // PIN reset
  const [resetKidId, setResetKidId] = useState(null);
  const [resetPin, setResetPin] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);

  const fetchFamily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Back-fill the auth link on older rows matched by email only.
      await supabase
        .from("parent_students")
        .update({ parent_auth_user_id: userId })
        .eq("parent_email", (userEmail || "").toLowerCase())
        .is("parent_auth_user_id", null);

      const { data: links, error: linkError } = await supabase
        .from("parent_students")
        .select("student_id")
        .or(`parent_auth_user_id.eq.${userId},parent_email.eq.${(userEmail || "").toLowerCase()}`);
      if (linkError) throw linkError;

      const ids = (links || []).map((l) => l.student_id);
      if (ids.length === 0) {
        setKids([]);
      } else {
        const { data: students, error: studentError } = await supabase
          .from("students")
          .select("id, name, avatar, instrument, status, family_id")
          .in("id", ids)
          .order("created_at");
        if (studentError) throw studentError;
        setKids(students || []);
        if (students?.length) setSelectedKidId((cur) => cur || students[0].id);

        const familyId = students?.find((s) => s.family_id)?.family_id;
        if (familyId) {
          const { data: fam } = await supabase
            .from("families")
            .select("id, code")
            .eq("id", familyId)
            .single();
          setFamily(fam || null);
        }
      }
    } catch (err) {
      setError(err.message || "Could not load your family");
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const fetchKidDetail = useCallback(async (kidId) => {
    setDetailLoading(true);
    try {
      const stats = await fetchStudentStats(kidId);

      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, title, category, description, created_at, practice_steps(id, title, sequence_order)")
        .eq("student_id", kidId)
        .order("created_at", { ascending: false });

      const { data: todayRows } = await supabase
        .from("daily_practice_status")
        .select("practice_step_id, status")
        .eq("student_id", kidId)
        .eq("date", dayStr(new Date()));
      const todayStatus = {};
      (todayRows || []).forEach((r) => { todayStatus[r.practice_step_id] = r.status; });

      const { data: repertoire } = await supabase
        .from("repertoire")
        .select("id, memorized_at, assignments(title)")
        .eq("student_id", kidId)
        .order("memorized_at", { ascending: false });

      setKidData((prev) => ({
        ...prev,
        [kidId]: { stats, assignments: assignments || [], todayStatus, repertoire: repertoire || [] },
      }));
    } catch (err) {
      console.error("Kid detail fetch failed:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedKidId && !kidData[selectedKidId]) fetchKidDetail(selectedKidId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKidId]);

  const startPinReset = (kidId) => {
    setResetKidId(kidId);
    setResetPin(randomPin());
    setResetMsg(null);
  };

  const submitPinReset = async (kid) => {
    if (!/^\d{4}$/.test(resetPin)) {
      setResetMsg({ kidId: kid.id, ok: false, text: "PIN must be exactly 4 digits" });
      return;
    }
    setResetBusy(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("reset-kid-pin", {
        body: { student_id: kid.id, new_pin: resetPin },
      });
      if (fnError) throw new Error(fnError.message || "Reset failed");
      if (data?.error) throw new Error(data.error);
      setResetMsg({ kidId: kid.id, ok: true, text: `Done! ${kid.name} now logs in with PIN ${resetPin}` });
      setResetKidId(null);
    } catch (err) {
      setResetMsg({ kidId: kid.id, ok: false, text: err.message || "Reset failed — try again" });
    } finally {
      setResetBusy(false);
    }
  };

  const selectedKid = kids.find((k) => k.id === selectedKidId);
  const detail = selectedKidId ? kidData[selectedKidId] : null;

  const CATEGORY_COLORS = {
    Warmup: "var(--red, #FF6B6B)",
    Technique: "var(--yellow, #FECA57)",
    Theory: "var(--teal, #1DD1A1)",
    Pieces: "var(--blue, #54A0FF)",
    Performance: "var(--purple, #A29BFE)",
  };

  return (
    <div className="parent-dashboard">
      <header className="parent-dashboard-header">
        <h1>👨‍👩‍👧 Your Family</h1>
        <button className="btn-logout" onClick={async () => { await supabase.auth.signOut(); onLogout(); }}>
          Log Out
        </button>
      </header>

      <main className="parent-dashboard-main">
        {loading && <p className="parent-loading">Loading your family...</p>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && kids.length === 0 && (
          <div className="parent-empty">
            <p>No kids are linked to this account yet.</p>
            <p>If you just signed up, try reloading — otherwise ask your teacher to link you.</p>
          </div>
        )}

        {!loading && kids.length > 0 && (
          <>
            {family && (
              <section className="parent-family-code">
                <div>
                  <p className="parent-code-label">Family code for kid login</p>
                  <p className="parent-code-value">{family.code}</p>
                </div>
                <p className="parent-code-hint">
                  On your kid's device: open the app → Student → enter this code → they tap their name and type their PIN.
                </p>
              </section>
            )}

            {kids.length > 1 && (
              <nav className="kid-switcher">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    className={`kid-tab ${kid.id === selectedKidId ? "active" : ""}`}
                    onClick={() => setSelectedKidId(kid.id)}
                  >
                    <span className="kid-tab-avatar">{kid.avatar || "🎵"}</span>
                    {kid.name.split(" ")[0]}
                  </button>
                ))}
              </nav>
            )}

            {selectedKid && (
              <section className="kid-panel">
                <div className="kid-panel-header">
                  <span className="parent-kid-avatar">{selectedKid.avatar || "🎵"}</span>
                  <div className="parent-kid-info">
                    <span className="parent-kid-name">{selectedKid.name}</span>
                    <span className="parent-kid-instrument">{selectedKid.instrument || "—"}</span>
                  </div>
                  <span className={`parent-kid-status ${selectedKid.status === "active" ? "active" : "pending"}`}>
                    {selectedKid.status === "active" ? "✓ Approved" : "Waiting for teacher approval"}
                  </span>
                </div>

                {selectedKid.family_id && resetKidId !== selectedKid.id && (
                  <button type="button" className="btn-reset-pin" onClick={() => startPinReset(selectedKid.id)}>
                    🔑 Reset PIN
                  </button>
                )}
                {resetKidId === selectedKid.id && (
                  <div className="pin-reset-editor">
                    <label htmlFor={`pin-${selectedKid.id}`}>New 4-digit PIN</label>
                    <div className="pin-reset-controls">
                      <input
                        id={`pin-${selectedKid.id}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={resetPin}
                        onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ""))}
                        disabled={resetBusy}
                      />
                      <button type="button" className="btn-pin-save" onClick={() => submitPinReset(selectedKid)} disabled={resetBusy}>
                        {resetBusy ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="btn-pin-cancel" onClick={() => { setResetKidId(null); setResetMsg(null); }} disabled={resetBusy}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {resetMsg && resetMsg.kidId === selectedKid.id && (
                  <p className={`pin-reset-msg ${resetMsg.ok ? "ok" : "err"}`}>{resetMsg.text}</p>
                )}

                {detailLoading && !detail && <p className="parent-loading">Loading practice info...</p>}

                {detail && (
                  <>
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
                    <BadgeShowcase studentId={selectedKid.id} />

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

                    <CommLog studentId={selectedKid.id} role="parent" />
                  </>
                )}
              </section>
            )}

            {kids.some((k) => k.status === "pending") && (
              <p className="parent-pending-note">
                Your teacher approves new students before assignments appear — usually quick! Kids can explore the app in the meantime.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

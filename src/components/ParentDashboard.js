import React, { useState, useEffect, useCallback } from "react";
import { useWorkspaceClient } from "../lib/familySpaceClient";
import KidPracticePanel from "./KidPracticePanel";
import "./ParentDashboard.css";

// Family shell: kid switcher + family code. Per-kid content (stats,
// lesson, reschedule, badges, chat) lives in KidPracticePanel, shared
// with the teacher's "Preview as Parent" view so the two can't drift.
export default function ParentDashboard({ userId, onLogout, onChoosePerson }) {
  const client = useWorkspaceClient();
  const [kids, setKids] = useState([]);
  const [family, setFamily] = useState(null);
  const [selectedKidId, setSelectedKidId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFamily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: links, error: linkError } = await client
        .from("parent_students")
        .select("student_id")
        .eq("parent_auth_user_id", userId);
      if (linkError) throw linkError;

      const ids = (links || []).map((l) => l.student_id);
      if (ids.length === 0) {
        setKids([]);
      } else {
        const { data: students, error: studentError } = await client
          .from("students")
          .select("id, name, avatar, instrument, status, family_id, email")
          .in("id", ids)
          .order("created_at");
        if (studentError) throw studentError;
        setKids(students || []);
        setSelectedKidId((cur) => students?.some((student) => student.id === cur) ? cur : students?.[0]?.id || null);

        const familyId = students?.find((s) => s.family_id)?.family_id;
        if (familyId) {
          const { data: fam } = await client
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
  }, [userId, client]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const selectedKid = kids.find((k) => k.id === selectedKidId);

  return (
    <div className="parent-dashboard">
      <header className="parent-dashboard-header">
        <div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div>
        <button type="button" className="btn-logout" onClick={onChoosePerson || onLogout}>
          {onChoosePerson ? "Choose another person" : "Switch account"}
        </button>
      </header>

      <main className="parent-dashboard-main">
        {loading && <p className="parent-loading" role="status">Loading your family…</p>}
        {error && <div className="parent-load-error" role="alert"><h2>Your family could not load</h2><p>{error}</p><button type="button" onClick={fetchFamily}>Try again</button></div>}

        {!loading && !error && kids.length === 0 && (
          <div className="parent-empty" role="status">
            <h2>No students linked yet</h2>
            <p>No kids are linked to this account yet.</p>
            <p>If you just signed up, try reloading — otherwise ask your teacher to link you.</p>
          </div>
        )}

        {!loading && kids.length > 0 && (
          <>
            {family && kids.some((kid) => kid.email === `kid-${kid.id}@kids.heartbeats.app`) && (
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
              <nav className="kid-switcher" aria-label="Choose a student">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    className={`kid-tab ${kid.id === selectedKidId ? "active" : ""}`}
                    aria-pressed={kid.id === selectedKidId}
                    onClick={() => setSelectedKidId(kid.id)}
                  >
                    <span className="kid-tab-avatar">{kid.avatar || "🎵"}</span>
                    {kid.name}
                  </button>
                ))}
              </nav>
            )}

            {selectedKid && <KidPracticePanel key={selectedKid.id} kid={selectedKid} mode="parent" />}

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

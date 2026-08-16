import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import KidPracticePanel from "./KidPracticePanel";
import "./ParentDashboard.css";

// Family shell: kid switcher + family code. Per-kid content (stats,
// lesson, reschedule, badges, chat) lives in KidPracticePanel, shared
// with the teacher's "Preview as Parent" view so the two can't drift.
export default function ParentDashboard({ userId, userEmail, onLogout }) {
  const [kids, setKids] = useState([]);
  const [family, setFamily] = useState(null);
  const [selectedKidId, setSelectedKidId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const selectedKid = kids.find((k) => k.id === selectedKidId);

  return (
    <div className="parent-dashboard">
      <header className="parent-dashboard-header">
        <div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div>
        <button className="btn-logout" onClick={async () => { await supabase.auth.signOut(); onLogout(); }}>
          Log Out
        </button>
      </header>

      <main className="parent-dashboard-main">
        {loading && <p className="parent-loading" role="status">Loading your family...</p>}
        {error && <div className="error-message" role="alert">{error}</div>}

        {!loading && !error && kids.length === 0 && (
          <div className="parent-empty" role="status">
            <h2>No students linked yet</h2>
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

            {selectedKid && <KidPracticePanel kid={selectedKid} mode="parent" />}

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

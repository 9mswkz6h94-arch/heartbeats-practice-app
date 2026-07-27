import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import "./ParentDashboard.css";

// v1 shell: shows the family's kids, their approval status, and the family
// code + login instructions. The full read-only practice dashboard (weekly
// stats, assignments, badges) layers on here in a later phase.
export default function ParentDashboard({ userId, userEmail, onLogout }) {
  const [kids, setKids] = useState([]);
  const [family, setFamily] = useState(null);
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

            <section className="parent-kids-grid">
              {kids.map((kid) => (
                <div key={kid.id} className="parent-kid-card">
                  <span className="parent-kid-avatar">{kid.avatar || "🎵"}</span>
                  <div className="parent-kid-info">
                    <span className="parent-kid-name">{kid.name}</span>
                    <span className="parent-kid-instrument">{kid.instrument || "—"}</span>
                  </div>
                  <span className={`parent-kid-status ${kid.status === "active" ? "active" : "pending"}`}>
                    {kid.status === "active" ? "✓ Approved" : "Waiting for teacher approval"}
                  </span>
                </div>
              ))}
            </section>

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

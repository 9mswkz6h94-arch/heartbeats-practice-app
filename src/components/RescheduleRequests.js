import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import "./RescheduleRequests.css";

// All pending parent reschedule requests, across every student, in one
// place — approve/decline without hunting through each student's detail.
export default function RescheduleRequests({ teacherId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [noteDraft, setNoteDraft] = useState({});
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: requestError } = await supabase
        .from("reschedule_requests")
        .select("id, student_id, proposed_date, proposed_time, reason, status, created_at, students(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (requestError) throw requestError;
      setRequests(data || []);
    } catch (requestError) {
      console.error("Reschedule requests could not load:", requestError);
      setError(requestError.message || "Reschedule requests could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, teacherId]);

  const resolve = async (id, status) => {
    setBusyId(id);
    setError(null);
    try {
      const { error: resolveError } = await supabase
        .from("reschedule_requests")
        .update({ status, teacher_note: noteDraft[id] || null, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (resolveError) throw resolveError;
      await fetchRequests();
    } catch (resolveError) {
      console.error("Reschedule request could not update:", resolveError);
      setError(resolveError.message || "The request could not be updated.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <section className="resched-panel" role="status">Checking family schedule requests…</section>;
  if (error && requests.length === 0) return <section className="resched-panel" role="alert"><strong>Schedule requests could not load.</strong><span>{error}</span><button type="button" onClick={fetchRequests}>Try again</button></section>;
  if (requests.length === 0) return null;

  return (
    <section className="resched-panel">
      <h2 className="resched-panel-title">Reschedule requests ({requests.length})</h2>
      {error && <p role="alert">{error}</p>}
      <div className="resched-list">
        {requests.map((r) => (
          <div key={r.id} className="resched-row">
            <div className="resched-info">
              <span className="resched-student">{r.students?.name || "Student"}</span>
              <span className="resched-when">
                wants {new Date(`${r.proposed_date}T00:00`).toLocaleDateString()} at {r.proposed_time.slice(0, 5)}
              </span>
              {r.reason && <span className="resched-reason">"{r.reason}"</span>}
            </div>
            <input
              type="text"
              className="resched-note-input"
              aria-label={`Optional note for ${r.students?.name || "student"}`}
              placeholder="Optional note back to parent"
              value={noteDraft[r.id] || ""}
              onChange={(e) => setNoteDraft({ ...noteDraft, [r.id]: e.target.value })}
              disabled={busyId === r.id}
            />
            <div className="resched-actions">
              <button type="button" className="btn-resched-approve" disabled={busyId === r.id} onClick={() => resolve(r.id, "approved")}>
                Approve
              </button>
              <button type="button" className="btn-resched-decline" disabled={busyId === r.id} onClick={() => resolve(r.id, "declined")}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

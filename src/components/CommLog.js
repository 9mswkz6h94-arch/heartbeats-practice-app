import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import "./CommLog.css";

// Teacher↔parent message thread per student. Students never see this —
// enforced by RLS (no student policies on communication_log at all).
// role: "teacher" | "parent". Teacher gets a per-message "📣 Notify parent"
// checkbox (delivery is a later phase; the flag persists now).
export default function CommLog({ studentId, role, authorName }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  const markRead = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    await supabase.from("comm_thread_reads").upsert({
      user_id: userData.user.id,
      student_id: studentId,
      last_read_at: new Date().toISOString(),
    });
  }, [studentId]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("communication_log")
      .select("id, author_role, author_name, body, notify, notified_at, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    if (fetchError) setError(fetchError.message);
    else setMessages(data || []);
    setLoading(false);
    markRead();
  }, [studentId, markRead]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const shouldNotify = role === "teacher" ? notify : false;
      const { data: inserted, error: insertError } = await supabase
        .from("communication_log")
        .insert([
          {
            student_id: studentId,
            author_id: userData.user.id,
            author_role: role,
            author_name: authorName || null,
            body: body.trim(),
            notify: shouldNotify,
          },
        ])
        .select("id")
        .single();
      if (insertError) throw insertError;
      setBody("");
      setNotify(false);
      fetchMessages();

      // Fire-and-forget: texting a parent is a bonus, never allowed to block
      // or fail the message itself (reliability rule — message already posted).
      if (shouldNotify && inserted?.id) {
        supabase.functions
          .invoke("notify-parent-sms", { body: { message_id: inserted.id } })
          .catch(() => {});
      }
    } catch (err) {
      setError(err.message || "Could not send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comm-log">
      <h3 className="comm-log-title">💬 {role === "teacher" ? "Parent chat" : "Chat with your teacher"}</h3>
      <div className="comm-log-list" ref={listRef}>
        {loading && <p className="comm-log-empty">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="comm-log-empty">
            No messages yet — {role === "teacher" ? "post a note for this student's parents." : "your teacher's notes will show up here."}
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`comm-msg ${m.author_role === role ? "mine" : "theirs"}`}>
            <div className="comm-msg-meta">
              <span className="comm-msg-author">
                {m.author_name || (m.author_role === "teacher" ? "Teacher" : "Parent")}
              </span>
              <span className="comm-msg-time">
                {new Date(m.created_at).toLocaleDateString()}{" "}
                {new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
              {m.notify && (
                <span className="comm-msg-notify">{m.notified_at ? "📣 notified" : "📣 pending"}</span>
              )}
            </div>
            <div className="comm-msg-body">{m.body}</div>
          </div>
        ))}
      </div>
      <form className="comm-log-compose" onSubmit={send}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message..."
          rows={2}
          disabled={sending}
        />
        <div className="comm-log-actions">
          {role === "teacher" && (
            <label className="comm-notify-toggle">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} disabled={sending} />
              📣 Notify parent
            </label>
          )}
          <button type="submit" className="btn-comm-send" disabled={sending || !body.trim()}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
        {error && <p className="comm-log-error">{error}</p>}
      </form>
    </div>
  );
}

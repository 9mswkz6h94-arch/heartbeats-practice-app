import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import "./NotificationSettings.css";

// Parent's opt-in for texted notifications when a teacher flags a message.
// Lives on the parent_students row for (this parent, this student) —
// mirrors the existing notify_email column, adds the phone number that
// notify_sms actually needs to be actionable.
export default function NotificationSettings({ studentId }) {
  const [linkId, setLinkId] = useState(null);
  const [phone, setPhone] = useState("");
  const [notifySms, setNotifySms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) { setLoading(false); return; }
    const { data } = await supabase
      .from("parent_students")
      .select("id, parent_phone, notify_sms")
      .eq("student_id", studentId)
      .or(`parent_auth_user_id.eq.${userData.user.id},parent_email.eq.${(userData.user.email || "").toLowerCase()}`)
      .maybeSingle();
    if (data) {
      setLinkId(data.id);
      setPhone(data.parent_phone || "");
      setNotifySms(!!data.notify_sms);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!linkId) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("parent_students")
        .update({ parent_phone: phone.trim() || null, notify_sms: notifySms })
        .eq("id", linkId);
      if (error) throw error;
      setMessage({ ok: true, text: "Saved" });
    } catch (err) {
      setMessage({ ok: false, text: err.message || "Could not save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !linkId) return null;

  return (
    <form className="notif-settings" onSubmit={save}>
      <h4 className="notif-settings-title">Text notifications</h4>
      <label className="notif-settings-toggle">
        <input
          aria-label="Parent phone number"
          type="checkbox"
          checked={notifySms}
          onChange={(e) => setNotifySms(e.target.checked)}
          disabled={saving}
        />
        Text me when the teacher sends a flagged message
      </label>
      {notifySms && (
        <input
          type="tel"
          className="notif-settings-phone"
          placeholder="Your phone number, e.g. 5125551234"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={saving}
        />
      )}
      <div className="notif-settings-actions">
        <button type="submit" className="btn-notif-save" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        {message && (
          <span role={message.ok ? "status" : "alert"} className={`notif-settings-msg ${message.ok ? "ok" : "err"}`}>{message.text}</span>
        )}
      </div>
    </form>
  );
}

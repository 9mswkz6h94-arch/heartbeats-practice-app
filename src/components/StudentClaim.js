import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StudentClaim({ onClaim, onLogout }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <main className="auth-form-container"><form className="auth-form" onSubmit={async event => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = await supabase.rpc("hb_claim_student_code", { p_code: code.trim() });
      if (result.error) throw result.error;
      onClaim(result.data);
    } catch (err) { setError(err.message || "Your login could not be connected."); }
    finally { setBusy(false); }
  }}>
    <h1>Connect your student login</h1>
    <p>Ask your teacher for your one-time student setup code. Use the email they have on file.</p>
    <label htmlFor="individual-setup">Student setup code</label>
    <input id="individual-setup" autoComplete="off" required value={code} onChange={e => setCode(e.target.value)} />
    {error && <p role="alert">{error}</p>}
    <button className="btn-submit" disabled={busy}>Open my practice</button>
    <button type="button" onClick={onLogout}>Switch account</button>
  </form></main>;
}

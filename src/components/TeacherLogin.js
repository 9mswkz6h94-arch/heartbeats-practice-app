import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthForms.css";

export default function TeacherLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Teacher access is invite-only. The database profile is authoritative;
      // never create or promote a teacher from this public form.
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("type")
        .eq("id", data.user.id)
        .single();

      if (fetchError || userData?.type !== "teacher") {
        await supabase.auth.signOut();
        throw new Error("This account does not have teacher access. Ask the studio administrator for an invitation.");
      }

      onLoginSuccess("teacher", data.user.id, data.user.email);
    } catch (err) {
      console.error("Full error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <p className="auth-context">Teacher access</p>
        <h2>Teacher sign in</h2>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@heartbeats.studio"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="student-note">
          <p>Teacher accounts are invite-only. Use the email address that received your studio invitation.</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthForms.css";

// Sign-in only — new families go through the FamilySignup wizard instead.
export default function ParentLogin({ onStartSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // App.js's auth listener resolves the parent role and routes onward.
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>👨‍👩‍👧 Parent Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="parent-login-email">Email</label>
            <input
              id="parent-login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="parent-login-password">Password</label>
            <input
              id="parent-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="toggle-auth">
          <p>
            New to Heart Beats?
            <button type="button" className="toggle-btn" onClick={onStartSignup}>
              Create your family account
            </button>
          </p>
        </div>
        <div className="student-note">
          <p>One signup covers your whole family — you'll add your kids right after.</p>
        </div>
      </div>
    </div>
  );
}

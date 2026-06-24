import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthForms.css";

export default function StudentLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      // Fetch student record
      const { data: studentData, error: fetchError } = await supabase
        .from("students")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError) {
        await supabase.auth.signOut();
        throw new Error("Student profile not found. Contact your teacher.");
      }

      onLoginSuccess("student", studentData.id, data.user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>🎓 Student Login</h2>

        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@heartbeats.studio"
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

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <div className="student-note">
          <p>Your teacher creates your account and assigns practice goals.</p>
          <p>Once logged in, you'll see practice cards to work through!</p>
        </div>
      </div>
    </div>
  );
}

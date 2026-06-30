import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import TeacherLogin from "./components/TeacherLogin";
import StudentLogin from "./components/StudentLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import "./App.css";

// Read SSO tokens from URL hash (passed by rainbowheart.studio)
async function applySSOTokenFromURL() {
  const hash = window.location.hash;
  if (!hash || !hash.includes("access_token=")) return;
  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token") || "";
  if (accessToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    // Clean up URL so tokens aren't visible / re-applied on refresh
    window.history.replaceState(null, "", window.location.pathname);
  }
}

function App() {
  const [screen, setScreen] = useState("selection");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Apply SSO token from URL before checking session
        await applySSOTokenFromURL();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session) {
          await resolveSession(session, isMounted);
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session) {
        await resolveSession(session, isMounted);
      } else if (event === "SIGNED_OUT") {
        setUserType(null);
        setUserId(null);
        setStudentId(null);
        setScreen("selection");
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Resolve a Supabase session into app state
  async function resolveSession(session, isMounted) {
    if (!isMounted) return;

    // Use JWT metadata role first (set at signup on rainbowheart.studio).
    // Fall back to DB lookup for teacher accounts created before this field existed.
    let resolvedType = session.user.user_metadata?.role;

    if (!resolvedType) {
      const { data: userData } = await supabase
        .from("users")
        .select("type")
        .eq("id", session.user.id)
        .single();
      resolvedType = userData?.type || "teacher";
    }

    if (!isMounted) return;

    setUserType(resolvedType);
    setUserId(session.user.id);
    setUserEmail(session.user.email);

    if (resolvedType === "student") {
      // Match student record by email (teacher creates these manually)
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (!isMounted) return;

      if (studentData) {
        // Link auth_user_id if not already set
        await supabase
          .from("students")
          .update({ auth_user_id: session.user.id })
          .eq("id", studentData.id)
          .is("auth_user_id", null);

        setStudentId(studentData.id);
        setAuthError(null);
        setScreen("student-dashboard");
      } else {
        // Account exists but the teacher hasn't added this email as a student yet.
        // Stay signed in (don't sign out) so it resolves automatically once they're added —
        // just reload after the teacher adds you.
        setAuthError(
          "We couldn't find a student profile for this email yet. Ask your teacher to add you, then reload this page."
        );
        setScreen("selection");
      }
    } else {
      setScreen("teacher-dashboard");
    }
  }

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h1>Heart Beats Practice App</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleTeacherLogin = (type, id, email) => {
    setUserType(type);
    setUserId(id);
    setUserEmail(email);
    setScreen("teacher-dashboard");
  };

  const handleLogout = () => {
    setUserType(null);
    setUserId(null);
    setUserEmail(null);
    setStudentId(null);
    setScreen("selection");
  };

  return (
    <div className="App">
      {screen === "selection" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
          </header>

          <main>
            <div className="auth-selection">
              <h2>Welcome!</h2>
              <p>Are you a teacher or student?</p>
              {authError && <div className="auth-banner-error">{authError}</div>}
              <button
                onClick={() => { setAuthError(null); setScreen("teacher-login"); }}
                className="btn btn-teacher"
              >
                Teacher
              </button>
              <button
                onClick={() => { setAuthError(null); setScreen("student-login"); }}
                className="btn btn-student"
              >
                Student
              </button>
            </div>
          </main>
        </>
      )}

      {screen === "teacher-login" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
            <button
              onClick={() => setScreen("selection")}
              className="btn-back-header"
            >
              Back
            </button>
          </header>

          <main>
            <TeacherLogin onLoginSuccess={handleTeacherLogin} />
          </main>
        </>
      )}

      {screen === "student-login" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
            <button
              onClick={() => setScreen("selection")}
              className="btn-back-header"
            >
              Back
            </button>
          </header>

          <main>
            <StudentLogin />
          </main>
        </>
      )}

      {screen === "teacher-dashboard" && (
        <TeacherDashboard userId={userId} userEmail={userEmail} onLogout={handleLogout} />
      )}

      {screen === "student-dashboard" && (
        <StudentDashboard studentId={studentId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

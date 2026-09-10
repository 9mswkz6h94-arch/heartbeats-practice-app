import React, { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./lib/supabaseClient";
import TeacherLogin from "./components/TeacherLogin";
import StudentLogin from "./components/StudentLogin";
import KidLogin from "./components/KidLogin";
import ParentLogin from "./components/ParentLogin";
import FamilySignup from "./components/FamilySignup";
import ScaffoldSandboxBanner, { shouldShowScaffoldSandboxBanner } from "./components/ScaffoldSandboxBanner";
import ScaffoldShellReview from "./components/ScaffoldShellReview";
import "./App.css";
import "./theme/rainbow-heart/rainbow-heart.css";
import "./components/RainbowHeartStudentReview.css";

const ParentDashboard = lazy(() => import("./components/ParentDashboard"));
const TeacherDashboard = lazy(() => import("./components/TeacherDashboard"));
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
function WorkspaceLoading() {
  return <div className="loading" role="status"><p>Opening this workspace…</p></div>;
}

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
  const showScaffoldSandboxBanner = shouldShowScaffoldSandboxBanner();
  const scaffoldSandboxOffset = showScaffoldSandboxBanner ? " scaffold-sandbox-offset" : "";
  const [reviewScreen, setReviewScreen] = useState(() => (
    process.env.REACT_APP_REVIEW_DATA_MODE === "mock-isolated"
      ? new URLSearchParams(window.location.search).get("review")
      : null
  ));
  const [screen, setScreen] = useState("selection");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // The family wizard manages its own signed-in flow; suppress the global
  // auth listener's routing until the wizard finishes.
  const [inFamilySignup, setInFamilySignup] = useState(false);
  const inFamilySignupRef = React.useRef(false);
  inFamilySignupRef.current = inFamilySignup;

  useEffect(() => {
    // Mock review screens are deliberately disconnected from auth and data.
    // Do not contact Supabase when reviewing the local fixture shells.
    if (reviewScreen) {
      setLoading(false);
      return undefined;
    }

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
        if (inFamilySignupRef.current) return; // wizard routes itself when done
        await resolveSession(session, isMounted);
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        setStudentId(null);
        setScreen("selection");
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [reviewScreen]);

  // Resolve a Supabase session into app state
  async function resolveSession(session, isMounted) {
    if (!isMounted) return;

    // User metadata is supplied during public signup, so it cannot grant
    // teacher access. Only an invited teacher profile in `users` may do that.
    const metadataRole = session.user.user_metadata?.role;
    const { data: userData } = await supabase
      .from("users")
      .select("type")
      .eq("id", session.user.id)
      .single();

    let resolvedType = userData?.type || metadataRole;
    if (resolvedType === "teacher" && userData?.type !== "teacher") {
      await supabase.auth.signOut();
      if (!isMounted) return;
      setAuthError("This account does not have teacher access. Ask the studio administrator for an invitation.");
      setScreen("selection");
      return;
    }

    if (!resolvedType) {
      await supabase.auth.signOut();
      if (!isMounted) return;
      setAuthError("We couldn't determine which studio space belongs to this account. Ask the studio administrator for help.");
      setScreen("selection");
      return;
    }

    if (!isMounted) return;

    setUserId(session.user.id);
    setUserEmail(session.user.email);

    if (resolvedType === "student") {
      // Match student record by email (kid accounts use synthetic emails,
      // legacy students use their real one — both live in students.email)
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
    } else if (resolvedType === "parent") {
      setAuthError(null);
      setScreen("parent-dashboard");
    } else {
      setScreen("teacher-dashboard");
    }
  }

  if (["teacher", "teacher-admin", "student", "parent", "parent-signup"].includes(reviewScreen)) {
    const handleReviewNavigate = (nextScreen) => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("review", nextScreen);
      window.history.replaceState(null, "", nextUrl);
      setReviewScreen(nextScreen);
    };

    return <>{showScaffoldSandboxBanner && <ScaffoldSandboxBanner />}<div className={`App${scaffoldSandboxOffset}`}><Suspense fallback={<WorkspaceLoading />}><ScaffoldShellReview screen={reviewScreen} onNavigate={handleReviewNavigate} /></Suspense></div></>;
  }

  if (loading) {
    return (
      <>{showScaffoldSandboxBanner && <ScaffoldSandboxBanner />}<div className={`App${scaffoldSandboxOffset} rainbow-heart-review rainbow-heart-app`} data-rh-theme="rainbow-heart" data-rh-expression="standard">
        <div className="loading" role="status">
          <h1>Heart Beats Practice App</h1>
          <p>Loading your practice space...</p>
        </div>
      </div></>
    );
  }

  const handleTeacherLogin = (type, id, email) => {
    setUserId(id);
    setUserEmail(email);
    setScreen("teacher-dashboard");
  };

  const handleLogout = async () => {
    try {
      // Account switching only needs to remove this device's session. Using
      // local scope avoids a remote sign-out failure trapping a family or
      // tester inside the current account on a shared phone.
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUserId(null);
      setUserEmail(null);
      setStudentId(null);
      setAuthError(null);
      setScreen("selection");
    }
  };

  // Wizard finished: route the (already signed-in) parent to their dashboard.
  const handleFamilySignupDone = async () => {
    setInFamilySignup(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await resolveSession(session, true);
    } else {
      setScreen("selection");
    }
  };

  const screenHeader = (
    <header className="App-header has-back">
      <h1>Heart Beats Practice App</h1>
      <button
        onClick={() => {
          setInFamilySignup(false);
          setScreen("selection");
        }}
        className="btn-back-header"
      >
        Back
      </button>
    </header>
  );

  return (
    <>{showScaffoldSandboxBanner && <ScaffoldSandboxBanner />}<div className={`App${scaffoldSandboxOffset} rainbow-heart-review rainbow-heart-app`} data-rh-theme="rainbow-heart" data-rh-expression="standard">
      {screen === "selection" && (
        <>
          <header className="App-header">
            <div>
              <p className="app-kicker">Studio practice system</p>
              <h1>Heart Beats Practice App</h1>
            </div>
          </header>

          <main>
            <div className="auth-selection">
              <p className="section-index">01 / Choose your space</p>
              <h2>Welcome</h2>
              <p className="auth-selection-intro">Who’s practicing, supporting, or teaching today?</p>
              {authError && <div className="auth-banner-error" role="alert">{authError}</div>}
              <div className="role-selection-list">
              <button
                onClick={() => { setAuthError(null); setScreen("kid-login"); }}
                className="btn btn-student"
              >
                <span className="role-index">01</span>
                <span className="role-copy"><strong>Student</strong><small>Open today’s practice work</small></span>
              </button>
              <button
                onClick={() => { setAuthError(null); setScreen("parent-login"); }}
                className="btn btn-parent"
              >
                <span className="role-index">02</span>
                <span className="role-copy"><strong>Parent</strong><small>View family practice and schedules</small></span>
              </button>
              <button
                onClick={() => { setAuthError(null); setScreen("teacher-login"); }}
                className="btn btn-teacher"
              >
                <span className="role-index">03</span>
                <span className="role-copy"><strong>Teacher</strong><small>Manage students and lesson plans</small></span>
              </button>
              </div>
            </div>
          </main>
        </>
      )}

      {screen === "teacher-login" && (
        <>
          {screenHeader}
          <main>
            <TeacherLogin onLoginSuccess={handleTeacherLogin} />
          </main>
        </>
      )}

      {screen === "kid-login" && (
        <>
          {screenHeader}
          <main>
            <KidLogin onUseEmailInstead={() => setScreen("student-login")} />
          </main>
        </>
      )}

      {screen === "student-login" && (
        <>
          {screenHeader}
          <main>
            <StudentLogin />
          </main>
        </>
      )}

      {screen === "parent-login" && (
        <>
          {screenHeader}
          <main>
            <ParentLogin
              onStartSignup={() => {
                setInFamilySignup(true);
                setScreen("family-signup");
              }}
            />
          </main>
        </>
      )}

      {screen === "family-signup" && (
        <>
          {screenHeader}
          <main>
            <FamilySignup
              onDone={handleFamilySignupDone}
              onBackToLogin={() => {
                setInFamilySignup(false);
                setScreen("parent-login");
              }}
            />
          </main>
        </>
      )}

      {screen === "teacher-dashboard" && (
        <Suspense fallback={<WorkspaceLoading />}><TeacherDashboard userId={userId} userEmail={userEmail} onLogout={handleLogout} /></Suspense>
      )}

      {screen === "student-dashboard" && (
        <Suspense fallback={<WorkspaceLoading />}><StudentDashboard studentId={studentId} onLogout={handleLogout} /></Suspense>
      )}

      {screen === "parent-dashboard" && (
        <Suspense fallback={<WorkspaceLoading />}><ParentDashboard userId={userId} userEmail={userEmail} onLogout={handleLogout} /></Suspense>
      )}
    </div></>
  );
}

export default App;

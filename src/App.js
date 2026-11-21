import React, { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./lib/supabaseClient";
import { familyIdentity } from "./lib/familySpaceClient";
import TeacherLogin from "./components/TeacherLogin";
import StudentClaim from "./components/StudentClaim";
import StudentLogin from "./components/StudentLogin";
import KidLogin from "./components/KidLogin";
import ParentLogin from "./components/ParentLogin";
import FamilySignup from "./components/FamilySignup";
import ScaffoldSandboxBanner, { shouldShowScaffoldSandboxBanner } from "./components/ScaffoldSandboxBanner";
import ScaffoldShellReview from "./components/ScaffoldShellReview";
import "./App.css";
import "./theme/rainbow-heart/rainbow-heart.css";
import "./components/RainbowHeartStudentReview.css";

const FamilyWorkspace = lazy(() => import("./components/FamilyWorkspace"));
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

  const switchToFamily = React.useRef(false);
  const authVersion = React.useRef(0);
  const currentUser = React.useRef(null);

  useEffect(() => {
    // Mock review screens are deliberately disconnected from auth and data.
    // Do not contact Supabase when reviewing the local fixture shells.
    if (reviewScreen) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    let timer;
    const route = async (session) => {
      if (!mounted || inFamilySignupRef.current) return;
      // Supabase also sends SIGNED_IN when an existing tab regains focus.
      if (session && currentUser.current === session.user.id) return;
      const version = ++authVersion.current;
      currentUser.current = session?.user?.id || null;
      if (!session) {
        setUserId(null); setUserEmail(null); setStudentId(null);
        let familyId;
        try { familyId = await familyIdentity(); } catch { /* Individual sign-in stays available. */ }
        if (!mounted || version !== authVersion.current) return;
        if (familyId) { setUserId(familyId); setScreen("family-workspace"); }
        else if (switchToFamily.current) { switchToFamily.current = false; setScreen("parent-login"); }
        else setScreen("selection");
        setLoading(false);
        return;
      }
      setLoading(true);
      await resolveSession(session, () => mounted && version === authVersion.current);
      if (mounted && version === authVersion.current) setLoading(false);
    };
    // Complete the auth callback before querying PostgREST. Those requests
    // may need the same auth lock held by the callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT"].includes(event) || inFamilySignupRef.current) return;
      clearTimeout(timer);
      if (event === "SIGNED_OUT") { ++authVersion.current; currentUser.current = null; }
      timer = setTimeout(() => route(session), 0);
    });
    (async () => {
      try {
        await applySSOTokenFromURL();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        await route(data.session);
      } catch {
        if (mounted) { setAuthError("Could not open your session. Please sign in again."); setLoading(false); }
      }
    })();
    return () => { mounted = false; clearTimeout(timer); subscription.unsubscribe(); };
  }, [reviewScreen]);

  async function resolveSession(session, current) {
    try {
      const uid = session.user.id;
      const { data: profile, error } = await supabase.from("users").select("type").eq("id", uid).maybeSingle();
      if (error) throw error;
      if (!current()) return;
      setUserId(uid); setUserEmail(session.user.email); setStudentId(null); setAuthError(null);
      if (profile?.type === "teacher") { setScreen("teacher-dashboard"); return; }
      const household = await supabase.rpc("hb_family_state");
      if (household.error) throw household.error;
      if (!current()) return;
      if (household.data?.family) {
        // Retire any old browser-held login before handing this device to a child.
        switchToFamily.current = true;
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
        if (signOutError) throw signOutError;
        return;
      }
      const linked = await supabase.from("students").select("id").eq("auth_user_id", uid).maybeSingle();
      if (linked.error) throw linked.error;
      const id = linked.data?.id;
      if (!current()) return;
      if (!id) { setScreen("student-claim"); return; }
      setStudentId(id); setScreen("student-dashboard");
    } catch {
      if (current()) {
        currentUser.current = null;
        setAuthError("Your workspace could not open. Please try signing in again.");
        setScreen("selection");
      }
    }
  }

  if (["teacher", "teacher-admin", "student", "parent", "parent-signup", "family-access"].includes(reviewScreen)) {
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
    ++authVersion.current;
    currentUser.current = null;
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

  const openFamily = (id) => {
    ++authVersion.current;
    currentUser.current = null;
    setInFamilySignup(false); setUserId(id); setUserEmail(null); setStudentId(null);
    setAuthError(null); setScreen("family-workspace"); setLoading(false);
  };
  const leaveFamily = () => {
    ++authVersion.current;
    setUserId(null); setStudentId(null); setAuthError(null); setScreen("selection");
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
                <span className="role-copy"><strong>Family sign-in</strong><small>Choose a student or open Parent space</small></span>
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
            <KidLogin onFamilyLogin={() => setScreen("parent-login")} onUseEmailInstead={() => setScreen("student-login")} />
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
            <ParentLogin onSignedIn={openFamily}
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
              onDone={openFamily}
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

      {screen === "student-claim" && <StudentClaim onLogout={handleLogout} onClaim={id => { setStudentId(id); setScreen("student-dashboard"); }} />}
      {screen === "student-dashboard" && (
        <Suspense fallback={<WorkspaceLoading />}><StudentDashboard studentId={studentId} onLogout={handleLogout} /></Suspense>
      )}

      {screen === "family-workspace" && (
        <Suspense fallback={<WorkspaceLoading />}><FamilyWorkspace key={userId} userId={userId} onLogout={leaveFamily} /></Suspense>
      )}
    </div></>
  );
}

export default App;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createFamilySpaceClient, FamilySpaceContext, familyRpc, familySignOut } from "../lib/familySpaceClient";
import ParentDashboard from "./ParentDashboard";
import StudentDashboard from "./StudentDashboard";
import "./FamilyAccessFixture.css";

const CHANGE = "heartbeats-family-space-change";
function tellOtherTabs() {
  try { localStorage.setItem(CHANGE, crypto.randomUUID()); } catch { /* Focus checks also refresh the chooser. */ }
}
async function call(name, args) {
  const { data, error } = await familyRpc(name, args);
  if (error || data?.error) throw new Error(data?.error || error.message);
  return data;
}

export default function FamilyWorkspace({ userId, onLogout }) {
  const [state, setState] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(false);
  const active = useRef(null);
  const close = useCallback(() => {
    active.current = null;
    setWorkspace(null);
    setPrompt(null);
    setPin("");
    setCode("");
  }, []);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const next = await call("hb_family_state");
      if (!mounted.current || request !== generation.current) return;
      if (!next.family) throw new Error("This family link has changed. Sign out and ask your teacher for help.");
      if (!next.approved || (active.current && active.current.revision !== next.revision)) close();
      setState(next);
    } catch (err) {
      if (mounted.current && request === generation.current) { close(); setState(null); setError(err.message); }
    }
  }, [close]);
  useEffect(() => {
    mounted.current = true;
    refresh();
    const sync = (event) => {
      if (event.type === "storage" && event.key !== CHANGE) return;
      if (event.type === "pageshow" && !event.persisted) return;
      if (event.type === "storage" || event.type === "pageshow") close();
      refresh();
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      mounted.current = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [refresh, close]);
  useEffect(() => {
    if (!workspace) return undefined;
    const timer = setTimeout(() => {
      close();
      setError("Your space has timed out. Choose who’s here again.");
      refresh();
    }, Math.max(0, Date.parse(workspace.expires) - Date.now()));
    return () => clearTimeout(timer);
  }, [workspace, close, refresh]);
  const run = async (work) => {
    if (running.current) return;
    running.current = true;
    generation.current++;
    setBusy(true);
    setError("");
    try { await work(); }
    catch (err) {
      if (mounted.current) { setError(err.message); await refresh(); }
    } finally { running.current = false; if (mounted.current) setBusy(false); }
  };
  const enter = (grant, kid) => {
    if (!mounted.current) return;
    const next = { ...grant, kid, client: createFamilySpaceClient(grant.token, userId) };
    active.current = next;
    setWorkspace(next);
    setPrompt(null);
    setPin("");
    setCode("");
  };
  const unlock = (event) => {
    event.preventDefault();
    const parent = prompt === "parent";
    const useCode = state?.setup || prompt === "recover";
    run(async () => {
      const grant = await call("hb_unlock_family", { p_pin: pin, p_parent: parent, p_setup_code: useCode ? code.trim() : null });
      tellOtherTabs();
      if (parent) enter(grant, null);
      else { close(); await refresh(); }
    });
  };
  const choose = (kid) => run(async () => {
    const grant = await call("hb_choose_space", { p_student: kid.id, p_revision: state.revision });
    tellOtherTabs();
    enter(grant, kid);
  });
  const back = () => {
    const revision = active.current?.revision;
    close();
    setState(null);
    run(async () => {
      await call("hb_choose_space", { p_student: null, p_revision: revision });
      tellOtherTabs();
      await refresh();
    });
  };
  const logout = () => run(async () => {
    close();
    await familySignOut();
    tellOtherTabs();
    await onLogout();
  });

  if (workspace) return <FamilySpaceContext.Provider value={workspace.client}>
    {workspace.kid
      ? <StudentDashboard key={workspace.revision} studentId={workspace.kid.id} studentName={workspace.kid.name} onChoosePerson={back} />
      : <ParentDashboard key={workspace.revision} userId={userId} onChoosePerson={back} />}
  </FamilySpaceContext.Provider>;

  const asking = state && (!state.approved || prompt);
  const setup = state?.setup || prompt === "recover";
  return <main className="family-access-review">
    <section aria-labelledby="family-title" aria-busy={busy}>
      <h1 id="family-title">{asking ? (setup ? "Set your private parent PIN" : prompt === "parent" ? "Open Parent space" : "Approve this device") : "Welcome to your family space"}</h1>
      {error && <p role="alert">{error}</p>}
      {!state && (error ? <button type="button" onClick={refresh}>Try again</button> : <p role="status">Opening your family…</p>)}
      {asking && <form onSubmit={unlock} className="auth-form">
        <p>{setup ? "Your teacher can give you a one-time parent setup code. Choose a PIN that only the grown-up knows." : prompt === "parent" ? "Enter your private PIN to see family messages and settings." : "A grown-up enters their private PIN once. Students can then choose their own name on this device for seven days."}</p>
        {setup && <div className="form-group"><label htmlFor="hb-setup">Setup code from your teacher</label>
          <input id="hb-setup" required autoComplete="off" maxLength={24} value={code} onChange={e => setCode(e.target.value)} /></div>}
        <div className="form-group"><label htmlFor="hb-private-pin">{setup ? "New parent PIN (6–10 digits)" : "Parent PIN"}</label>
          <input id="hb-private-pin" type="password" inputMode="numeric" pattern="[0-9]{6,10}" maxLength={10} required autoComplete="off" value={pin} onChange={e => setPin(e.target.value)} /></div>
        <button disabled={busy} type="submit">{prompt === "parent" ? "Open Parent space" : "Approve device"}</button>
        {!setup && <button type="button" disabled={busy} onClick={() => { setPrompt("recover"); setPin(""); setError(""); }}>Use a parent recovery code</button>}
        {state.approved && <button type="button" onClick={close}>Back to family</button>}
      </form>}
      {state?.approved && !prompt && <><p>Choose who’s here today.</p><div className="family-access-choices">
        {state.students.map(kid => <button type="button" key={kid.id} disabled={busy || kid.status !== "active"} onClick={() => choose(kid)}>
          <strong>{kid.name}</strong><span>{kid.status === "active" ? "Open my practice" : "Waiting for teacher approval"}</span>
        </button>)}
        <button type="button" disabled={busy} onClick={() => { setError(""); setPrompt("parent"); }}><strong>Parent space</strong><span>Family information and settings</span></button>
      </div></>}
      <button type="button" className="family-signout" disabled={busy} onClick={logout}>Sign out of this device</button>
    </section>
  </main>;
}

import React, { useState } from "react";
import PracticeCardDetail from "./PracticeCardDetail";
import FloatingCompanion from "./FloatingCompanion";
import MusicalZooStrip from "./MusicalZooStrip";
import FamilySetupFixture from "./FamilySetupFixture";
import ParentReviewFixture from "./ParentReviewFixture";
import TeacherWorkspaceFixture from "./TeacherWorkspaceFixture";
import { getCharacter, getCharacters } from "../lib/characterRegistry";
import { getPracticeCompanionReaction } from "../lib/companionReactions";
import { reviewStickerPages } from "../lib/stickerBook";
import {
  createMockMeadowDecorations,
  createMockRiverbankUnlock,
  placeMeadowDecoration,
  recordMeadowDecorationPractice,
  recordRiverbankPractice,
  removeMeadowDecoration,
} from "../lib/zooRewards";
import "./TeacherDashboard.css";
import "./Dashboard.css";
import "./StudentDashboard.css";
import "./ParentDashboard.css";
import "./ScaffoldShellReview.css";
import "./TeacherLessonPrepDashboard.css";
import "./StudentPracticeCards.css";
import "./PracticeCardDetail.css";
import "./BadgeShowcase.css";
import "./CommLog.css";
import "./NotificationSettings.css";
import "./FamilySignup.css";
import "./AssignmentList.css";
import "./RescheduleRequests.css";

const reviewSpaces = [
  { id: "student", label: "Student" },
  { id: "teacher", label: "Teacher workspace" },
  { id: "parent", label: "Parent" },
  { id: "parent-signup", label: "Family setup" },
];

const reviewZooCharacters = getCharacters();

function StudentPracticeFixture() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [companionResponse, setCompanionResponse] = useState(null);
  const [responseVariation, setResponseVariation] = useState(0);
  const [selectedCompanion, setSelectedCompanion] = useState(() => getCharacter("riffin"));
  const [meadowDecorations, setMeadowDecorations] = useState(createMockMeadowDecorations);
  const [riverbankUnlock, setRiverbankUnlock] = useState(createMockRiverbankUnlock);
  const cards = [
    {
      id: "warmup",
      assignment: "Chromatic warmup across the entire comfortable range",
      instrument: "Guitar",
      title: "Slow and even with relaxed shoulders",
      step: 1,
      description: "Play the pattern slowly from the sixth string to the first string. Pause if your hands feel tight. The goal today is an even sound, not speed.",
    },
    {
      id: "song",
      assignment: "You Are My Sunshine — verse and chorus",
      instrument: "Voice",
      title: "Sing the chorus with clear breaths between phrases",
      step: 2,
      description: "Sing the chorus twice. Mark one comfortable breath before each long phrase, then try it once more with the recording.",
    },
  ];

  const respondToWork = (intent) => {
    const message = getPracticeCompanionReaction(selectedCompanion?.id, intent, responseVariation);
    if (intent === "step_complete_generic") {
      setMeadowDecorations((current) => recordMeadowDecorationPractice(current));
      setRiverbankUnlock((current) => recordRiverbankPractice(current));
    }
    setResponseVariation((current) => current + 1);
    setCompanionResponse({ message, id: Date.now(), intent });
    setSelectedCard(null);
  };

  const respondToZooMoment = (message) => {
    setCompanionResponse({ message, id: Date.now(), intent: "practice_response" });
  };

  const chooseCompanion = (companion) => {
    setSelectedCompanion(companion);
    setCompanionResponse(null);
  };

  return <div className="practice-container">
    <MusicalZooStrip
      meadowDecorations={meadowDecorations}
      riverbankUnlock={riverbankUnlock}
      onPlaceMeadowDecoration={(decorationId, spotId) => setMeadowDecorations((current) => placeMeadowDecoration(current, decorationId, spotId))}
      onRemoveMeadowDecoration={(decorationId) => setMeadowDecorations((current) => removeMeadowDecoration(current, decorationId))}
      selectedCompanionId={selectedCompanion?.id}
      onCompanionChange={chooseCompanion}
      onCompanionResponse={respondToZooMoment}
      musicalZooFriends={reviewZooCharacters}
      stickerPages={reviewStickerPages}
    />
    <div className="practice-header"><div className="header-top"><div className="streak-badge"><span className="streak-label">Current streak</span><span className="streak-count">5 days</span></div><div className="counter"><span className="remaining">2</span><span className="remaining-label">of 4 remaining today</span></div></div></div>
    <div className="practice-grid">{cards.map((card) => <button type="button" className="practice-card-tile" key={card.id} onClick={() => setSelectedCard(card)}><span className="tile-header"><span className="tile-assignment-title">{card.assignment}</span><span className="instrument-tag">{card.instrument}</span></span><span className="tile-body"><span className="step-title">{card.title}</span><span className="step-number">Step {card.step}</span></span><span className="tile-action"><span className="tap-hint">Open practice card</span></span></button>)}</div>
    <section className="badge-showcase"><h3>Badges earned</h3><div className="badges-grid"><div className="badge-item"><div className="badge-icon">🌱</div><div className="badge-name">First steps</div><div className="badge-description">Completed the first three practice activities.</div><div className="badge-date">8/12/2026</div></div><div className="badge-item"><div className="badge-icon">🔥</div><div className="badge-name">Seven-day streak</div><div className="badge-description">Practiced on seven different days.</div><div className="badge-date">8/16/2026</div></div></div></section>
    <FloatingCompanion
      companion={selectedCompanion}
      response={companionResponse}
      visualState={companionResponse?.intent === "step_complete_generic" ? "complete" : "practice"}
    />
    {selectedCard && <PracticeCardDetail step={{step_number:selectedCard.step,title:selectedCard.title,description:selectedCard.description}} assignment={{title:selectedCard.assignment,instrument_type:selectedCard.instrument}} onComplete={() => respondToWork("step_complete_generic")} onSkip={() => respondToWork("skip_accepted")} onClose={() => setSelectedCard(null)} readOnly />}
  </div>;
}

// Kept as a compatibility export for older visual snapshots; the active
// parent review uses ParentReviewFixture so every visible control is testable.
export function ParentFixture() {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  return <div className="parent-dashboard"><header className="parent-dashboard-header"><div><p className="dashboard-context">Parent workspace</p><h1>Your family</h1></div><button type="button" className="btn-logout">Log out</button></header><main className="parent-dashboard-main"><section className="parent-family-code"><div><p className="parent-code-label">Family code for kid login</p><p className="parent-code-value">RH-4827</p></div><p className="parent-code-hint">On your kid’s device: open the app, choose Student, enter this code, then select their name and enter their PIN.</p></section><nav className="kid-switcher" aria-label="Choose a student"><button type="button" className="kid-tab active" aria-pressed="true"><span className="kid-tab-avatar">🎸</span>Alexandria</button><button type="button" className="kid-tab" aria-pressed="false"><span className="kid-tab-avatar">🎹</span>Sam</button></nav><section className="kid-panel"><div className="kid-panel-header"><span className="parent-kid-avatar">🎸</span><div className="parent-kid-info"><span className="parent-kid-name">Alexandria Montgomery-Rivera</span><span className="parent-kid-instrument">Guitar</span></div><span className="parent-kid-status active">Approved</span></div><button type="button" className="btn-reset-pin">Reset PIN</button><div className="lesson-info-row"><span>Lessons every <strong>Tuesday</strong> at <strong>4:30 PM</strong> — Rainbow Heart Studio</span><a className="btn-add-calendar" href="#parent-calendar-review">Add to Google Calendar</a><button type="button" className="btn-request-reschedule" onClick={() => setRescheduleOpen(true)}>Request a different time</button></div>{rescheduleOpen && <div className="reschedule-editor"><label htmlFor="review-parent-date">New date</label><input id="review-parent-date" type="date" defaultValue="2026-08-25"/><label htmlFor="review-parent-time">New time</label><input id="review-parent-time" type="time" defaultValue="17:30"/><label htmlFor="review-parent-reason">Reason (optional)</label><input id="review-parent-reason" defaultValue="School orientation runs late that afternoon"/><div className="reschedule-editor-actions"><button type="button" className="btn-pin-save">Send request</button><button type="button" className="btn-pin-cancel" onClick={() => setRescheduleOpen(false)}>Cancel</button></div></div>}<div className="reschedule-pending-row"><span>Requested 8/25/2026 at 5:30 PM — school orientation runs late that afternoon</span><span className="reschedule-status">Waiting for teacher</span><button type="button" className="btn-pin-cancel">Cancel request</button></div><div className="week-stats"><div className="week-stat"><span className="week-stat-value">4</span><span className="week-stat-label">sessions this week</span></div><div className="week-stat"><span className="week-stat-value">5</span><span className="week-stat-label">day streak</span></div><div className="week-stat"><span className="week-stat-value">7</span><span className="week-stat-label">songs memorized</span></div></div><h3 className="kid-section-title">This week’s practice</h3><div className="parent-assignment"><div className="parent-assignment-head"><span className="parent-assignment-title">Chromatic warmup across the entire comfortable range</span><span className="parent-category-chip">Technique</span></div><div className="parent-step"><span className="parent-step-mark">Done</span><span className="parent-step-title">Slow and even with relaxed shoulders</span></div><div className="parent-step"><span className="parent-step-mark">Open</span><span className="parent-step-title">Increase the metronome only when every note sounds clear</span></div></div><form className="notif-settings"><h4 className="notif-settings-title">Text notifications</h4><label className="notif-settings-toggle"><input type="checkbox" defaultChecked/>Text me when the teacher sends a flagged message</label><input className="notif-settings-phone" aria-label="Parent phone number" defaultValue="(512) 555-0147"/><div className="notif-settings-actions"><button type="button" className="btn-notif-save">Save</button></div></form><div className="comm-log"><h3 className="comm-log-title">Chat with your teacher</h3><div className="comm-log-list"><div className="comm-msg theirs"><div className="comm-msg-meta"><span className="comm-msg-author">Teacher</span><span className="comm-msg-time">8/16/2026 2:15 PM</span></div><div className="comm-msg-body">Alexandria made a great connection between the warmup and the song today. Keeping the tempo comfortable is the goal this week.</div></div><div className="comm-msg mine"><div className="comm-msg-meta"><span className="comm-msg-author">Parent</span><span className="comm-msg-time">8/16/2026 3:02 PM</span></div><div className="comm-msg-body">Thank you! We’ll keep the metronome slow and let you know how Tuesday goes.</div></div></div><form className="comm-log-compose"><textarea aria-label="Message to teacher" placeholder="Write a message…"/><div className="comm-log-actions"><button type="button" className="btn-comm-send">Send</button></div></form></div></section></main></div>;
}

function ParentSignupFixture() {
  return <FamilySetupFixture />;
}

function ReviewScreen({ screen }) {
  if (screen === "teacher" || screen === "teacher-admin") {
    return <div className="rainbow-heart-review rainbow-heart-teacher-review" data-rh-theme="rainbow-heart" data-rh-expression="standard"><TeacherWorkspaceFixture /></div>;
  }

  if (screen === "parent") {
    return <div className="rainbow-heart-review rainbow-heart-parent-review" data-rh-theme="rainbow-heart" data-rh-expression="standard"><ParentReviewFixture /></div>;
  }

  if (screen === "parent-signup") {
    return <div className="rainbow-heart-review rainbow-heart-family-review" data-rh-theme="rainbow-heart" data-rh-expression="standard"><ParentSignupFixture /></div>;
  }

  return <div className="dashboard rainbow-heart-review rainbow-heart-student-review" data-rh-theme="rainbow-heart" data-rh-expression="standard"><header className="dashboard-header"><div><p className="dashboard-context">Student workspace</p><h1 className="rh-display">Today’s practice</h1></div><button type="button" className="btn-logout" disabled>Review mode</button></header><main className="student-dashboard-content"><StudentPracticeFixture /></main></div>;
}

export default function ScaffoldShellReview({ screen, onNavigate }) {
  const normalizedScreen = screen === "teacher-admin" ? "teacher" : screen;
  const navigateReview = (nextScreen) => {
    onNavigate(nextScreen);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };
  return <>
    <nav className="review-space-nav" aria-label="Review workspace">
      <span className="review-space-label">Preview as</span>
      <div className="review-space-buttons">
        {reviewSpaces.map((space) => (
          <button
            type="button"
            key={space.id}
            className={`review-space-button ${normalizedScreen === space.id ? "active" : ""}`}
            aria-pressed={normalizedScreen === space.id}
            onClick={() => navigateReview(space.id)}
          >
            {space.label}
          </button>
        ))}
      </div>
    </nav>
    {screen === "parent-signup" && <h1 className="review-visually-hidden">Family setup</h1>}
    <ReviewScreen screen={screen} />
  </>;
}

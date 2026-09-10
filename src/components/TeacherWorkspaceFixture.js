import React, { useState } from "react";
import BadgeStudio from "./BadgeStudio";
import LessonMemoryFixture from "./LessonMemoryFixture";
import PlanningPartnerPanel from "./PlanningPartnerPanel";
import "./TeacherWorkspaceFixture.css";

export const TEACHER_STUDENTS = [
  {
    id: "alexandria",
    name: "Alexandria Montgomery-Rivera",
    shortName: "Alexandria",
    initials: "AM",
    instrument: "Guitar + voice",
    nextLesson: "Today · 4:30 PM",
    practiceLabel: "1 session this week",
    status: "Next up",
    tone: "next",
    memory: {
      sessionLabel: "Sep 6 · 4:30 PM",
      sessionDateTime: "2026-09-06T16:30",
      activeWorkTitle: "Chromatic warmup",
      activeWorkAge: "3 weeks",
      activeWorkStatus: "building comfortably",
      notes: [
        { id: 1, categoryId: "worked-on", text: "You Are My Sunshine — chorus breathing and confident starts.", time: "4:42 PM" },
        { id: 2, categoryId: "clicked", text: "Found a comfortable breath before the final phrase without prompting.", time: "4:51 PM" },
        { id: 3, categoryId: "student-voice", text: "Wants to learn a song from the Minecraft soundtrack next.", time: "4:56 PM" },
        { id: 4, categoryId: "next-time", text: "Begin with the chorus once, then connect it to verse two.", time: "5:00 PM" },
      ],
      draft: {
        id: "draft-alexandria",
        status: "suggested",
        title: "You Are My Sunshine — easy breaths and verse two",
        steps: [
          "Sing the chorus once at a comfortable volume.",
          "Pause and mark one easy breath before each long phrase.",
          "Connect the chorus to verse two when it feels ready.",
        ],
      },
    },
    assignments: [
      { title: "Chromatic warmup across the comfortable range", category: "Technique", age: "3 weeks", stage: "Building", progress: "2 of 4 steps explored" },
      { title: "You Are My Sunshine — verse and chorus", category: "Repertoire", age: "2 weeks", stage: "Growing", progress: "Chorus feeling steady" },
    ],
    stats: { sessions: 1, streak: 0, songs: 2, completions: 38 },
    repertoire: ["You Are My Sunshine", "Riptide", "Happy Birthday"],
    family: "Morgan Rivera · primary guardian",
    schedule: "Sundays at 4:30 PM",
  },
  {
    id: "sam",
    name: "Sam Lee",
    shortName: "Sam",
    initials: "SL",
    instrument: "Piano",
    nextLesson: "Today · 5:15 PM",
    practiceLabel: "4 sessions this week",
    status: "On a roll",
    tone: "steady",
    memory: {
      sessionLabel: "Sep 6 · 5:15 PM",
      sessionDateTime: "2026-09-06T17:15",
      activeWorkTitle: "C major contrary motion",
      activeWorkAge: "2 weeks",
      activeWorkStatus: "settling in",
      notes: [
        { id: 11, categoryId: "worked-on", text: "C major contrary motion and the opening of Rainbow Connection.", time: "5:22 PM" },
        { id: 12, categoryId: "clicked", text: "Kept the left wrist loose through the turnaround.", time: "5:31 PM" },
        { id: 13, categoryId: "next-time", text: "Start hands separately at the bridge, then reconnect the phrase.", time: "5:43 PM" },
      ],
      draft: {
        id: "draft-sam",
        status: "suggested",
        title: "Rainbow Connection — bridge hands separately",
        steps: [
          "Play the right-hand bridge slowly two times.",
          "Try the left hand alone with a loose wrist.",
          "Put the first two measures together if they feel ready.",
        ],
      },
    },
    assignments: [
      { title: "C major contrary motion", category: "Technique", age: "2 weeks", stage: "Building", progress: "3 of 3 steps explored" },
      { title: "Rainbow Connection — opening", category: "Repertoire", age: "1 week", stage: "New", progress: "First phrase opened" },
    ],
    stats: { sessions: 4, streak: 5, songs: 7, completions: 86 },
    repertoire: ["Rainbow Connection", "Lean on Me", "Ode to Joy"],
    family: "Taylor Lee · primary guardian",
    schedule: "Sundays at 5:15 PM",
  },
  {
    id: "maya",
    name: "Maya Thompson",
    shortName: "Maya",
    initials: "MT",
    instrument: "Voice",
    nextLesson: "Tuesday · 4:00 PM",
    practiceLabel: "2 sessions this week",
    status: "Steady",
    tone: "open",
    memory: {
      sessionLabel: "Sep 8 · 4:00 PM",
      sessionDateTime: "2026-09-08T16:00",
      activeWorkTitle: "Gentle sirens",
      activeWorkAge: "1 week",
      activeWorkStatus: "new exploration",
      notes: [
        { id: 21, categoryId: "worked-on", text: "Gentle sirens and finding an easy starting pitch.", time: "4:08 PM" },
        { id: 22, categoryId: "student-voice", text: "Interested in trying a song from Wicked.", time: "4:24 PM" },
        { id: 23, categoryId: "next-time", text: "Choose a short Wicked excerpt together before warming up.", time: "4:42 PM" },
      ],
      draft: {
        id: "draft-maya",
        status: "suggested",
        title: "Easy sirens and song choice",
        steps: [
          "Try three gentle sirens without reaching for volume.",
          "Listen to the two song excerpts we chose.",
          "Circle the one that feels most fun to begin.",
        ],
      },
    },
    assignments: [
      { title: "Gentle sirens", category: "Warmup", age: "1 week", stage: "New", progress: "Exploring comfortable range" },
    ],
    stats: { sessions: 2, streak: 2, songs: 4, completions: 52 },
    repertoire: ["Part of Your World", "Count on Me"],
    family: "Jamie Thompson · guardian",
    schedule: "Tuesdays at 4:00 PM",
  },
];

export const STUDENT_WORKSPACE_TABS = [
  { id: "lesson", label: "Lesson" },
  { id: "assignments", label: "Assignments" },
  { id: "progress", label: "Progress" },
  { id: "family", label: "Family & schedule" },
];

export const TEACHER_PRIMARY_TABS = [
  { id: "studio", label: "Studio" },
  { id: "students", label: "Students" },
  { id: "badges", label: "Badge Studio" },
];

const TODAY_SCHEDULE = [
  { time: "3:45", period: "PM", label: "Open studio", detail: "15 minutes to prepare", kind: "open" },
  { time: "4:30", period: "PM", label: "Alexandria", detail: "Guitar + voice · next up", studentId: "alexandria", kind: "next" },
  { time: "5:15", period: "PM", label: "Sam", detail: "Piano", studentId: "sam", kind: "lesson" },
  { time: "6:00", period: "PM", label: "Studio closed", detail: "Notes and follow-ups", kind: "close" },
];

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekRangeLabel(today = new Date()) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString([], { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString([], sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" });
  return `${startLabel}–${endLabel}`;
}

function StudioCalendar({ students }) {
  const scheduled = students
    .filter((student) => student.lesson)
    .sort((a, b) => (
      a.lesson.day_of_week - b.lesson.day_of_week
      || a.lesson.start_time.localeCompare(b.lesson.start_time)
    ));

  return (
    <div className="teacher-studio-calendar" id="teacher-studio-calendar">
      <div className="teacher-studio-calendar-heading">
        <strong>Recurring studio schedule</strong>
        <span>Local workspace view · no external calendar connection</span>
      </div>
      {scheduled.length ? scheduled.map((student) => (
        <article key={student.id}>
          <span>{WEEKDAY_NAMES[student.lesson.day_of_week]}</span>
          <time>{student.nextLesson.split("·").pop()?.trim() || student.lesson.start_time}</time>
          <strong>{student.name}</strong>
          <small>{student.instrument} · {student.lesson.duration_minutes || 30} minutes</small>
        </article>
      )) : students.map((student) => (
        <article key={student.id}>
          <span>Weekly</span>
          <time>{student.schedule}</time>
          <strong>{student.name}</strong>
          <small>{student.instrument}</small>
        </article>
      ))}
      {!students.length && <p>No recurring lessons are scheduled yet.</p>}
    </div>
  );
}

function formatPerformanceDate(startsAt) {
  if (!startsAt) return "";
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function StudioHome({ onOpenStudent, onShowStudents, students = TEACHER_STUDENTS, todaySchedule = TODAY_SCHEDULE, performanceEvents = [], summary, renderInbox }) {
  const [planningOpen, setPlanningOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showPlanOpen, setShowPlanOpen] = useState(false);
  const todayLabel = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const nextPerformance = performanceEvents[0];
  const performanceDate = formatPerformanceDate(nextPerformance?.startsAt);
  const pulseCards = summary
    ? [
        ["01", String(todaySchedule.length), "lessons today", todaySchedule.length ? "Your teaching rhythm is ready" : "No lessons scheduled today"],
        ["02", String(summary.lessonSlots || 0), "lesson slots this week", "From the recurring studio schedule"],
        ["03", String(summary.openLoops || 0), "open loops", summary.openLoops ? "Private drafts to revisit" : "Nothing waiting"],
        ["04", nextPerformance ? performanceDate : "—", "next performance", nextPerformance?.title || "Performance calendar not connected yet"],
      ]
    : [
        ["01", "4", "lessons today", "One starts in 18 min"],
        ["02", "11", "lessons this week", "Two open spots"],
        ["03", "3", "open loops", "Nothing urgent"],
        ["04", "12", "days to the next show", "Riverside stage"],
      ];
  const planningStudents = students.slice(0, 3);
  const weekCounts = summary
    ? [0, 1, 2, 3, 4, 5, 6].map((day) => students.filter((student) => student.lesson?.day_of_week === day).length)
    : null;

  return (
    <div className="teacher-studio-home">
      <section className="teacher-studio-pulse" aria-label="Week at a glance">
        {pulseCards.map(([index, value, label, detail]) => (
          <article key={index} className={`teacher-studio-pulse-card pulse-${index}`}>
            <span>{index}</span>
            <strong>{value}</strong>
            <h3>{label}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      {renderInbox?.()}

      <div className="teacher-studio-grid">
        <section className="teacher-studio-panel teacher-studio-today">
          <header className="teacher-studio-panel-heading">
            <div><p>{summary ? todayLabel : "Sunday · September 6"}</p><h2>Today’s rhythm</h2></div>
            <button type="button" onClick={onShowStudents}>Open student roster</button>
          </header>
          <div className="teacher-studio-timeline">
            {todaySchedule.length === 0 && (
              <div className="teacher-studio-empty"><strong>No lessons scheduled today</strong><span>Open the roster whenever you want to plan ahead.</span></div>
            )}
            {todaySchedule.map((item) => (
              <article className={`teacher-studio-time-row time-${item.kind}`} key={`${item.time}-${item.label}`}>
                <time><strong>{item.time}</strong><span>{item.period}</span></time>
                <span className="teacher-studio-time-line" aria-hidden="true" />
                <div><strong>{item.label}</strong><span>{item.detail}</span></div>
                {item.studentId && (
                  <button type="button" onClick={() => onOpenStudent(item.studentId, "lesson", { startLesson: item.kind === "next" })}>
                    {item.kind === "next" ? "Start lesson" : "Open student"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="teacher-studio-rail">
          <section className="teacher-studio-panel teacher-studio-planning">
            <p className="teacher-studio-kicker">Planning partner</p>
            <h2>{summary ? "A calm place to begin" : "Three useful things for today"}</h2>
            <ol>
              {summary
                ? planningStudents.map((student) => <li key={student.id}>{student.shortName}: {student.memory.activeWorkTitle} is the current thread.</li>)
                : <>
                    <li>Alexandria’s last note says to begin directly with the chorus.</li>
                    <li>Sam’s scale is ready for a lighter maintenance version.</li>
                    <li>Leave ten minutes after lessons for the Riverside set list.</li>
                  </>}
            </ol>
            <button type="button" aria-expanded={planningOpen} onClick={() => setPlanningOpen((current) => !current)}>
              {planningOpen ? "Close planning helper" : "Ask a planning question"}
            </button>
            {planningOpen && (
              <PlanningPartnerPanel students={students} onClose={() => setPlanningOpen(false)} />
            )}
          </section>

          <section className="teacher-studio-panel teacher-studio-attention">
            <div className="teacher-studio-panel-heading compact"><div><p>Open loops</p><h2>Needs attention</h2></div><span>{summary ? summary.openLoops || 0 : 3}</span></div>
            {summary ? (
              students.filter((student) => student.memory.draft?.id).slice(0, 3).map((student) => (
                <button type="button" key={student.id} onClick={() => onOpenStudent(student.id, "assignments")}>
                  <span>Assignment draft</span><strong>{student.shortName} · {student.memory.draft.status}</strong>
                </button>
              ))
            ) : <>
              <button type="button" onClick={() => onOpenStudent("alexandria", "assignments")}><span>Assignment draft</span><strong>Alexandria · ready to review</strong></button>
              <button type="button" onClick={() => onOpenStudent("alexandria", "family")}><span>Family request</span><strong>One reschedule waiting</strong></button>
              <button type="button" onClick={() => onOpenStudent("maya", "family")}><span>Message</span><strong>Reply to Maya’s guardian</strong></button>
            </>}
            {summary && !summary.openLoops && <p>Nothing is waiting for your attention.</p>}
          </section>
        </aside>

        <section className="teacher-studio-panel teacher-studio-week">
          <header className="teacher-studio-panel-heading"><div><p>{summary ? weekRangeLabel() : "Sep 6–12"}</p><h2>Week at a glance</h2></div><button type="button" aria-expanded={calendarOpen} aria-controls="teacher-studio-calendar" onClick={() => setCalendarOpen((current) => !current)}>{calendarOpen ? "Close calendar" : "Open calendar"}</button></header>
          <div className="teacher-studio-week-days">
            {(weekCounts ? [["SUN",weekCounts[0],"Lessons"],["MON",weekCounts[1],"Lessons"],["TUE",weekCounts[2],"Lessons"],["WED",weekCounts[3],"Lessons"],["THU",weekCounts[4],"Lessons"],["FRI",weekCounts[5],"Lessons"],["SAT",weekCounts[6],"Lessons"]] : [["SUN","4","Today"],["MON","0","Studio closed"],["TUE","3","Lessons"],["WED","2","Lessons"],["THU","2","Lessons"],["FRI","0","Open"],["SAT","—","Heartbeats"]]).map(([day,count,label], index) => (
              <div key={day} className={summary && index === new Date().getDay() ? "today" : day === "SUN" && !summary ? "today" : ""}><span>{day}</span><strong>{count}</strong><small>{count === 1 ? "Lesson" : label}</small></div>
            ))}
          </div>
          {calendarOpen && <StudioCalendar students={students} />}
        </section>

        <section className="teacher-studio-panel teacher-studio-performance">
          <div className="teacher-studio-performance-date"><strong>{nextPerformance ? new Date(nextPerformance.startsAt).getDate() : "18"}</strong><span>{nextPerformance ? new Date(nextPerformance.startsAt).toLocaleDateString([], { month: "short" }).toUpperCase() : "SEP"}</span></div>
          <div><p>Upcoming performance</p><h2>{summary ? nextPerformance?.title || "Connect the performance calendar" : "The Rainbow Hearts · Riverside Stage"}</h2><span>{summary ? nextPerformance ? `${performanceDate}${nextPerformance.venue ? ` · ${nextPerformance.venue}` : ""}` : "Show dates will appear here when that source is ready." : "Friday · 7:00 PM · Load-in at 5:30"}</span></div>
          <button type="button" aria-expanded={!summary ? showPlanOpen : undefined} onClick={!summary ? () => setShowPlanOpen((current) => !current) : undefined} disabled={Boolean(summary)}>{summary ? "Not connected" : showPlanOpen ? "Close show plan" : "Open show plan"}</button>
          {!summary && showPlanOpen && (
            <div className="teacher-show-plan" role="status">
              <strong>Riverside Stage</strong>
              <span>Load-in 5:30 PM · performance 7:00 PM</span>
              <small>Preview-only event details. Nothing was added to an outside calendar.</small>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StudentRoster({ onOpenStudent, students = TEACHER_STUDENTS, onManageStudents }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleStudents = students.filter((student) => (
    !normalizedQuery
    || `${student.name} ${student.instrument}`.toLowerCase().includes(normalizedQuery)
  ));
  return (
    <section className="teacher-roster" aria-labelledby="teacher-roster-title">
      <header className="teacher-roster-heading">
        <div><p>Choose a student to enter their workspace</p><h2 id="teacher-roster-title">Students</h2></div>
        <label>Find a student<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or instrument" /></label>
        {onManageStudents && <button type="button" onClick={onManageStudents}>Manage roster</button>}
      </header>
      <div className="teacher-roster-grid">
        {students.length === 0 && <div className="teacher-studio-empty"><strong>No active students yet</strong><span>Open roster management to add or approve a student.</span></div>}
        {students.length > 0 && visibleStudents.length === 0 && <div className="teacher-studio-empty"><strong>No matching students</strong><span>Try a name or instrument from the active roster.</span></div>}
        {visibleStudents.map((student) => (
          <article className="teacher-roster-card" key={student.id}>
            <span className="teacher-roster-avatar" aria-hidden="true">{student.initials}</span>
            <div className="teacher-roster-name"><h3>{student.name}</h3><p>{student.instrument}</p></div>
            <span className={`teacher-roster-status status-${student.tone}`}>{student.status}</span>
            <dl><div><dt>Next lesson</dt><dd>{student.nextLesson}</dd></div><div><dt>Practice</dt><dd>{student.practiceLabel}</dd></div></dl>
            <button type="button" onClick={() => onOpenStudent(student.id, "lesson")}>Open student workspace</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function StudentAssignments({ student }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [openAssignmentTitle, setOpenAssignmentTitle] = useState(null);

  return (
    <section className="teacher-student-section teacher-assignment-workspace" aria-labelledby="student-assignments-title">
      <header className="teacher-student-section-heading"><div><p>Student-scoped workspace</p><h2 id="student-assignments-title">Assignments for {student.shortName}</h2></div><button type="button" onClick={() => setComposerOpen((current) => !current)}>{composerOpen ? "Close new assignment" : "New assignment"}</button></header>
      {composerOpen && (
        <form className="teacher-assignment-composer" onSubmit={(event) => { event.preventDefault(); setDraftSaved(true); }}>
          <div><label htmlFor={`assignment-title-${student.id}`}>Assignment title</label><input id={`assignment-title-${student.id}`} defaultValue={student.memory.draft.title} /></div>
          <div><label htmlFor={`assignment-note-${student.id}`}>Student-facing note</label><textarea id={`assignment-note-${student.id}`} defaultValue="Keep this easy and musical. Stop before it feels tiring." rows="3" /></div>
          <button type="submit">{draftSaved ? "Draft saved" : "Keep as draft"}</button>
          <small>It will not appear for the student until you publish it.</small>
        </form>
      )}
      <div className="teacher-assignment-layout">
        <div>
          <div className="teacher-student-subheading"><h3>Current work</h3><span>{student.assignments.length} active</span></div>
          <div className="teacher-current-assignments">
            {student.assignments.map((assignment) => (
              <article key={assignment.title}>
                <div><span>{assignment.category}</span><span>{assignment.stage}</span></div>
                <h4>{assignment.title}</h4>
                <p>{assignment.progress}</p>
                <footer><strong>{assignment.age}</strong><span>working on this</span><button type="button" aria-expanded={openAssignmentTitle === assignment.title} onClick={() => setOpenAssignmentTitle((current) => current === assignment.title ? null : assignment.title)}>{openAssignmentTitle === assignment.title ? "Close" : "Open"}</button></footer>
                {openAssignmentTitle === assignment.title && <div className="teacher-assignment-preview" role="status"><strong>{assignment.stage}</strong><span>{assignment.progress}</span><small>This review card mirrors the current assignment without changing student work.</small></div>}
              </article>
            ))}
          </div>
        </div>
        <aside className="teacher-suggested-assignment">
          <p>From the latest lesson notes</p>
          <h3>{student.memory.draft.title}</h3>
          <ol>{student.memory.draft.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <button type="button" onClick={() => setComposerOpen(true)}>Review as new assignment</button>
          <small>Suggestion only · teacher approval required</small>
        </aside>
      </div>
    </section>
  );
}

function StudentProgress({ student }) {
  const recentActivity = student.stats.recentActivity || [42, 0, 68, 35, 82, 0, 54];
  const peak = Math.max(...recentActivity, 1);
  return (
    <section className="teacher-student-section" aria-labelledby="student-progress-title">
      <header className="teacher-student-section-heading"><div><p>Patterns, not pressure</p><h2 id="student-progress-title">{student.shortName}’s progress</h2></div></header>
      <div className="teacher-progress-stats">
        {[[student.stats.sessions,"sessions this week"],[student.stats.streak,"day rhythm"],[student.stats.songs,"songs in repertoire"],[student.stats.completions,"practice moments"]].map(([value,label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}
      </div>
      <div className="teacher-progress-layout">
        <article className="teacher-progress-card"><p>Recent practice rhythm</p><h3>Showing up in a way that fits</h3><div className="teacher-practice-bars" aria-label="Practice completions over the last seven days">{recentActivity.map((count,index)=><span key={index} title={`${count} practice completion${count === 1 ? "" : "s"}`} style={{height:`${Math.max((count / peak) * 100,8)}%`}} className={count === 0 ? "rest" : ""} />)}</div><small>Rest days are part of the picture—not missing data.</small></article>
        <article className="teacher-progress-card"><p>Repertoire shelf</p><h3>Songs {student.shortName} can return to</h3><div className="teacher-repertoire-list">{student.repertoire.length ? student.repertoire.map((song)=><span key={song}>{song}</span>) : <p>No memorized songs yet.</p>}</div></article>
      </div>
    </section>
  );
}

function StudentFamily({ student }) {
  const [messageOpen, setMessageOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [requestState, setRequestState] = useState("open");
  const [status, setStatus] = useState(null);
  return (
    <section className="teacher-student-section" aria-labelledby="student-family-title">
      <header className="teacher-student-section-heading"><div><p>Private teacher view</p><h2 id="student-family-title">Family & schedule</h2></div><button type="button" aria-expanded={messageOpen} onClick={() => setMessageOpen((current) => !current)}>{messageOpen ? "Close message" : "Message family"}</button></header>
      {messageOpen && <form className="teacher-family-demo-form" onSubmit={(event) => { event.preventDefault(); setStatus("Review message saved locally. No family notification was sent."); setMessageOpen(false); }}><label htmlFor={`family-message-${student.id}`}>Message to {student.family}</label><textarea id={`family-message-${student.id}`} rows="3" defaultValue="A quick note from today’s lesson…"/><button type="submit">Save preview message</button></form>}
      {status && <p className="teacher-workspace-status" role="status">{status}</p>}
      <div className="teacher-family-grid">
        <article><span>Regular lesson</span><h3>{student.schedule}</h3><p>Rainbow Heart Studio · 45 minutes</p><button type="button" aria-expanded={scheduleOpen} onClick={() => setScheduleOpen((current) => !current)}>{scheduleOpen ? "Close schedule" : "Adjust schedule"}</button>{scheduleOpen && <form className="teacher-family-inline-form" onSubmit={(event) => { event.preventDefault(); setStatus("Schedule change held in this local review."); setScheduleOpen(false); }}><label>New weekly time<input type="time" defaultValue="16:30" /></label><button type="submit">Save preview</button></form>}</article>
        <article><span>Family connection</span><h3>{student.family}</h3><p>Receives schedule changes and teacher messages.</p><button type="button" aria-expanded={logOpen} onClick={() => setLogOpen((current) => !current)}>{logOpen ? "Close communication log" : "Open communication log"}</button>{logOpen && <p className="teacher-family-log-preview">Most recent: Thanks—we’ll keep the tempo comfortable this week.</p>}</article>
        <article className="teacher-family-request"><span>{requestState === "open" ? "Open request" : "Review updated"}</span><h3>Move the next lesson to 5:30 PM</h3><p>School orientation runs late that afternoon.</p>{requestState === "open" ? <div><button type="button" onClick={() => { setRequestState("approved"); setStatus("Reschedule approved in the local review."); }}>Approve</button><button type="button" onClick={() => { setRequestState("suggested"); setStatus("A different-time suggestion is ready in the local review."); }}>Suggest another time</button></div> : <strong>{requestState === "approved" ? "Approved for 5:30 PM" : "Different time suggested"}</strong>}</article>
      </div>
    </section>
  );
}

function StudentWorkspace({ student, activeTab, onTabChange, onBack, startLessonRequested, onAutoStartHandled, renderLessonMemory, renderAssignments, renderProgress, renderFamily }) {
  return (
    <div className="teacher-student-workspace">
      <header className="teacher-student-context">
        <button type="button" className="teacher-student-back" onClick={onBack}>← Back to studio</button>
        <div className="teacher-student-identity"><span aria-hidden="true">{student.initials}</span><div><p>{student.instrument}</p><h2>{student.name}</h2><small>{student.nextLesson} · {student.practiceLabel}</small></div></div>
        <nav aria-label={`${student.shortName} workspace`} className="teacher-student-tabs">
          {STUDENT_WORKSPACE_TABS.map((tab) => <button type="button" key={tab.id} className={activeTab === tab.id ? "active" : ""} aria-current={activeTab === tab.id ? "page" : undefined} onClick={() => onTabChange(tab.id)}>{tab.label}</button>)}
        </nav>
      </header>
      {activeTab === "lesson" && (renderLessonMemory ? renderLessonMemory(student, () => onTabChange("assignments"), { autoStart: startLessonRequested, onAutoStartHandled }) : <LessonMemoryFixture key={student.id} studentName={student.shortName} sessionLabel={student.memory.sessionLabel} sessionDateTime={student.memory.sessionDateTime} starterNotes={student.memory.notes} activeWorkTitle={student.memory.activeWorkTitle} activeWorkAge={student.memory.activeWorkAge} activeWorkStatus={student.memory.activeWorkStatus} draftConfig={student.memory.draft} onOpenAssignments={() => onTabChange("assignments")} />)}
      {activeTab === "assignments" && (renderAssignments ? renderAssignments(student, () => onTabChange("lesson")) : <StudentAssignments student={student} />)}
      {activeTab === "progress" && (renderProgress ? renderProgress(student) : <StudentProgress student={student} />)}
      {activeTab === "family" && (renderFamily ? renderFamily(student) : <StudentFamily student={student} />)}
    </div>
  );
}

export function TeacherWorkspaceShell({
  students = TEACHER_STUDENTS,
  todaySchedule = TODAY_SCHEDULE,
  performanceEvents = [],
  summary,
  userEmail = "Sunday · September 6",
  onLogout,
  loading = false,
  error = null,
  onRetry,
  renderLessonMemory,
  renderAssignments,
  renderProgress,
  renderFamily,
  renderStudentManager,
  renderBadgeStudio,
  renderStudioInbox,
}) {
  const [primaryView, setPrimaryView] = useState("studio");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentTab, setStudentTab] = useState("lesson");
  const [startLessonRequested, setStartLessonRequested] = useState(false);
  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  const openStudent = (studentId, tab = "lesson", options = {}) => {
    setSelectedStudentId(studentId);
    setStudentTab(tab);
    setStartLessonRequested(Boolean(options.startLesson));
  };

  const goToPrimaryView = (view) => {
    setSelectedStudentId(null);
    setStartLessonRequested(false);
    setPrimaryView(view);
  };

  const clearStartLessonRequest = () => setStartLessonRequested(false);

  const title = selectedStudent ? selectedStudent.name : primaryView === "students" ? "Students" : primaryView === "manage" ? "Manage students" : primaryView === "badges" ? "Badge Studio" : "Studio · today";

  return (
    <div className="hud teacher-workspace-fixture">
      <aside className="hud-sidebar">
        <div className="hud-brand"><span className="hud-brand-mark">HB</span><span><span className="hud-brand-text">Heart Beats</span><span className="hud-brand-context">Teacher workspace</span></span></div>
        <nav className="hud-nav" aria-label="Teacher workspace">
          <button type="button" className={`hud-nav-item ${!selectedStudent && primaryView === "studio" ? "active" : ""}`} aria-current={!selectedStudent && primaryView === "studio" ? "page" : undefined} onClick={() => goToPrimaryView("studio")}><span className="hud-nav-index">01</span><span className="hud-nav-label">Studio</span></button>
          <button type="button" className={`hud-nav-item ${!selectedStudent && (primaryView === "students" || primaryView === "manage") ? "active" : ""}`} aria-current={!selectedStudent && (primaryView === "students" || primaryView === "manage") ? "page" : undefined} onClick={() => goToPrimaryView("students")}><span className="hud-nav-index">02</span><span className="hud-nav-label">Students</span></button>
          {renderBadgeStudio && <button type="button" className={`hud-nav-item ${!selectedStudent && primaryView === "badges" ? "active" : ""}`} aria-current={!selectedStudent && primaryView === "badges" ? "page" : undefined} onClick={() => goToPrimaryView("badges")}><span className="hud-nav-index">03</span><span className="hud-nav-label">Badge Studio</span></button>}
        </nav>
        {selectedStudent && <div className="teacher-sidebar-context"><p>Working with</p><strong>{selectedStudent.shortName}</strong><span>{studentTab === "lesson" ? "Lesson notes" : STUDENT_WORKSPACE_TABS.find((tab) => tab.id === studentTab)?.label}</span></div>}
        <div className="hud-side-foot"><div className="hud-user"><span className="hud-user-email">{userEmail}</span></div><button type="button" className="hud-logout" onClick={onLogout} disabled={!onLogout}>{onLogout ? "Switch account" : "Review mode"}</button></div>
      </aside>
      <div className="hud-main">
        <header className="hud-topbar"><div><p className="hud-view-context">{selectedStudent ? "Student workspace" : "Teacher workspace"}</p><h1 className="hud-view-title">{title}</h1></div></header>
        <main className="hud-content">
          {loading ? <div className="prep-state" role="status"><h2>Loading teacher workspace</h2><p>Gathering students, schedules, and current work…</p></div> : error ? <div className="prep-state prep-state-error" role="alert"><h2>Teacher workspace could not load</h2><p>{error}</p>{onRetry && <button type="button" onClick={onRetry}>Try again</button>}</div> : selectedStudent ? <StudentWorkspace student={selectedStudent} activeTab={studentTab} onTabChange={setStudentTab} onBack={() => goToPrimaryView("studio")} startLessonRequested={startLessonRequested} onAutoStartHandled={clearStartLessonRequest} renderLessonMemory={renderLessonMemory} renderAssignments={renderAssignments} renderProgress={renderProgress} renderFamily={renderFamily} /> : primaryView === "manage" && renderStudentManager ? <section className="teacher-student-section"><header className="teacher-student-section-heading"><div><p>Studio roster</p><h2>Manage students</h2></div><button type="button" onClick={() => goToPrimaryView("students")}>Back to roster</button></header>{renderStudentManager()}</section> : primaryView === "students" ? <StudentRoster onOpenStudent={openStudent} students={students} onManageStudents={renderStudentManager ? () => goToPrimaryView("manage") : undefined} /> : primaryView === "badges" && renderBadgeStudio ? renderBadgeStudio(students) : <StudioHome onOpenStudent={openStudent} onShowStudents={() => goToPrimaryView("students")} students={students} todaySchedule={todaySchedule} performanceEvents={performanceEvents} summary={summary} renderInbox={renderStudioInbox} />}
        </main>
      </div>
    </div>
  );
}

export default function TeacherWorkspaceFixture() {
  return <TeacherWorkspaceShell renderBadgeStudio={(students) => <BadgeStudio students={students} />} />;
}

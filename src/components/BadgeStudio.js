import React, { useMemo, useState } from "react";
import { getCharacters } from "../lib/characterRegistry";
import {
  BADGE_PHYSICAL_FORMATS,
  BADGE_STUDIO_LIMITS,
  BADGE_TEMPLATES,
  buildBadgeAwardPreview,
  createBadgeDraft,
  teacherBadgeAwardsApi,
  validateBadgeAward,
} from "../lib/badgeStudio";
import "./BadgeStudio.css";

const CHARACTERS = getCharacters();

function characterSticker(character) {
  return character?.stickers.find((sticker) => sticker.id === "celebrate") || character?.stickers[0];
}

export default function BadgeStudio({ students = [], teacherId = null, onAward }) {
  const [studentIds, setStudentIds] = useState([]);
  const [draft, setDraft] = useState(() => createBadgeDraft());
  const [physicalFormatId, setPhysicalFormatId] = useState("digital");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [lastAward, setLastAward] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const live = Boolean(teacherId);

  const selectedStudents = students.filter((student) => studentIds.includes(student.id));
  const validation = validateBadgeAward({
    studentIds,
    availableStudentIds: students.map((student) => student.id),
    draft,
  });
  const selectedCharacter = CHARACTERS.find((character) => character.id === draft.characterId) || CHARACTERS[0];
  const previewSticker = characterSticker(selectedCharacter);
  const selectedFormat = BADGE_PHYSICAL_FORMATS.find((format) => format.id === physicalFormatId) || BADGE_PHYSICAL_FORMATS[0];
  const recipientLabel = selectedStudents.length
    ? selectedStudents.map((student) => student.shortName || student.name).join(", ")
    : "Choose one or more students";

  const awardPreview = useMemo(() => buildBadgeAwardPreview({
    draft,
    students: selectedStudents,
    physicalFormatId,
    createdAt: live ? undefined : "2026-09-07T12:00:00.000Z",
  }), [draft, selectedStudents, physicalFormatId, live]);

  const toggleStudent = (studentId) => {
    setError(null);
    setReviewOpen(false);
    setStudentIds((current) => current.includes(studentId)
      ? current.filter((candidate) => candidate !== studentId)
      : [...current, studentId]);
  };

  const chooseTemplate = (templateId) => {
    setError(null);
    setDraft(createBadgeDraft(templateId));
    setReviewOpen(false);
  };

  const confirmAward = async () => {
    if (!validation.valid) return;
    setSaving(true);
    setError(null);
    try {
      if (live) {
        await teacherBadgeAwardsApi.award({
          teacherId,
          studentIds: validation.recipients,
          draft: validation.draft,
          physicalFormatId,
        });
        setLastAward({ ...awardPreview, status: "awarded" });
        setStudentIds([]);
        await onAward?.();
      } else {
        setLastAward(awardPreview);
      }
      setReviewOpen(false);
    } catch (awardError) {
      console.error("Badge award failed:", awardError);
      setError(awardError.message || "The badge could not be awarded. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="badge-studio" aria-labelledby="badge-studio-title">
      <header className="badge-studio-heading">
        <div>
          <p>Teacher-created celebrations</p>
          <h2 id="badge-studio-title">Make a badge for a moment that mattered</h2>
          <span>Recognize effort, listening, curiosity, and care—without turning growth into a race.</span>
        </div>
        <aside role="status"><strong>{live ? "Live studio" : "Local review"}</strong><span>{live ? "Digital awards save to the selected students. No physical order is placed." : "No student record or order will change."}</span></aside>
      </header>

      {lastAward && (
        <div className="badge-studio-success" role="status">
          <strong>{lastAward.recipientNames.length} {lastAward.recipientNames.length === 1 ? "badge" : "badges"} {live ? "awarded" : "celebrated in this review"}.</strong>
          <span>{lastAward.title} · {lastAward.recipientNames.join(", ")}. No physical order was placed.</span>
        </div>
      )}

      <div className="badge-studio-layout">
        <div className="badge-studio-builder">
          <fieldset className="badge-studio-step badge-studio-recipients">
            <legend><span>01</span><strong>Who are you celebrating?</strong></legend>
            <div className="badge-recipient-grid">
              {students.map((student) => (
                <label key={student.id} className={studentIds.includes(student.id) ? "selected" : ""}>
                  <input type="checkbox" checked={studentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} disabled={saving} />
                  <span aria-hidden="true">{student.initials}</span>
                  <strong>{student.shortName || student.name}</strong>
                  <small>{student.instrument}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="badge-studio-step badge-studio-templates">
            <legend><span>02</span><strong>What kind of moment was it?</strong></legend>
            <div className="badge-template-grid">
              {BADGE_TEMPLATES.map((template) => (
                <button type="button" key={template.id} className={draft.templateId === template.id ? "selected" : ""} aria-pressed={draft.templateId === template.id} onClick={() => chooseTemplate(template.id)} disabled={saving}>
                  <strong>{template.title}</strong><span>{template.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="badge-studio-step badge-studio-copy">
            <legend><span>03</span><strong>Make it personal</strong></legend>
            <label htmlFor="badge-title">Badge title <small>{draft.title.length}/{BADGE_STUDIO_LIMITS.title}</small></label>
            <input id="badge-title" value={draft.title} maxLength={BADGE_STUDIO_LIMITS.title} onChange={(event) => { setDraft((current) => ({ ...current, title: event.target.value })); setReviewOpen(false); setError(null); }} disabled={saving} />
            <label htmlFor="badge-message">A note the student will see <small>{draft.message.length}/{BADGE_STUDIO_LIMITS.message}</small></label>
            <textarea id="badge-message" rows="4" value={draft.message} maxLength={BADGE_STUDIO_LIMITS.message} onChange={(event) => { setDraft((current) => ({ ...current, message: event.target.value })); setReviewOpen(false); setError(null); }} disabled={saving} />

            <fieldset className="badge-character-picker">
              <legend>Musical Zoo friend</legend>
              <div>
                {CHARACTERS.map((character) => (
                  <label key={character.id} className={draft.characterId === character.id ? "selected" : ""} title={`${character.name} · ${character.virtue}`}>
                    <input type="radio" name="badge-character" value={character.id} checked={draft.characterId === character.id} onChange={() => { setDraft((current) => ({ ...current, characterId: character.id })); setReviewOpen(false); setError(null); }} disabled={saving} />
                    <img src={character.companionImage} alt="" />
                    <span>{character.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>

          <fieldset className="badge-studio-step badge-studio-format">
            <legend><span>04</span><strong>Digital now, or plan a keepsake?</strong></legend>
            <div className="badge-format-grid">
              {BADGE_PHYSICAL_FORMATS.map((format) => (
                <label key={format.id} className={physicalFormatId === format.id ? "selected" : ""}>
                  <input type="radio" name="badge-format" value={format.id} checked={physicalFormatId === format.id} onChange={() => { setPhysicalFormatId(format.id); setReviewOpen(false); setError(null); }} disabled={saving} />
                  <strong>{format.name}</strong><span>{format.detail}</span>
                </label>
              ))}
            </div>
            {physicalFormatId !== "digital" && <p className="badge-studio-safety-note"><strong>Plan only.</strong> A guardian-approved shipping flow, vendor template, price, and child-product review must come before ordering.</p>}
          </fieldset>
        </div>

        <aside className="badge-studio-preview" aria-label="Badge preview">
          <p>Student preview</p>
          <article>
            <div className="badge-preview-art"><img src={previewSticker?.image} alt={previewSticker?.alt || selectedCharacter.imageAlt} /></div>
            <span>From your teacher</span>
            <h3>{draft.title || "Your badge title"}</h3>
            <p>{draft.message || "Your kind note will appear here."}</p>
            <strong>{recipientLabel}</strong>
          </article>
          <dl>
            <div><dt>Zoo friend</dt><dd>{selectedCharacter.name}</dd></div>
            <div><dt>Format</dt><dd>{selectedFormat.name}</dd></div>
          </dl>
          {!reviewOpen ? (
            <button type="button" disabled={!validation.valid || saving} onClick={() => setReviewOpen(true)}>Review award</button>
          ) : (
            <div className="badge-studio-confirm" role="dialog" aria-labelledby="badge-confirm-title">
              <strong id="badge-confirm-title">Ready to celebrate {selectedStudents.length === 1 ? "this student" : "these students"}?</strong>
              <p>{live ? "This awards the digital badge now. Physical fulfillment remains a separate family-approved step." : "This saves only inside the local review. Physical fulfillment remains a separate family-approved step."}</p>
              <button type="button" onClick={confirmAward} disabled={saving}>{saving ? "Awarding…" : `Award ${selectedStudents.length} digital ${selectedStudents.length === 1 ? "badge" : "badges"}${live ? " now" : " in this review"}`}</button>
              <button type="button" className="quiet" onClick={() => setReviewOpen(false)} disabled={saving}>Keep editing</button>
            </div>
          )}
          {!validation.valid && <p className="badge-studio-validation">{validation.errors[0]}</p>}
          {error && <p className="badge-studio-validation" role="alert">{error}</p>}
        </aside>
      </div>
    </section>
  );
}

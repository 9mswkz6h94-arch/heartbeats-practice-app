import React, { useState } from "react";
import {
  canMergeFoundingFriend,
  createFoundingFriendCollection,
  FOUNDING_FRIEND_STAGES,
  hatchFoundingFriend,
  mergeFoundingFriendPair,
} from "../lib/foundingFriendCollection";
import "./ZooFoundingFriendsCare.css";

function possessiveName(name) {
  if (!name) return "Your friend's";
  return /s$/i.test(name) ? `${name}’` : `${name}’s`;
}

export default function ZooFoundingFriendsCare({
  friends,
  companions = [],
  selectedCompanionId,
  onSelectCompanion,
  onRenameFriend,
  initiallyOpen = false,
}) {
  const pickles = friends.find((friend) => friend.id === "pickles") || friends[0];
  const [open, setOpen] = useState(initiallyOpen);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(pickles?.name || "");
  const [dancing, setDancing] = useState(false);
  const [eggCount, setEggCount] = useState(2);
  const [collection, setCollection] = useState(createFoundingFriendCollection);
  const [careMessage, setCareMessage] = useState("Everything here is a local preview.");
  const selectedCompanion = companions.find((companion) => companion.id === selectedCompanionId);

  const chooseCompanion = (companion) => {
    onSelectCompanion?.(companion);
    setCareMessage(`${companion.name} is now your practice companion and will stay quiet until you do some work.`);
  };

  const saveName = (event) => {
    event.preventDefault();
    const cleanName = nameDraft.trim();
    if (!cleanName || !pickles) return;
    onRenameFriend(pickles.id, cleanName);
    setEditingName(false);
    setCareMessage(`${possessiveName(cleanName)} name now appears throughout the Zoo preview.`);
  };

  const toggleDance = () => {
    setDancing((current) => !current);
    setCareMessage(dancing
      ? `${pickles.name} settled back into a gentle idle.`
      : `${pickles.name} is dancing along. This preview did not open the microphone.`);
  };

  const hatchEgg = () => {
    if (eggCount <= 0) return;
    setEggCount((current) => current - 1);
    setCollection((current) => hatchFoundingFriend(current));
    setCareMessage("A Turtle hatchling joined your Founding Friends collection.");
  };

  const mergePair = (group) => {
    if (!canMergeFoundingFriend(group)) return;
    const nextStage = FOUNDING_FRIEND_STAGES[group.stage + 1];
    setCollection((current) => mergeFoundingFriendPair(current, group.id));
    setCareMessage(`Two ${FOUNDING_FRIEND_STAGES[group.stage]} ${group.name} friends became one ${nextStage} friend.`);
  };

  return (
    <section className={`zoo-founding-care${open ? " open" : ""}`} aria-labelledby="zoo-care-title">
      <header className="zoo-care-header">
        <div>
          <p className="zoo-district-eyebrow">Founding Friends</p>
          <h3 id="zoo-care-title">Caretaker Cabin</h3>
          <p>Growth, eggs, naming, and the original collection all live together inside the Zoo.</p>
        </div>
        <div className="zoo-care-header-actions">
          <span>{eggCount} eggs · {collection.length} groups</span>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="zoo-care-body"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? "Close cabin" : "Open care & collection"}
          </button>
        </div>
      </header>

      {!open && (
        <div className="zoo-care-preview" aria-hidden="true">
          <span>{pickles?.emoji}</span><span>🥚</span><span>🐢</span><span>🦊</span>
        </div>
      )}

      {open && (
        <div className="zoo-care-body" id="zoo-care-body">
          <section className="zoo-companion-picker" aria-labelledby="zoo-companion-picker-title">
            <div className="zoo-companion-picker-heading">
              <div>
                <p className="zoo-district-eyebrow">Practice companion</p>
                <h4 id="zoo-companion-picker-title">Who should come along?</h4>
              </div>
              <p>Your companion floats at the bottom-right and reacts after you finish or save practice work. They never interrupt or ask you to begin.</p>
            </div>

            <div className="zoo-companion-options">
              {companions.map((companion) => {
                const selected = companion.id === selectedCompanionId;
                return (
                  <button
                    type="button"
                    key={companion.id}
                    aria-pressed={selected}
                    onClick={() => chooseCompanion(companion)}
                  >
                    <span className="zoo-companion-portrait" aria-hidden="true">
                      {companion.image
                        ? <img src={companion.image} alt="" width="64" height="64" />
                        : companion.emoji}
                    </span>
                    <span className="zoo-companion-option-copy">
                      <strong>{companion.name}</strong>
                      <small>{companion.companionType}</small>
                    </span>
                    <span className="zoo-companion-choice-state">{selected ? "Coming along" : "Choose"}</span>
                  </button>
                );
              })}
            </div>

            <p className="zoo-companion-current" role="status" aria-live="polite">
              <strong>{selectedCompanion?.name || "Your friend"} is your companion.</strong>
              <span>Changing companions never changes XP, growth, or collection progress.</span>
            </p>
          </section>

          <section className="zoo-care-friend" aria-labelledby="pickles-corner-title">
            <div className={`zoo-care-friend-portrait${dancing ? " dancing" : ""}`} aria-hidden="true">{pickles?.emoji}</div>
            <div className="zoo-care-friend-copy">
              <p className="zoo-district-eyebrow">Your first friend</p>
              <div className="zoo-care-name-row">
                <h4 id="pickles-corner-title">{possessiveName(pickles?.name)} corner</h4>
                {!editingName && <button type="button" onClick={() => { setNameDraft(pickles?.name || ""); setEditingName(true); }}>Rename</button>}
              </div>

              {editingName && (
                <form className="zoo-care-name-form" onSubmit={saveName}>
                  <label htmlFor="zoo-pickles-name">Friend's name</label>
                  <input id="zoo-pickles-name" value={nameDraft} maxLength="24" onChange={(event) => setNameDraft(event.target.value)} />
                  <button type="submit" disabled={!nameDraft.trim()}>Save name</button>
                  <button type="button" onClick={() => setEditingName(false)}>Cancel</button>
                </form>
              )}

              <p>{pickles?.name} grows whenever practice earns XP. Missing a day never makes a friend sad or weaker.</p>
              <div className="zoo-care-progress-row">
                <div className="zoo-care-bar-track" role="progressbar" aria-label={`${pickles?.name} growth progress`} aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
                  <div className="zoo-care-bar-fill" style={{ width: "65%" }} />
                </div>
                <span>13 / 20 XP to next stage</span>
              </div>
              <button type="button" className={`zoo-care-dance${dancing ? " active" : ""}`} onClick={toggleDance}>
                {dancing ? "Stop the dance" : `Play for ${pickles?.name}`}
              </button>
              <small>Visual-only in this sandbox—no microphone opens.</small>
            </div>
          </section>

          <section className="zoo-care-collection" aria-labelledby="zoo-collection-title">
            <div className="zoo-care-collection-heading">
              <div><p className="zoo-district-eyebrow">Egg nest</p><h4 id="zoo-collection-title">Your collection</h4></div>
              <div className="zoo-care-eggs">
                <span>{eggCount} unhatched egg{eggCount === 1 ? "" : "s"}</span>
                <button type="button" disabled={eggCount === 0} onClick={hatchEgg}>Hatch one</button>
              </div>
            </div>

            <div className="zoo-care-collection-grid">
              {collection.map((group) => (
                <article className={`zoo-care-creature stage-${group.stage}`} key={group.id}>
                  <span className="zoo-care-creature-emoji" aria-hidden="true">{group.emoji}</span>
                  <strong>{group.name}</strong>
                  <span>{FOUNDING_FRIEND_STAGES[group.stage]}</span>
                  {group.count > 1 && <b>×{group.count}</b>}
                  {canMergeFoundingFriend(group) && (
                    <button type="button" onClick={() => mergePair(group)}>Merge matching pair</button>
                  )}
                </article>
              ))}
            </div>
          </section>

          <div className="zoo-care-status" role="status" aria-live="polite">
            <strong>{careMessage}</strong>
            <span>Refresh restores the original mock collection. No student or pet record is changed.</span>
          </div>
        </div>
      )}
    </section>
  );
}

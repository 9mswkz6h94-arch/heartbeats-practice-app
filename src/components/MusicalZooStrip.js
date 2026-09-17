import React, { useEffect, useRef, useState } from "react";
import { getCharacter } from "../lib/characterRegistry";
import {
  clearCharacterFromHabitat,
  createHabitatResidency,
  placeCharacterInHabitat,
  resetHabitatResidency,
} from "../lib/habitatPlacement";
import { RAINBOW_NOTE_GARDEN_ID } from "../lib/zooRewards";
import HabitatNPCWorld from "./HabitatNPCWorld";
import MelodyMeadow from "./MelodyMeadow";
import RhythmRiverbank from "./RhythmRiverbank";
import StickerBook from "./StickerBook";
import ZooFoundingFriendsCare from "./ZooFoundingFriendsCare";
import ZooMap, { zooDestinations } from "./ZooMap";
import "./MusicalZooStrip.css";

const reviewVisitors = [
  { id: "friend-panda", emoji: "🐼", name: "Panda pal", owner: "Approved friend", className: "pet-friend-one" },
  { id: "friend-owl", emoji: "🦉", name: "Owl pal", owner: "Approved friend", className: "pet-friend-two" },
];

const reviewFoundingFriendSeeds = [
  { id: "pickles", emoji: "🐉", name: "Pickles", stage: "Growing" },
  { id: "turtle", emoji: "🐢", name: "Turtle", stage: "Growing" },
  { id: "fox", emoji: "🦊", name: "Fox", stage: "Full grown" },
];

const reviewHabitatResidency = {
  meadow: ["riffin", null],
  riverbank: ["pickles", "turtle", "fox", null],
};

const defaultMusicalZooFriends = [getCharacter("riffin")].filter(Boolean);

export default function MusicalZooStrip({
  meadowDecorations,
  riverbankUnlock,
  onPlaceMeadowDecoration,
  onRemoveMeadowDecoration,
  selectedCompanionId = "riffin",
  onCompanionChange,
  onCompanionResponse,
  visitors = reviewVisitors,
  initialFoundingFriends = reviewFoundingFriendSeeds,
  initialResidency = reviewHabitatResidency,
  availableDestinationIds,
  careContent,
  onResidencyChange,
  musicalZooFriends = defaultMusicalZooFriends,
  stickerPages,
}) {
  const [expanded, setExpanded] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [selectedVisitorIds, setSelectedVisitorIds] = useState(visitors.map((visitor) => visitor.id));
  const [delivery, setDelivery] = useState(null);
  const [foundingFriends, setFoundingFriends] = useState(() => initialFoundingFriends.map((friend) => ({ ...friend })));
  const [habitatResidency, setHabitatResidency] = useState(() => createHabitatResidency(initialResidency));
  const [activeDestination, setActiveDestination] = useState("map");
  const mapHeadingRef = useRef(null);
  const destinationHeadingRef = useRef(null);
  const hasNavigatedRef = useRef(false);
  const riffin = getCharacter("riffin");
  const companionChoices = [
    ...musicalZooFriends.map((friend) => ({ ...friend, companionType: "Musical Zoo friend" })),
    ...foundingFriends.map((friend) => ({ ...friend, companionType: "Founding Friend" })),
  ];
  const selectedCompanion = companionChoices.find((companion) => companion.id === selectedCompanionId)
    || companionChoices[0];
  const stickerCharacter = selectedCompanion?.stickers?.length
    ? selectedCompanion
    : musicalZooFriends.find((friend) => friend.stickers?.length);
  const companionStickers = stickerCharacter?.stickers || [];
  const commonsResidents = [
    selectedCompanion ? { ...selectedCompanion, worldRole: "Your companion" } : null,
    ...visitors.map((visitor) => ({ ...visitor, worldRole: "Approved visitor" })),
  ].filter(Boolean);
  const meadowReward = meadowDecorations?.find((decoration) => decoration.id === RAINBOW_NOTE_GARDEN_ID);
  const currentDestination = zooDestinations.find((destination) => destination.id === activeDestination);
  const destinationActive = expanded && activeDestination !== "map";

  useEffect(() => {
    if (!expanded || !hasNavigatedRef.current) return;
    const heading = activeDestination === "map" ? mapHeadingRef.current : destinationHeadingRef.current;
    heading?.focus();
  }, [activeDestination, expanded]);

  useEffect(() => {
    onResidencyChange?.(habitatResidency);
  }, [habitatResidency, onResidencyChange]);

  const renameFoundingFriend = (friendId, name) => {
    setFoundingFriends((current) => current.map((friend) => (
      friend.id === friendId ? { ...friend, name } : friend
    )));
    if (selectedCompanionId === friendId) {
      const friend = foundingFriends.find((candidate) => candidate.id === friendId);
      onCompanionChange?.({ ...friend, name, companionType: "Founding Friend" });
    }
  };

  const toggleZoo = () => {
    setExpanded((current) => {
      if (current) {
        setInboxOpen(false);
        setActiveDestination("map");
        hasNavigatedRef.current = false;
      }
      return !current;
    });
  };

  const openDestination = (destinationId) => {
    if (destinationId === "riverbank" && !riverbankUnlock?.unlocked) return;
    hasNavigatedRef.current = true;
    setInboxOpen(false);
    setActiveDestination(destinationId);
  };

  const returnToMap = () => {
    hasNavigatedRef.current = true;
    setActiveDestination("map");
  };

  const placeHabitatCharacter = (habitatId, slotIndex, characterId) => {
    setHabitatResidency((current) => placeCharacterInHabitat(current, habitatId, slotIndex, characterId));
  };

  const clearHabitatCharacter = (habitatId, slotIndex) => {
    setHabitatResidency((current) => clearCharacterFromHabitat(current, habitatId, slotIndex));
  };

  const resetHabitat = (habitatId) => {
    setHabitatResidency((current) => resetHabitatResidency(
      current,
      habitatId,
      initialResidency[habitatId],
    ));
  };

  const toggleInbox = () => {
    setDelivery(null);
    setExpanded(true);
    setInboxOpen((current) => !current);
  };

  const toggleVisitor = (visitorId) => {
    setSelectedVisitorIds((current) => (
      current.includes(visitorId)
        ? current.filter((id) => id !== visitorId)
        : [...current, visitorId]
    ));
  };

  const sendSticker = (sticker) => {
    const recipientCount = selectedVisitorIds.length;
    if (!recipientCount) return;

    const recipientLabel = recipientCount === visitors.length
      ? "both studio friends"
      : `${recipientCount} studio friend`;
    const status = `${sticker.purpose} sticker sent to ${recipientLabel}. This sandbox did not send a real notification.`;

    setDelivery({ sticker, characterName: stickerCharacter?.name || "Your companion", status });
    setInboxOpen(false);
    onCompanionResponse?.(`Delivered! Your ${sticker.phrase.toLowerCase()} sticker is on its way.`);
  };

  return (
    <section
      className={`musical-zoo${expanded ? " expanded" : ""}${destinationActive ? " destination-active" : ""}`}
      aria-labelledby="musical-zoo-title"
    >
      <header className="musical-zoo-header">
        <div>
          <p className="musical-zoo-kicker">Your character world</p>
          <h2 id="musical-zoo-title">The Musical Zoo</h2>
          <p className="musical-zoo-summary">
            {visitors.length
              ? "Friends visit the Commons stage. New venues appear naturally as your Zoo grows."
              : "Your unlocked friends roam here. New venues appear naturally as your Zoo grows."}
          </p>
        </div>
        <button
          type="button"
          className="musical-zoo-toggle"
          aria-expanded={expanded}
          onClick={toggleZoo}
        >
          {expanded ? "Close zoo" : "Explore zoo"}
        </button>
      </header>

      {!destinationActive && (
        <HabitatNPCWorld
          active
          compact
          habitatId="commons"
          mapLabel="Universal Zoo Commons top-down map"
          residents={commonsResidents}
          toolbarAction={visitors.length ? (
            <button
              type="button"
              className="zoo-commons-sign"
              aria-expanded={inboxOpen}
              aria-controls="zoo-practice-postbox"
              onClick={toggleInbox}
            >
              <strong>{visitors.length} practice note{visitors.length === 1 ? "" : "s"}</strong>
              <span>{inboxOpen ? "Hide practice postbox" : "Waiting when you want them"}</span>
            </button>
          ) : null}
          worldEyebrow="Music Town commons"
          worldTitle={visitors.length
            ? `Your companion + ${visitors.length} approved visitor${visitors.length === 1 ? "" : "s"}`
            : "Your companion in the Commons"}
        />
      )}

      {expanded && (
        <div className={`zoo-districts${destinationActive ? " destination-active" : ""}`}>
          {inboxOpen && visitors.length > 0 && !destinationActive && (
            <section className="zoo-practice-postbox" id="zoo-practice-postbox" aria-labelledby="zoo-postbox-title">
              <div className="zoo-postbox-heading">
                <div>
                  <p className="zoo-district-eyebrow">Friend encouragement · recent, not live</p>
                  <h3 id="zoo-postbox-title">Two practice notes are waiting</h3>
                  <p>These approved studio friends practiced recently. Their songs, schedules, duration, and online status stay private.</p>
                </div>
                <button type="button" className="zoo-postbox-later" onClick={() => setInboxOpen(false)}>Not now</button>
              </div>

              <fieldset className="zoo-friend-picker">
                <legend>Who should receive a sticker?</legend>
                {visitors.map((visitor) => (
                  <label className="zoo-friend-option" key={visitor.id}>
                    <input
                      type="checkbox"
                      checked={selectedVisitorIds.includes(visitor.id)}
                      onChange={() => toggleVisitor(visitor.id)}
                    />
                    <span className="zoo-friend-avatar" aria-hidden="true">{visitor.emoji}</span>
                    <span><strong>{visitor.name}</strong><small>Practiced recently</small></span>
                  </label>
                ))}
              </fieldset>

              <div className="zoo-sticker-picker">
                <div className="zoo-sticker-heading">
                  <h4>Choose one of {stickerCharacter?.name || "your companion"}’s stickers</h4>
                  <span>{selectedVisitorIds.length || "No"} selected</span>
                </div>
                <div className="zoo-sticker-options">
                  {companionStickers.map((sticker) => (
                    <button
                      type="button"
                      key={sticker.id}
                      disabled={!selectedVisitorIds.length}
                      onClick={() => sendSticker(sticker)}
                    >
                      <img
                        className={sticker.status === "pixel-preview" ? "is-pixel-preview" : undefined}
                        src={sticker.image}
                        alt={sticker.alt}
                        width="92"
                        height="92"
                      />
                      <span><strong>{sticker.purpose}</strong><small>{sticker.phrase}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {delivery && !destinationActive && (
            <div className="zoo-delivery-status" role="status">
              <img src={delivery.sticker.image} alt="" width="48" height="48" />
              <span><strong>{delivery.characterName} delivered it.</strong>{delivery.status}</span>
              <button type="button" onClick={toggleInbox}>Send another</button>
            </div>
          )}

          {activeDestination === "map" && (
            <ZooMap
              meadowDecoration={meadowReward}
              riverbankUnlock={riverbankUnlock}
              residency={habitatResidency}
              onSelectDestination={openDestination}
              headingRef={mapHeadingRef}
              availableDestinationIds={availableDestinationIds}
            />
          )}

          <section
            className="zoo-destination-view"
            id="zoo-destination-meadow"
            hidden={activeDestination !== "meadow"}
          >
            <div className="zoo-destination-toolbar">
              <button type="button" onClick={returnToMap}>← Zoo map</button>
              <div>
                <span>Now visiting</span>
                <h3 ref={activeDestination === "meadow" ? destinationHeadingRef : null} tabIndex="-1">{currentDestination?.name}</h3>
              </div>
            </div>
            <MelodyMeadow
              active={activeDestination === "meadow"}
              riffin={riffin}
              musicalZooFriends={musicalZooFriends}
              foundingFriends={foundingFriends}
              residency={habitatResidency}
              onPlaceCharacter={placeHabitatCharacter}
              onClearCharacter={clearHabitatCharacter}
              onResetHabitat={resetHabitat}
              decorations={meadowDecorations}
              onPlaceDecoration={onPlaceMeadowDecoration}
              onRemoveDecoration={onRemoveMeadowDecoration}
            />
          </section>

          <section
            className="zoo-destination-view"
            id="zoo-destination-riverbank"
            hidden={activeDestination !== "riverbank"}
          >
            <div className="zoo-destination-toolbar riverbank-toolbar">
              <button type="button" onClick={returnToMap}>← Zoo map</button>
              <div>
                <span>Now visiting</span>
                <h3 ref={activeDestination === "riverbank" ? destinationHeadingRef : null} tabIndex="-1">{currentDestination?.name}</h3>
              </div>
            </div>
            <RhythmRiverbank
              active={activeDestination === "riverbank"}
              companions={companionChoices}
              residency={habitatResidency}
              onPlaceCharacter={placeHabitatCharacter}
              onClearCharacter={clearHabitatCharacter}
              onResetHabitat={resetHabitat}
            />
          </section>

          <section
            className="zoo-destination-view"
            id="zoo-destination-cabin"
            hidden={activeDestination !== "cabin"}
          >
            <div className="zoo-destination-toolbar">
              <button type="button" onClick={returnToMap}>← Zoo map</button>
              <div>
                <span>Now visiting</span>
                <h3 ref={activeDestination === "cabin" ? destinationHeadingRef : null} tabIndex="-1">{currentDestination?.name}</h3>
              </div>
            </div>
            {careContent || (
              <ZooFoundingFriendsCare
                friends={foundingFriends}
                companions={companionChoices}
                selectedCompanionId={selectedCompanion?.id}
                onSelectCompanion={onCompanionChange}
                onRenameFriend={renameFoundingFriend}
                initiallyOpen
              />
            )}
          </section>

          <section
            className="zoo-destination-view"
            id="zoo-destination-museum"
            hidden={activeDestination !== "museum"}
          >
            <div className="zoo-destination-toolbar">
              <button type="button" onClick={returnToMap}>← Zoo map</button>
              <div>
                <span>Now visiting</span>
                <h3 ref={activeDestination === "museum" ? destinationHeadingRef : null} tabIndex="-1">{currentDestination?.name}</h3>
              </div>
            </div>
            <article className="zoo-district zoo-museum">
              <div className="zoo-district-heading">
                <div><p>Legacy Grove</p><h3>Founding Friends Museum</h3></div>
                <span>Static exhibits</span>
              </div>
              <p className="zoo-museum-note">Original friends stay displayed with all of their history and progress.</p>
              <div className="zoo-museum-exhibits">
                {foundingFriends.map((friend) => (
                  <div className="zoo-exhibit" key={friend.id}>
                    <span className="zoo-exhibit-emoji" aria-hidden="true">{friend.emoji}</span>
                    <strong>{friend.name}</strong>
                    <span>{friend.stage}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section
            className="zoo-destination-view"
            id="zoo-destination-stickers"
            hidden={activeDestination !== "stickers"}
          >
            <div className="zoo-destination-toolbar">
              <button type="button" onClick={returnToMap}>← Zoo map</button>
              <div>
                <span>Now visiting</span>
                <h3 ref={activeDestination === "stickers" ? destinationHeadingRef : null} tabIndex="-1">{currentDestination?.name}</h3>
              </div>
            </div>
            <StickerBook initiallyOpen pages={stickerPages} />
          </section>
        </div>
      )}
    </section>
  );
}

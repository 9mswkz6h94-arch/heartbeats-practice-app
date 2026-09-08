import React, { useEffect, useMemo, useState } from "react";
import { getHabitatGreeting } from "../lib/habitatGreetings";
import { getHabitatEncounter, getHabitatMotionFrame } from "../lib/habitatRoaming";
import "./HabitatNPCWorld.css";

const mapProps = {
  commons: [
    { id: "commons-gate", icon: "♫", label: "Zoo Commons gate" },
    { id: "fountain", icon: "≈", label: "Commons fountain" },
    { id: "commons-tree", icon: "♣", label: "Commons shade tree" },
  ],
  meadow: [
    { id: "tree-one", icon: "♣", label: "Shade tree" },
    { id: "pond", icon: "≈", label: "Tiny pond" },
    { id: "sign", icon: "♫", label: "Music trail sign" },
  ],
  riverbank: [
    { id: "bridge", icon: "═", label: "Wooden bridge" },
    { id: "reeds", icon: "♩", label: "River reeds" },
    { id: "stone", icon: "●", label: "Rhythm stone" },
    { id: "flowers", icon: "✦", label: "River flowers" },
  ],
};

export default function HabitatNPCWorld({
  active = false,
  compact = false,
  greetingsEnabled = false,
  habitatId = "meadow",
  mapLabel,
  residents = [],
  scenery = [],
  toolbarAction,
  worldEyebrow = "Living habitat",
  worldTitle,
}) {
  const [tick, setTick] = useState(0);
  const [roaming, setRoaming] = useState(true);
  const [greeting, setGreeting] = useState(null);
  const encounter = getHabitatEncounter(habitatId, tick, residents.length);
  const encounterNames = encounter?.residentIndexes
    .map((index) => residents[index]?.name)
    .filter(Boolean);
  const props = mapProps[habitatId] || mapProps.meadow;
  const frames = useMemo(
    () => residents.map((resident, index) => ({
      resident,
      frame: getHabitatMotionFrame(habitatId, index, tick),
    })),
    [habitatId, residents, tick],
  );

  useEffect(() => {
    if (!active || !roaming || !residents.length) return undefined;
    const interval = window.setInterval(() => setTick((current) => current + 1), 900);
    return () => window.clearInterval(interval);
  }, [active, residents.length, roaming]);

  useEffect(() => {
    if (!greeting) return undefined;
    const timeout = window.setTimeout(() => setGreeting(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [greeting]);

  const greetResident = (resident, index) => {
    if (!greetingsEnabled) return;
    setGreeting({
      residentId: resident.id,
      residentName: resident.name,
      message: getHabitatGreeting(resident.id, tick + index),
    });
  };

  return (
    <section className={`habitat-world world-${habitatId}${compact ? " compact" : ""}${greetingsEnabled ? " greetings-enabled" : ""}${roaming && active ? " is-roaming" : ""}`} aria-labelledby={`${habitatId}-world-title`}>
      <header className="habitat-world-toolbar">
        <div>
          <p className="zoo-district-eyebrow">{worldEyebrow}</p>
          <h4 id={`${habitatId}-world-title`}>{worldTitle || `${residents.length} creature${residents.length === 1 ? "" : "s"} exploring`}</h4>
        </div>
        <div className="habitat-world-toolbar-actions">
          <button type="button" aria-pressed={roaming} onClick={() => setRoaming((current) => !current)}>
            {roaming ? "Pause creatures" : "Let them roam"}
          </button>
          {toolbarAction}
        </div>
      </header>

      <div className="habitat-tile-map" aria-label={mapLabel || `${habitatId === "riverbank" ? "Rhythm Riverbank" : "Melody Meadow"} top-down habitat map`}>
        <div className="habitat-ground-details" aria-hidden="true">
          <span className="habitat-grass-tuft tuft-one">〃</span>
          <span className="habitat-grass-tuft tuft-two">〃</span>
          <span className="habitat-grass-tuft tuft-three">〃</span>
          <span className="habitat-grass-tuft tuft-four">〃</span>
          <span className="habitat-wildflower wildflower-one">✦</span>
          <span className="habitat-wildflower wildflower-two">✦</span>
          <span className="habitat-pebble pebble-one" />
          <span className="habitat-pebble pebble-two" />
        </div>
        <div className="habitat-map-path" aria-hidden="true" />
        {props.map((prop) => (
          <span className={`habitat-map-prop prop-${prop.id}`} role="img" aria-label={prop.label} key={prop.id}>
            <span aria-hidden="true">{prop.icon}</span>
          </span>
        ))}
        {scenery.map((item) => (
          <span
            className={`habitat-map-scenery scenery-${item.placedSpotId}`}
            aria-label={`${item.name} scenery`}
            key={item.id}
          >
            <b aria-hidden="true">{item.icon}</b>
            <small>{item.name}</small>
          </span>
        ))}
        {frames.map(({ resident, frame }, index) => {
          const meeting = encounter?.residentIndexes.includes(index);
          const ResidentElement = greetingsEnabled ? "button" : "div";
          const roamingImage = resident.roamingImage || resident.assets?.zooSmall?.image || resident.image;
          return (
            <ResidentElement
              className={`habitat-npc facing-${frame.facing}${meeting ? " meeting" : ""}${greeting?.residentId === resident.id ? " greeting" : ""}${greetingsEnabled ? " interactive" : ""}`}
              key={resident.id}
              style={{ "--npc-x": `${frame.x}%`, "--npc-y": `${frame.y}%`, zIndex: 5 + Math.round(frame.y) }}
              aria-label={greetingsEnabled ? `Say hello to ${resident.name}` : `${resident.name}, roaming in the habitat`}
              onClick={greetingsEnabled ? () => greetResident(resident, index) : undefined}
              type={greetingsEnabled ? "button" : undefined}
            >
              <span className="habitat-npc-portrait">
                {roamingImage
                  ? <img src={roamingImage} alt="" width="48" height="48" />
                  : <span aria-hidden="true">{resident.emoji}</span>}
              </span>
              <strong>{resident.name}</strong>
              {resident.worldRole && <small>{resident.worldRole}</small>}
              {greeting?.residentId === resident.id && <span className="habitat-npc-hello" aria-hidden="true">♪ hi!</span>}
            </ResidentElement>
          );
        })}
        {encounter && encounterNames?.length === 2 && (
          <div className="habitat-encounter" aria-live="off">
            <span aria-hidden="true">{encounter.signal}</span>
            <strong>{encounterNames.join(" + ")}</strong>
          </div>
        )}
      </div>

      <footer className="habitat-world-status" aria-live="off">
        <span className={`habitat-world-indicator${roaming && active ? " active" : ""}`} aria-hidden="true" />
        {greeting ? (
          <span role="status" aria-live="polite"><strong>{greeting.residentName} says hello.</strong>{greeting.message} Nothing to collect—just a friendly moment.</span>
        ) : encounter && encounterNames?.length === 2 ? (
          <span><strong>{encounter.title}</strong>{encounter.description}</span>
        ) : roaming ? (
          habitatId === "commons"
            ? <span><strong>The Commons is alive.</strong>Your companion and approved visitors choose their own paths.</span>
            : <span><strong>The habitat is alive.</strong>{greetingsEnabled ? "Tap a friend for a tiny hello, or simply watch them explore." : "Friends choose their own little paths and sometimes meet along the way."}</span>
        ) : (
          <span><strong>Creatures are resting.</strong>Their places stay right here until you let them roam again.</span>
        )}
      </footer>
    </section>
  );
}

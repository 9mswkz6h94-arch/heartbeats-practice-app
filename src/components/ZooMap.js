import React from "react";
import { getMeadowDecorationStatus } from "../lib/zooRewards";
import "./ZooMap.css";

export const zooDestinations = [
  {
    id: "riverbank",
    eyebrow: "Riverside rhythm venue",
    name: "Rhythm Riverbank",
    description: "A waterside stage where friends roam, cross the bridge, and meet along the river.",
    icon: "≈",
    detail: "Riverside resident stage",
    venue: {
      name: "Rhythm Boathouse",
      sign: "RHYTHM",
      facade: "boathouse",
    },
  },
  {
    id: "meadow",
    eyebrow: "Open-air melody venue",
    name: "Melody Meadow",
    description: "An open-air stage to arrange your friends, then watch them roam and meet.",
    icon: "♫",
    detail: "Open-air resident stage",
    venue: {
      name: "Meadow Amphitheater",
      sign: "MELODY",
      facade: "amphitheater",
    },
  },
  {
    id: "cabin",
    eyebrow: "Backstage workshop",
    name: "Caretaker Cabin",
    description: "A cozy backstage room to visit friends, name them, hatch eggs, and see their growth.",
    icon: "⌂",
    detail: "Care, eggs, and names",
    venue: {
      name: "Backstage Workshop",
      sign: "CARE",
      facade: "workshop",
    },
  },
  {
    id: "museum",
    eyebrow: "Founding Friends hall",
    name: "Founding Friends Museum",
    description: "A quiet hall for original characters in permanent, motionless displays.",
    icon: "◆",
    detail: "3 static exhibits",
    venue: {
      name: "Hall of First Songs",
      sign: "HALL",
      facade: "hall",
    },
  },
  {
    id: "stickers",
    eyebrow: "Keepsake print shop",
    name: "Sticker Book",
    description: "A little print shop for encouragement stickers your family and studio friends shared.",
    icon: "♥",
    detail: "Private sticker pages",
    venue: {
      name: "Poster Press",
      sign: "PRINT",
      facade: "print-shop",
    },
  },
];

function ZooLandmark({ destination }) {
  return (
    <span className={`zoo-landmark-scene venue-facade-${destination.venue.facade}`} aria-hidden="true">
      <span className="zoo-landmark-shadow" />
      <span className="zoo-landmark-building">
        <span className="zoo-landmark-sign">{destination.venue.sign}</span>
        <span className="zoo-landmark-symbol">{destination.icon}</span>
        <span className="zoo-landmark-door" />
      </span>
      <span className="zoo-landmark-spark spark-one">·</span>
      <span className="zoo-landmark-spark spark-two">·</span>
    </span>
  );
}

export default function ZooMap({
  meadowDecoration,
  riverbankUnlock,
  residency = {},
  onSelectDestination,
  headingRef,
  availableDestinationIds,
}) {
  const meadowReward = getMeadowDecorationStatus(meadowDecoration);
  const visibleDestinations = zooDestinations.filter((destination) => (
    (!availableDestinationIds || availableDestinationIds.includes(destination.id))
    && (destination.id !== "riverbank" || riverbankUnlock?.unlocked)
  ));

  return (
    <nav className="zoo-map" aria-labelledby="zoo-map-title">
      <div className="zoo-map-heading">
        <div>
          <p className="zoo-district-eyebrow">Music Town · choose a place</p>
          <h3 id="zoo-map-title" ref={headingRef} tabIndex="-1">Zoo Map</h3>
          <p>Every building has a different way to make music.</p>
        </div>
        <span>Music Town</span>
      </div>

      <div className="zoo-overworld" aria-label="A top-down map of the Music Town venues you can visit">
        <div className="zoo-overworld-terrain" aria-hidden="true">
          <span className="zoo-overworld-river" />
          <span className="zoo-overworld-bridge" />
          <span className="zoo-overworld-path path-west" />
          <span className="zoo-overworld-path path-east" />
          <span className="zoo-overworld-path path-south" />
          <span className="zoo-pixel-tree tree-one" />
          <span className="zoo-pixel-tree tree-two" />
          <span className="zoo-pixel-tree tree-three" />
          <span className="zoo-pixel-tree tree-four" />
          <span className="zoo-pixel-flower flowers-one">✦</span>
          <span className="zoo-pixel-flower flowers-two">✦</span>
          <span className="zoo-pixel-stone stone-one" />
          <span className="zoo-pixel-stone stone-two" />
          <span className="zoo-commons-marker">
            <b>≈</b>
            <small>Commons</small>
          </span>
        </div>

        {visibleDestinations.map((destination) => {
          const habitatSlots = residency[destination.id];
          const destinationDetail = Array.isArray(habitatSlots)
            ? destination.id === "meadow"
              ? "Melody residents play here"
              : "Rhythm residents play here"
            : destination.detail;
          return (
          <button
            type="button"
            className={`zoo-map-card destination-${destination.id}`}
            key={destination.id}
            onClick={() => onSelectDestination(destination.id)}
          >
            <ZooLandmark destination={destination} />
            <span className="zoo-map-copy">
              <small>{destination.eyebrow}</small>
              <strong>{destination.name}</strong>
              <span className="zoo-map-venue">{destination.venue.name}</span>
              <span className="zoo-map-description">{destination.description}</span>
              {destination.id === "meadow" && meadowReward && meadowReward.state !== "locked" && (
                <span className={`zoo-map-reward state-${meadowReward.state}`}>
                  <b aria-hidden="true">{meadowReward.state === "placed" ? "✓" : "★"}</b>
                  {meadowReward.label}
                </span>
              )}
            </span>
            <span className="zoo-map-detail">{destinationDetail}</span>
            <span className="zoo-map-arrow" aria-hidden="true">Visit →</span>
          </button>
          );
        })}
      </div>

      <p className="zoo-map-note">New places appear here naturally when they are ready. Enjoy the places you have.</p>
    </nav>
  );
}

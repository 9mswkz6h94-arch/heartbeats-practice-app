import React from "react";
import { getFilledSlotCount } from "../lib/habitatPlacement";
import { getMeadowDecorationStatus } from "../lib/zooRewards";
import "./ZooMap.css";

export const zooDestinations = [
  {
    id: "riverbank",
    eyebrow: "River habitat",
    name: "Rhythm Riverbank",
    description: "Watch friends roam, cross the bridge, and meet along the river.",
    icon: "≈",
    detail: "Owned habitat homes",
  },
  {
    id: "meadow",
    eyebrow: "Your habitat",
    name: "Melody Meadow",
    description: "Arrange your friends, then watch them roam and meet on their own.",
    icon: "♫",
    detail: "Owned habitat homes",
  },
  {
    id: "cabin",
    eyebrow: "Care & collection",
    name: "Caretaker Cabin",
    description: "Visit your friends, name them, hatch eggs, and see their growth.",
    icon: "⌂",
    detail: "Founding Friends",
  },
  {
    id: "museum",
    eyebrow: "Legacy Grove",
    name: "Founding Friends Museum",
    description: "See the original characters in their permanent, motionless displays.",
    icon: "◆",
    detail: "3 static exhibits",
  },
  {
    id: "stickers",
    eyebrow: "Private keepsakes",
    name: "Sticker Book",
    description: "Browse the encouragement stickers your family and studio friends shared.",
    icon: "♥",
    detail: "Private sticker pages",
  },
];

function ZooLandmark({ destination }) {
  return (
    <span className="zoo-landmark-scene" aria-hidden="true">
      <span className="zoo-landmark-shadow" />
      <span className="zoo-landmark-building">
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
          <p className="zoo-district-eyebrow">Choose where to visit</p>
          <h3 id="zoo-map-title" ref={headingRef} tabIndex="-1">Zoo Map</h3>
          <p>Each part of your character world has its own place.</p>
        </div>
        <span>Your places</span>
      </div>

      <div className="zoo-overworld" aria-label="A top-down map of the Zoo places you can visit">
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
            ? `${getFilledSlotCount(habitatSlots)} of ${habitatSlots.length} homes filled`
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

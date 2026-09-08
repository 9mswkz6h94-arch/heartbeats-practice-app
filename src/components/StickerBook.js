import React, { useMemo, useState } from "react";
import {
  clampStickerPageIndex,
  filterStickerPages,
  formatStickerCopyCount,
  mockStickerPages,
  stickerBookFilters,
} from "../lib/stickerBook";
import "./StickerBook.css";

export default function StickerBook({ initiallyOpen = false, pages: stickerPages = mockStickerPages }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(
    () => filterStickerPages(stickerPages, purposeFilter, characterFilter),
    [stickerPages, purposeFilter, characterFilter],
  );
  const characterPacks = useMemo(() => [
    { id: "all", label: "All characters" },
    ...Array.from(new Map(stickerPages.map((item) => [
      item.characterId,
      { id: item.characterId, label: item.characterName },
    ])).values()),
  ], [stickerPages]);
  const safePageIndex = clampStickerPageIndex(pageIndex, pages.length);
  const page = pages[safePageIndex];
  const deliveryCount = stickerPages.reduce((total, stickerPage) => total + stickerPage.deliveries.length, 0);

  const choosePurpose = (purpose) => {
    setPurposeFilter(purpose);
    setPageIndex(0);
  };

  const chooseCharacter = (event) => {
    setCharacterFilter(event.target.value);
    setPageIndex(0);
  };

  const movePage = (direction) => {
    setPageIndex((current) => clampStickerPageIndex(current + direction, pages.length));
  };

  return (
    <section className={`zoo-sticker-book${open ? " open" : ""}`} aria-labelledby="sticker-book-title">
      <header className="sticker-book-header">
        <div>
          <p className="zoo-district-eyebrow">Your private keepsakes</p>
          <h3 id="sticker-book-title">Sticker Book</h3>
          <p>Every sticker stays here with the day it arrived. There is never a reply you have to send.</p>
        </div>
        <button
          type="button"
          className="sticker-book-toggle"
          aria-expanded={open}
          aria-controls="sticker-book-pages"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Close sticker book" : "Open sticker book"}
        </button>
      </header>

      {!open && (
        <div className="sticker-book-preview" aria-label={`${stickerPages.length} sticker pages with ${deliveryCount} saved deliveries`}>
          <div className="sticker-book-preview-stack" aria-hidden="true">
            {stickerPages.map((stickerPage, index) => (
              <img
                key={stickerPage.id}
                src={stickerPage.image}
                alt=""
                width="64"
                height="64"
                style={{ "--preview-index": index }}
              />
            ))}
          </div>
          <span><strong>{stickerPages.length} sticker pages</strong><small>Saved privately for you</small></span>
        </div>
      )}

      {open && (
        <div className="sticker-book-body" id="sticker-book-pages">
          <div className="sticker-book-tools">
            <fieldset className="sticker-book-filters">
              <legend>Show stickers for</legend>
              <div>
                {stickerBookFilters.map((filter) => (
                  <button
                    type="button"
                    key={filter.id}
                    aria-pressed={purposeFilter === filter.id}
                    onClick={() => choosePurpose(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="sticker-book-character-filter">
              <span>Character pack</span>
              <select value={characterFilter} onChange={chooseCharacter}>
                {characterPacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.label}</option>)}
              </select>
            </label>
          </div>

          {page ? (
            <div className="sticker-book-spread" aria-live="polite" aria-atomic="true">
              <article className="sticker-book-page">
                <p className="sticker-book-pack-label">{page.characterName} · {page.purpose}</p>
                <div className="sticker-copy-stack" aria-label={`${page.deliveries.length} saved copies of ${page.title}`}>
                  {page.deliveries.slice(0, 3).map((delivery, index) => (
                    <img
                      key={delivery.id}
                      src={page.image}
                      alt={index === 0 ? page.imageAlt : ""}
                      width="128"
                      height="128"
                      style={{ "--copy-index": index }}
                    />
                  ))}
                </div>
                <h4>{page.title}</h4>
                <p>{page.description}</p>
                <strong className="sticker-copy-count">{formatStickerCopyCount(page.deliveries.length)}</strong>
              </article>

              <section className="sticker-delivery-history" aria-labelledby={`sticker-history-${page.id}`}>
                <div className="sticker-history-heading">
                  <p>Saved arrivals</p>
                  <h4 id={`sticker-history-${page.id}`}>Who shared this with you</h4>
                </div>
                <ol>
                  {page.deliveries.map((delivery) => (
                    <li key={delivery.id}>
                      <span className="sticker-history-mark" aria-hidden="true">♥</span>
                      <div>
                        <strong>{delivery.sender}</strong>
                        <span>{delivery.senderRole}</span>
                        <time dateTime={delivery.dateTime}>{delivery.date}</time>
                        {delivery.note && (
                          <blockquote>
                            <small>Private family note</small>
                            <p>“{delivery.note}”</p>
                          </blockquote>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          ) : (
            <div className="sticker-book-empty" role="status">
              <strong>No stickers in this view yet.</strong>
              <span>Try another sticker type or character pack.</span>
            </div>
          )}

          <nav className="sticker-book-navigation" aria-label="Sticker book pages">
            <button type="button" disabled={!page || safePageIndex === 0} onClick={() => movePage(-1)}>← Previous</button>
            <span>{page ? `Page ${safePageIndex + 1} of ${pages.length}` : "No pages"}</span>
            <button type="button" disabled={!page || safePageIndex === pages.length - 1} onClick={() => movePage(1)}>Next →</button>
          </nav>

          <footer className="sticker-book-privacy">
            <strong>Made for encouragement, not scores.</strong>
            <span>Only you, your family, and your studio team can see this book. There are no rankings, read receipts, or reply reminders.</span>
          </footer>
        </div>
      )}
    </section>
  );
}

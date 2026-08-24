import { STORAGE_KEY, MAX_LENGTH, canAsk, canShare, nextSingleIndex, normalizeNote, readingTime, guideResponse } from "./app-core.mjs";

const SEED = {
  id: "seed-001",
  text: `I know im so right, because I've been so wrong so many times. Sometimes I feel like im a bad person and I know I can help it and I do. I dont want to be bad, angry, better off, higher, or even in charge. I have interests, likes, wants, but my want is to not to want to need them, and I do the same with any other feelings or ideas I might have. I guess I try to act like a second person who is the opposite, this shows me if its important. how do you know you want something if you haven't wanted to not have it, but not just saying it, actually do it.

Pretend its food if I want to not have it and dont I'll loose energy from malnutrition and get sick, so that tells me yes I need that. I dont want to be perfect tho, i dont think anyone ever will, while there is always something to learn, I will fuck up again, I will get it wrong, because getting it wrong, knowing, and not wanting to, then doing & seeing the difference, is what makes you know your right. but of course when any of any thing happens there's another person involved, so depending on their aspect and level, and energy, you can never actually prepare or know how to handle it, until you deal with that different sequence.

If your not getting it wrong your not learning, and if your not learning you think your right, then you get comfortable, if a drip is allowed more it will run, if it runs to much the pressure gets to much to slow it down.`,
};

const KEY = STORAGE_KEY;
const app = document.querySelector("#app");
let view = "crowd";
let commonsMode = "cards";
let singleIndex = 0;
let mapScale = 1;
let mapOffset = { x: 0, y: 0 };
let selectedMapNodeIndex = null;
let mapSearchQuery = "";

const MAP_POSITIONS = [[18, 26], [45, 18], [72, 28], [28, 65], [57, 56], [79, 70], [12, 79], [53, 84]];

function getMapEdges(count) {
  const baseEdges = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [6, 7], [5, 7]
  ];
  const edges = [];
  const edgeSet = new Set();
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const posI = i % MAP_POSITIONS.length;
      const posJ = j % MAP_POSITIONS.length;
      const isBase = baseEdges.some(([a, b]) => (a === posI && b === posJ) || (a === posJ && b === posI));
      const isSequential = j === i + 1;
      if ((isBase || isSequential) && Math.abs(i - j) <= 8) {
        const key = `${i}-${j}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push([i, j]);
        }
      }
    }
  }
  return edges;
}

function readStored() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter((entry) => entry && typeof entry.text === "string") : [];
  } catch {
    return [];
  }
}

function entries() {
  return [SEED, ...readStored()];
}

function saveEntry(text) {
  const next = [{ id: crypto.randomUUID?.() || String(Date.now()), text }, ...readStored()];
  localStorage.setItem(KEY, JSON.stringify(next));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function setRoute(route) {
  location.hash = route;
}

function writePage() {
  app.innerHTML = `
    <section class="hero">
      <div class="kicker">Write / listen / share</div>
      <h1>Put the learning here.</h1>
      <p class="lede">Write what you learned, how you learn, how you deal with something, or an idea for dealing with it. The public note carries the words, never a profile.</p>
    </section>
    <section class="write-layout">
      <section class="panel composer-panel">
        <div class="notice"><strong>A quiet prompt:</strong> describe the observation, method, experiment, decision, or idea. Your original words stay yours; the guide only helps you look more closely.</div>
        <div class="prompt-row" aria-label="Writing prompts">
          <button class="prompt" data-prompt="I learned that ">I learned…</button>
          <button class="prompt" data-prompt="A method that helps me is ">A method…</button>
          <button class="prompt" data-prompt="An experiment I tried was ">An experiment…</button>
          <button class="prompt" data-prompt="An idea someone else could test is ">An idea…</button>
        </div>
        <textarea id="composer" maxlength="${MAX_LENGTH}" aria-label="Learning note" placeholder="Write a concise learning observation…"></textarea>
        <div class="composer-meta">
          <span class="hint"><span id="count">0</span>/${MAX_LENGTH} · anonymous by design</span>
          <button class="primary" id="ask" disabled>Ask the guide</button>
        </div>
        <div id="ai" class="ai" hidden aria-live="polite"></div>
        <div class="composer-meta share-row" id="share-row" hidden>
          <span class="hint">Your original words stay intact. You decide what gets shared.</span>
          <button class="primary" id="share">Place note</button>
        </div>
      </section>
      <aside class="guide-rail" aria-label="Conversational writing guide">
        <div class="guide-orbit"><span class="guide-dot"></span><span class="guide-dot"></span><span class="guide-dot"></span></div>
        <div class="kicker">Private guide</div>
        <h2>Stay with what happened.</h2>
        <p>What are you trying to capture here? Something you learned, tried, noticed, or want to test?</p>
        <div class="guide-path"><span>notice</span><span>act</span><span>change</span><span>try next</span></div>
        <p class="hint">The guide will not diagnose, judge, rewrite, or turn a feeling into a public identity.</p>
      </aside>
    </section>`;

  const composer = document.querySelector("#composer");
  const count = document.querySelector("#count");
  const ask = document.querySelector("#ask");
  const ai = document.querySelector("#ai");
  const shareRow = document.querySelector("#share-row");
  const update = () => {
    count.textContent = composer.value.length.toLocaleString();
    ask.disabled = !canAsk(composer.value);
    shareRow.hidden = true;
  };
  composer.addEventListener("input", update);
  document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
    if (!composer.value.trim()) composer.value = button.dataset.prompt;
    composer.focus();
    update();
  }));
  ask.addEventListener("click", () => {
    const response = guideResponse(composer.value);
    ai.hidden = false;
    ai.dataset.tone = response.tone;
    ai.innerHTML = `<strong>Guide</strong><span class="guide-message">${escapeHtml(response.message)}</span><div class="guide-prompts" aria-label="Guide prompts">${response.prompts.map((prompt) => `<button class="prompt" data-guide-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}</div>`;
    ai.querySelectorAll("[data-guide-prompt]").forEach((button) => button.addEventListener("click", () => {
      const prefix = composer.value.trim() ? `${composer.value.trim()} ` : "";
      composer.value = `${prefix}${button.dataset.guidePrompt}`.slice(0, MAX_LENGTH);
      composer.focus();
      update();
    }));
    shareRow.hidden = false;
  });
  document.querySelector("#share").addEventListener("click", () => {
    const text = normalizeNote(composer.value);
    if (!canShare(text)) return;
    saveEntry(text);
    setRoute("commons");
  });
}

function card(entry, i, extra = "") {
  return `<article class="card ${extra}" data-card-index="${i}"><div class="card-label">Learning trace ${String(i + 1).padStart(2, "0")}</div><p>${escapeHtml(entry.text)}</p></article>`;
}

function cardsView(data) {
  if (view === "single") {
    const index = Math.min(singleIndex, data.length - 1);
    const entry = data[index];
    return `<section class="single-wrap" aria-live="polite">${card(entry, index, "single-card")}<div class="single-meta"><span>Learning Commons · ${readingTime(entry.text)} min read</span><span>${index + 1} of ${data.length}</span></div><div class="single-nav"><button class="secondary" data-single="prev" ${index === 0 ? "disabled" : ""}>Previous</button><button class="secondary" data-single="next" ${index === data.length - 1 ? "disabled" : ""}>Next</button></div></section>`;
  }
  return `<section class="feed ${view}" aria-live="polite">${data.map((entry, i) => card(entry, i)).join("")}</section>`;
}

function mapView(data) {
  const query = mapSearchQuery.trim().toLowerCase();
  const edges = getMapEdges(data.length);

  const nodes = data.map((entry, i) => {
    const [x, y] = MAP_POSITIONS[i % MAP_POSITIONS.length];
    const isSelected = selectedMapNodeIndex === i;
    const isMatch = !query || entry.text.toLowerCase().includes(query);
    const classes = [
      "map-node",
      `node-${i % 5}`,
      isSelected ? "active-node" : "",
      !isMatch ? "filtered-out" : (query ? "match-highlight" : "")
    ].filter(Boolean).join(" ");

    return `<button class="${classes}" style="left:${x}%;top:${y}%" data-node-index="${i}" aria-label="Read learning trace ${i + 1}" aria-pressed="${isSelected}" aria-hidden="${!isMatch}"><span>${escapeHtml(entry.text.slice(0, 72))}${entry.text.length > 72 ? "…" : ""}</span></button>`;
  }).join("");

  const svgLines = edges.map(([fromIdx, toIdx]) => {
    const [x1, y1] = MAP_POSITIONS[fromIdx % MAP_POSITIONS.length];
    const [x2, y2] = MAP_POSITIONS[toIdx % MAP_POSITIONS.length];
    const fromMatch = !query || (data[fromIdx] && data[fromIdx].text.toLowerCase().includes(query));
    const toMatch = !query || (data[toIdx] && data[toIdx].text.toLowerCase().includes(query));
    const isHighlighted = selectedMapNodeIndex !== null && (selectedMapNodeIndex === fromIdx || selectedMapNodeIndex === toIdx);
    const isDimmed = !fromMatch || !toMatch;
    const classes = [
      "map-connection-line",
      isHighlighted ? "highlighted" : "",
      isDimmed ? "dimmed" : ""
    ].filter(Boolean).join(" ");

    return `<line class="${classes}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" data-from="${fromIdx}" data-to="${toIdx}" />`;
  }).join("");

  const activeEntry = selectedMapNodeIndex !== null && data[selectedMapNodeIndex] ? data[selectedMapNodeIndex] : null;
  const sidePanel = activeEntry ? `
    <aside class="map-side-panel" id="map-side-panel" aria-label="Learning trace details" aria-live="polite">
      <div class="side-panel-header">
        <div class="card-label">Learning trace ${String(selectedMapNodeIndex + 1).padStart(2, "0")}</div>
        <button class="side-panel-close" id="close-side-panel" aria-label="Close details">✕</button>
      </div>
      <div class="side-panel-meta">
        <span>${readingTime(activeEntry.text)} min read</span>
        <span>${activeEntry.text.length} characters</span>
      </div>
      <div class="side-panel-content">
        <p>${escapeHtml(activeEntry.text)}</p>
      </div>
      <div class="side-panel-actions">
        <button class="secondary" data-read-single="${selectedMapNodeIndex}">Open in loose notes</button>
      </div>
    </aside>` : "";

  const matchingCount = query ? data.filter((e) => e.text.toLowerCase().includes(query)).length : data.length;
  const statusSubtitle = query
    ? (matchingCount > 0 ? `${matchingCount} of ${data.length} ideas match "${escapeHtml(mapSearchQuery)}"` : `No ideas match "${escapeHtml(mapSearchQuery)}"`)
    : "Proximity suggests conceptual similarity, never social connection.";

  return `<section class="map-panel" aria-label="Conceptual similarity map"><div class="map-toolbar"><div class="map-toolbar-info"><strong>Idea field</strong><small id="map-status-text">${statusSubtitle}</small></div><div class="map-search-box"><span class="map-search-icon" aria-hidden="true">⌕</span><input type="search" id="map-search-input" class="map-search-input" placeholder="Search ideas…" value="${escapeHtml(mapSearchQuery)}" aria-label="Filter ideas by keyword" />${mapSearchQuery ? `<button type="button" class="map-search-clear" id="map-search-clear" aria-label="Clear search">✕</button>` : ""}</div><div class="map-actions"><button class="secondary" id="zoom-out" aria-label="Zoom out">−</button><button class="secondary" id="zoom-in" aria-label="Zoom in">+</button><button class="secondary" id="reset-map">Reset</button></div></div><div class="map-viewport" id="map-viewport"><div class="map-canvas" id="map-canvas" style="transform:translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})"><div class="map-lines"></div><svg class="map-connections-svg" aria-hidden="true">${svgLines}</svg>${nodes}</div>${sidePanel}</div></section>`;
}

function commonsPage() {
  const data = entries();
  app.innerHTML = `
    <section class="hero commons-hero">
      <div class="kicker">Commons / anonymous by design</div>
      <h1>Only the words.</h1>
      <p class="lede">People remain anonymous. Ideas stay visible. Explore a quiet collection of observations without profiles, popularity, or identity trails.</p>
    </section>
    <div class="controls"><div><strong>${data.length}</strong> shared notes</div><div class="view-toggle" aria-label="Choose reading arrangement"><button data-view="crowd" class="${view === "crowd" ? "active" : ""}">Quiet shelf</button><button data-view="small" class="${view === "small" ? "active" : ""}">Study table</button><button data-view="single" class="${view === "single" ? "active" : ""}">Loose notes</button></div></div>
    <div class="arrangement-toggle" role="group" aria-label="Choose commons presentation"><button data-mode="cards" class="${commonsMode === "cards" ? "active" : ""}">Cards</button><button data-mode="map" class="${commonsMode === "map" ? "active" : ""}">Map / ideas</button></div>
    ${commonsMode === "map" ? mapView(data) : cardsView(data)}
    <p class="principle"><strong>People are anonymous. Ideas are visible.</strong><br />This is a commons of learning, not a social network.</p>`;

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { view = button.dataset.view; singleIndex = 0; selectedMapNodeIndex = null; commonsPage(); }));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { commonsMode = button.dataset.mode; if (commonsMode !== "map") selectedMapNodeIndex = null; commonsPage(); }));
  document.querySelectorAll("[data-single]").forEach((button) => button.addEventListener("click", () => { singleIndex = nextSingleIndex(singleIndex, button.dataset.single, data.length); commonsPage(); }));
  document.querySelectorAll("[data-node-index]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.nodeIndex);
    selectedMapNodeIndex = index;
    const [x, y] = MAP_POSITIONS[index % MAP_POSITIONS.length];
    const viewport = document.querySelector("#map-viewport");
    const canvas = document.querySelector("#map-canvas");
    const canvasW = canvas?.offsetWidth || (viewport ? viewport.clientWidth * 1.16 : 800);
    const canvasH = canvas?.offsetHeight || (viewport ? viewport.clientHeight * 1.16 : 520);
    mapOffset = {
      x: Math.round((50 - x) / 100 * canvasW * mapScale),
      y: Math.round((50 - y) / 100 * canvasH * mapScale),
    };
    commonsPage();
  }));

  const searchInput = document.querySelector("#map-search-input");
  const searchClear = document.querySelector("#map-search-clear");
  const statusText = document.querySelector("#map-status-text");

  const filterMap = (query) => {
    mapSearchQuery = query;
    const cleanQuery = query.trim().toLowerCase();
    let matchCount = 0;

    data.forEach((entry, i) => {
      const isMatch = !cleanQuery || entry.text.toLowerCase().includes(cleanQuery);
      if (isMatch) matchCount++;
      const el = document.querySelector(`.map-node[data-node-index="${i}"]`);
      if (el) {
        el.classList.toggle("filtered-out", !isMatch);
        el.classList.toggle("match-highlight", Boolean(cleanQuery && isMatch));
        el.setAttribute("aria-hidden", String(!isMatch));
      }
    });

    document.querySelectorAll(".map-connection-line").forEach((line) => {
      const fromIdx = Number(line.dataset.from);
      const toIdx = Number(line.dataset.to);
      const fromMatch = !cleanQuery || (data[fromIdx] && data[fromIdx].text.toLowerCase().includes(cleanQuery));
      const toMatch = !cleanQuery || (data[toIdx] && data[toIdx].text.toLowerCase().includes(cleanQuery));
      line.classList.toggle("dimmed", !fromMatch || !toMatch);
    });

    if (statusText) {
      statusText.textContent = cleanQuery
        ? (matchCount > 0 ? `${matchCount} of ${data.length} ideas match "${query}"` : `No ideas match "${query}"`)
        : "Proximity suggests conceptual similarity, never social connection.";
    }

    if (searchClear) {
      searchClear.hidden = !query;
    }
  };

  searchInput?.addEventListener("input", (e) => {
    filterMap(e.target.value);
  });

  searchClear?.addEventListener("click", () => {
    mapSearchQuery = "";
    commonsPage();
  });

  document.querySelector("#close-side-panel")?.addEventListener("click", () => { selectedMapNodeIndex = null; commonsPage(); });
  document.querySelector("[data-read-single]")?.addEventListener("click", (e) => {
    view = "single";
    commonsMode = "cards";
    singleIndex = Number(e.currentTarget.dataset.readSingle);
    selectedMapNodeIndex = null;
    commonsPage();
  });
  document.querySelector("#zoom-in")?.addEventListener("click", () => { mapScale = Math.min(1.8, mapScale + 0.15); commonsPage(); });
  document.querySelector("#zoom-out")?.addEventListener("click", () => { mapScale = Math.max(0.7, mapScale - 0.15); commonsPage(); });
  document.querySelector("#reset-map")?.addEventListener("click", () => { mapScale = 1; mapOffset = { x: 0, y: 0 }; selectedMapNodeIndex = null; mapSearchQuery = ""; commonsPage(); });
}

function route() {
  const page = location.hash.replace(/^#/, "") || "write";
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === page));
  page === "commons" ? commonsPage() : writePage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("hashchange", route);
route();

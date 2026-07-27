// ---------- Config ----------
const PASSCODE = "kullanari"; // lowercase compare, case-insensitive entry
const NICKNAME = "Kullanari";
const DATA_URL = "data/days.json?_=" + Date.now(); // cache-bust so new letters show up

// ---------- State ----------
let DATA = null;
let TODAY_DAY_NUMBER = 1;
let TOTAL_DAYS = 31;
let IS_BIRTHDAY = false;
let VIEWING_DAY = null; // set while looking at a past day from the archive; null = viewing today

const screens = {};
["passcode", "welcome", "home", "archive"].forEach(name => {
  screens[name] = document.getElementById("screen-" + name);
});

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ---------- Date / day-number logic ----------
function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / MS);
}

function computeDayNumber() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const launch = DATA.launchDate;
  const birthday = DATA.birthdayDate;

  TOTAL_DAYS = daysBetween(launch, birthday) + 1; // inclusive of both ends
  let elapsed = daysBetween(launch, todayStr) + 1; // Day 1 == launch day

  if (elapsed < 1) elapsed = 1; // opened before launch date somehow
  if (elapsed > TOTAL_DAYS) elapsed = TOTAL_DAYS; // never overshoot past birthday

  TODAY_DAY_NUMBER = elapsed;
  IS_BIRTHDAY = (todayStr === birthday);
}

// ---------- Local streak + read-state tracking (stored on her device) ----------
const LS_KEY = "smiles_state_v1";
function getLocalState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || { readDays: [], lastOpenDate: null, streak: 0, firstRun: true };
  } catch (e) {
    return { readDays: [], lastOpenDate: null, streak: 0, firstRun: true };
  }
}
function saveLocalState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
function updateStreakOnOpen(state) {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (state.lastOpenDate === todayStr) return state; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak = (state.lastOpenDate === yesterday) ? state.streak + 1 : 1;
  state.lastOpenDate = todayStr;
  return state;
}

// ---------- Data helpers ----------
function getDayRecord(dayNum) {
  return (DATA.days || []).find(d => d.day === dayNum) || null;
}

function pickFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}

// ---------- Passcode screen ----------
const passInput = document.getElementById("passcode-input");
const passHint = document.getElementById("passcode-hint");
document.getElementById("enter-btn").addEventListener("click", tryPasscode);
passInput.addEventListener("keydown", e => { if (e.key === "Enter") tryPasscode(); });

function tryPasscode() {
  const val = (passInput.value || "").trim().toLowerCase();
  if (val === PASSCODE) {
    const state = getLocalState();
    if (state.firstRun) {
      state.firstRun = false;
      saveLocalState(state);
      showScreen("welcome");
      requestNotifPermission();
      setTimeout(enterHome, 2600);
    } else {
      enterHome();
    }
  } else {
    passInput.classList.remove("shake");
    void passInput.offsetWidth; // restart animation
    passInput.classList.add("shake");
    passHint.textContent = "not quite — try again";
    passInput.value = "";
  }
}

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// ---------- Milestone tiers (purely presentational — no data model changes) ----------
function getDayTier(dayNum) {
  if (IS_BIRTHDAY_FOR(dayNum)) return "birthday";
  if (dayNum === 1) return "first";
  if (dayNum === Math.ceil(TOTAL_DAYS / 2)) return "halfway";
  if (dayNum >= TOTAL_DAYS - 6) return "final-week";
  return "normal";
}
function IS_BIRTHDAY_FOR(dayNum) {
  return dayNum === TOTAL_DAYS && IS_BIRTHDAY;
}
const TIER_LABELS = {
  "first": "day one",
  "halfway": "halfway there",
  "final-week": "almost there",
  "birthday": "your birthday",
  "normal": null
};

// ---------- Home screen ----------
function enterHome() {
  computeDayNumber();
  VIEWING_DAY = null;
  let state = getLocalState();
  state = updateStreakOnOpen(state);
  saveLocalState(state);
  renderDay(TODAY_DAY_NUMBER, state, false);
  showScreen("home");
}

// Renders any day (today or an archived one) into the home screen.
// fromArchive=true means we came from tapping a past letter — shows a way back, never touches real progress state.
function renderDay(dayNum, state, fromArchive) {
  const tier = getDayTier(dayNum);
  const isBirthdayDay = tier === "birthday";

  document.getElementById("day-num").textContent = "Day " + String(dayNum).padStart(2, "0");
  document.getElementById("streak-count").textContent = fromArchive
    ? "· revisiting"
    : "· " + state.streak + " day" + (state.streak === 1 ? "" : "s") + " streak";

  const homeScreen = screens.home;
  homeScreen.classList.toggle("birthday", isBirthdayDay);
  homeScreen.classList.toggle("milestone", tier === "halfway" || tier === "final-week");

  const record = getDayRecord(dayNum);
  const alreadyRead = state.readDays.includes(dayNum);

  if (fromArchive || alreadyRead) {
    // Only animate the unfold when this is a fresh, non-archive view that hasn't played the animation yet.
    renderOpenedLetter(record, dayNum, tier, false, fromArchive);
  } else {
    renderSealedCard(record, dayNum, tier);
  }
}

function renderSealedCard(record, dayNum, tier) {
  const container = document.getElementById("letter-slot");
  const label = TIER_LABELS[tier];
  container.innerHTML = `
    ${label ? `<div class="tier-badge">${label}</div>` : ""}
    <div class="letter-card" id="seal-card">
      <div class="seal" id="seal-el">${NICKNAME[0]}</div>
      <div class="tap-hint">tap to open ${tier === "birthday" ? "your birthday letter" : "today's letter"}</div>
      <div class="letter-preview-title">${tier === "birthday" ? "the big one is here" : "something's waiting for you"}</div>
    </div>
  `;
  document.getElementById("seal-card").addEventListener("click", () => {
    const seal = document.getElementById("seal-el");
    seal.classList.add("cracking");
    setTimeout(() => {
      const state = getLocalState();
      if (!state.readDays.includes(dayNum)) state.readDays.push(dayNum);
      saveLocalState(state);
      renderOpenedLetter(getDayRecord(dayNum), dayNum, tier, true, false);
    }, 480);
  }, { once: true });
}

function renderOpenedLetter(record, dayNum, tier, animate, fromArchive) {
  const container = document.getElementById("letter-slot");
  const hasLetter = record && record.published && record.letter && record.letter.trim().length > 0;
  const bodyText = hasLetter ? record.letter : pickFallback();
  const label = TIER_LABELS[tier];

  container.innerHTML = `
    ${fromArchive ? `<button class="back-to-archive" id="back-to-archive-btn" aria-label="Back to archive">← back to archive</button>` : ""}
    ${label ? `<div class="tier-badge">${label}</div>` : ""}
    <div class="letter-open ${animate ? "revealed" : ""}" style="${animate ? "" : "opacity:1;transform:none;"}">
      <div class="letter-eyebrow">${tier === "birthday" ? "Your Birthday Letter" : "Day " + String(dayNum).padStart(2, "0")}</div>
      <div class="letter-body">${escapeHtml(bodyText)}</div>
      ${record && record.song ? `<div class="letter-song">🎵 <a href="${escapeAttr(record.song)}" target="_blank" rel="noopener">a song for today</a></div>` : ""}
      <div class="letter-sign">-K</div>
    </div>
    <div id="game-slot"></div>
  `;

  if (fromArchive) {
    document.getElementById("back-to-archive-btn").addEventListener("click", () => {
      renderArchive();
    });
  }

  if (hasLetter && record.game) {
    renderGame(document.getElementById("game-slot"), record.game);
  }

  if (tier === "birthday") {
    spawnParticles();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

const CONFETTI_COLORS = ["var(--gold)", "var(--clay)", "#8fd4a8", "#e08a8a", "var(--ivory)"];

function spawnParticles() {
  const homeScreen = screens.home;

  // Rising confetti — more of them, mixed colors and shapes, staggered.
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "particle" + (Math.random() > 0.5 ? " particle-square" : "");
      const size = 4 + Math.random() * 7;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = (5 + Math.random() * 90) + "%";
      p.style.bottom = "6%";
      p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      p.style.animationDuration = (2.8 + Math.random() * 1.6) + "s";
      homeScreen.appendChild(p);
      setTimeout(() => p.remove(), 4600);
    }, i * 110);
  }

  // A couple of firework-style bursts from random points, a beat after confetti starts.
  const burstCount = 3;
  for (let b = 0; b < burstCount; b++) {
    setTimeout(() => spawnFirework(homeScreen), 500 + b * 850);
  }
}

function spawnFirework(container) {
  const originX = 20 + Math.random() * 60; // %
  const originY = 30 + Math.random() * 30; // %
  const rayCount = 16;
  for (let i = 0; i < rayCount; i++) {
    const ray = document.createElement("div");
    ray.className = "firework-ray";
    const angle = ((360 / rayCount) * i + Math.random() * 8) * (Math.PI / 180);
    const distance = 60 + Math.random() * 40;
    ray.style.left = originX + "%";
    ray.style.top = originY + "%";
    ray.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    ray.style.setProperty("--dx", (Math.cos(angle) * distance) + "px");
    ray.style.setProperty("--dy", (Math.sin(angle) * distance) + "px");
    container.appendChild(ray);
    setTimeout(() => ray.remove(), 1000);
  }
}

// ---------- Archive ----------
document.getElementById("archive-btn").addEventListener("click", renderArchive);
document.getElementById("back-btn").addEventListener("click", () => showScreen("home"));

function renderArchive() {
  const list = document.getElementById("archive-list");
  list.innerHTML = "";
  const state = getLocalState();

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const unlocked = d <= TODAY_DAY_NUMBER;
    const record = getDayRecord(d);
    const item = document.createElement("div");
    item.className = "archive-item" + (unlocked ? "" : " locked");
    item.innerHTML = `
      <div class="archive-seal">${unlocked ? NICKNAME[0] : "•"}</div>
      <div class="archive-meta">
        <div class="archive-day">Day ${String(d).padStart(2, "0")}</div>
        <div class="archive-status">${unlocked ? (state.readDays.includes(d) ? "read" : "unread") : "not yet unlocked"}</div>
      </div>
    `;
    if (unlocked) {
      item.addEventListener("click", () => {
        viewArchivedDay(d);
      });
    }
    list.appendChild(item);
  }
  showScreen("archive");
}

// View a past day's letter without disturbing today's real day number or streak state.
function viewArchivedDay(d) {
  VIEWING_DAY = d;
  const state = getLocalState();
  showScreen("home");
  renderDay(d, state, true);
}

// ---------- Boot ----------
function isValidData(json) {
  return json
    && typeof json.launchDate === "string"
    && typeof json.birthdayDate === "string"
    && Array.isArray(json.days);
}

fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error("bad response");
    return r.json();
  })
  .then(json => {
    if (!isValidData(json)) throw new Error("malformed data");
    DATA = json;
    computeDayNumber();
    showScreen("passcode");
  })
  .catch(() => {
    document.getElementById("passcode-hint").textContent = "couldn't load today's data — check your connection and try again";
  });

// Generic, no-personal-info-required content pools.
// Feel free to edit any of the arrays below directly — no build step needed.

const FALLBACK_MESSAGES = [
  "still smiling because of you 🙂",
  "today's letter is still being written — you're worth the wait",
  "no words yet, just: you're loved",
  "a letter's coming — good things take a minute",
  "today's note is running late, but it's on its way",
  "running behind today, but you're never far from mind",
  "the words aren't ready yet, but the thought definitely is",
  "consider this a placeholder hug until the real letter shows up"
];

const TRIVIA_QUESTIONS = [
  {
    prompt: "Which of these is scientifically proven to boost your mood fastest?",
    options: ["A good laugh", "A nap", "A snack", "All of the above, honestly"],
    response: "Correct answer: whichever one you needed today."
  },
  {
    prompt: "What's the best cure for a rough week?",
    options: ["Good friends", "Good food", "Doing nothing", "A mix of all three"],
    response: "There's really no wrong answer here."
  },
  {
    prompt: "Best kind of surprise?",
    options: ["Small and daily", "Big and rare", "Depends on the day", "Any surprise at all"],
    response: "Noted for future reference."
  },
  {
    prompt: "What's the most underrated form of self-care?",
    options: ["Saying no", "A long shower", "An early bedtime", "Doing absolutely nothing"],
    response: "All correct. Pick your poison."
  },
  {
    prompt: "Which snack fixes 90% of problems?",
    options: ["Chocolate", "Chips", "Something warm and carby", "Whatever's closest"],
    response: "Science supports all four, honestly."
  },
  {
    prompt: "Best way to spend a free afternoon?",
    options: ["A nap in the sun", "A long walk", "Bad TV, no guilt", "A spontaneous plan"],
    response: "There's no wrong answer, only vibes."
  },
  {
    prompt: "What's the real cure for a bad day?",
    options: ["Music, loud", "A good cry", "A good laugh", "Someone who gets it"],
    response: "You already know which one's true for you."
  }
];

const THIS_OR_THAT = [
  { a: "Morning person", b: "Night owl" },
  { a: "Sweet snacks", b: "Salty snacks" },
  { a: "Rewatch a favorite", b: "Try something new" },
  { a: "Text back instantly", b: "Text back... eventually" },
  { a: "Plan everything", b: "Wing it" },
  { a: "Beach", b: "Mountains" },
  { a: "Coffee", b: "Tea" },
  { a: "Books", b: "Movies" },
  { a: "Big group hangout", b: "One close friend" },
  { a: "Save it for later", b: "Use it now" },
  { a: "Window seat", b: "Aisle seat" },
  { a: "Comfort food", b: "Try something fancy" }
];

const FINISH_THE_JOKE = [
  {
    prompt: "Why don't scientists trust atoms?",
    options: ["Because they make up everything", "Because they're too small to see", "Because they're unstable"],
    correctIndex: 0
  },
  {
    prompt: "What do you call a bear with no teeth?",
    options: ["A gummy bear", "A soft bear", "A slow bear"],
    correctIndex: 0
  },
  {
    prompt: "Why did the scarecrow win an award?",
    options: ["He was outstanding in his field", "He scared all the crows", "He worked overtime"],
    correctIndex: 0
  },
  {
    prompt: "Why did the coffee file a police report?",
    options: ["It got mugged", "It went cold", "It got spilled"],
    correctIndex: 0
  },
  {
    prompt: "What do you call cheese that isn't yours?",
    options: ["Nacho cheese", "Fake cheese", "Bad cheese"],
    correctIndex: 0
  },
  {
    prompt: "Why did the bicycle fall over?",
    options: ["It was two-tired", "It hit a rock", "It was broken"],
    correctIndex: 0
  }
];

const GRATITUDE_PROMPTS = [
  "Name one small thing that made you smile this week.",
  "What's something you're proud of yourself for lately, even if it's tiny?",
  "Think of someone who'd drop everything for you. Picture their face for a second.",
  "What's a place that instantly makes you feel calm?",
  "What's a song that always shifts your mood?",
  "Name one thing you're looking forward to, big or small.",
  "What's a comfort you never take for granted?"
];

const MOOD_CHECK = [
  { emoji: "🌤️", label: "pretty good" },
  { emoji: "🥱", label: "running on empty" },
  { emoji: "🔥", label: "unstoppable" },
  { emoji: "🫠", label: "just surviving" },
  { emoji: "🌱", label: "quietly hopeful" },
  { emoji: "🎉", label: "genuinely excited" }
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderGame(container, type) {
  container.innerHTML = "";
  if (!type) return;

  const card = document.createElement("div");
  card.className = "game-card";

  if (type === "trivia") {
    const q = pickRandom(TRIVIA_QUESTIONS);
    card.innerHTML = `
      <div class="game-eyebrow">A little trivia</div>
      <div class="game-prompt">${q.prompt}</div>
      <div class="game-options">
        ${q.options.map((o, i) => `<button class="game-option" data-i="${i}">${o}</button>`).join("")}
      </div>
      <div class="game-response hidden"></div>
    `;
    card.querySelectorAll(".game-option").forEach(btn => {
      btn.addEventListener("click", () => {
        card.querySelector(".game-response").textContent = q.response;
        card.querySelector(".game-response").classList.remove("hidden");
      });
    });
  } else if (type === "this-or-that") {
    const pair = pickRandom(THIS_OR_THAT);
    card.innerHTML = `
      <div class="game-eyebrow">This or that</div>
      <div class="game-prompt">Quick pick, no wrong answers.</div>
      <div class="game-options">
        <button class="game-option" data-choice="a">${pair.a}</button>
        <button class="game-option" data-choice="b">${pair.b}</button>
      </div>
      <div class="game-response hidden"></div>
    `;
    card.querySelectorAll(".game-option").forEach(btn => {
      btn.addEventListener("click", () => {
        card.querySelector(".game-response").textContent = "Good choice. No notes.";
        card.querySelector(".game-response").classList.remove("hidden");
      });
    });
  } else if (type === "finish-the-joke") {
    const j = pickRandom(FINISH_THE_JOKE);
    card.innerHTML = `
      <div class="game-eyebrow">Finish the joke</div>
      <div class="game-prompt">${j.prompt}</div>
      <div class="game-options">
        ${j.options.map((o, i) => `<button class="game-option" data-i="${i}">${o}</button>`).join("")}
      </div>
      <div class="game-response hidden"></div>
    `;
    card.querySelectorAll(".game-option").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const r = card.querySelector(".game-response");
        r.textContent = i === j.correctIndex ? "Yep, that's the one." : "Close enough — still a good laugh.";
        r.classList.remove("hidden");
      });
    });
  } else if (type === "gratitude") {
    const prompt = pickRandom(GRATITUDE_PROMPTS);
    card.innerHTML = `
      <div class="game-eyebrow">A little pause</div>
      <div class="game-prompt">${prompt}</div>
      <div class="game-response" style="color:var(--muted); font-style:normal;">Just take a second with it. No need to answer anyone but yourself.</div>
    `;
  } else if (type === "mood-check") {
    card.innerHTML = `
      <div class="game-eyebrow">How are you, really?</div>
      <div class="game-prompt">Tap whichever fits today.</div>
      <div class="game-options mood-options">
        ${MOOD_CHECK.map((m, i) => `<button class="game-option mood-option" data-i="${i}">${m.emoji} ${m.label}</button>`).join("")}
      </div>
      <div class="game-response hidden"></div>
    `;
    card.querySelectorAll(".mood-option").forEach(btn => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".mood-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const r = card.querySelector(".game-response");
        r.textContent = "Whatever today is, it's noted — and it's allowed.";
        r.classList.remove("hidden");
      });
    });
  }

  container.appendChild(card);
}

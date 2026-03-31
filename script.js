// =====================================
// CLEAN WATER CARAVAN - IMPROVED VERSION
// =====================================

console.log("JavaScript connected");

// ================= ELEMENTS =================
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const peopleEl = document.getElementById("people");
const timerEl = document.getElementById("timer");

const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

const gameOverScreen = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");
const finalPeopleEl = document.getElementById("final-people");
const playAgainBtn = document.getElementById("play-again-btn");
const messageEl = document.getElementById("message");

// ================= SOUND =================
const collectSound = new Audio("sounds/click.mp3");
const badSound = new Audio("sounds/bad.mp3");
const winSound = new Audio("sounds/win.mp3");

// ================= DIFFICULTY =================
let difficulty = "normal";

const settings = {
  easy:   { time: 40, spawnMin: 1200, spawnMax: 1800 },
  normal: { time: 30, spawnMin: 800,  spawnMax: 1500 },
  hard:   { time: 20, spawnMin: 500,  spawnMax: 1000 }
};

// ================= GAME STATE =================
let score = 0;
let peopleServed = 0;
let timeLeft = 30;

let gameActive = false;
let gameInterval;
let spawnTimeout;
let combo = 0;

// ================= START GAME =================
startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameActive) return;

  const config = settings[difficulty];

  score = 0;
  peopleServed = 0;
  timeLeft = config.time;
  combo = 0;

  gameActive = true;
  gameOverScreen.classList.add("hidden");

  updateDisplay();
  spawnDrop();
  startTimer();
}

// ================= TIMER =================
function startTimer() {
  clearInterval(gameInterval);

  gameInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) endGame();
  }, 1000);
}

// ================= SPAWN =================
function getSpawnInterval() {
  const config = settings[difficulty];
  return Math.random() * (config.spawnMax - config.spawnMin) + config.spawnMin;
}

function spawnDrop() {
  if (!gameActive) return;

  gameArea.innerHTML = ""; // ensures only one drop at a time

  const drop = document.createElement("div");
  drop.classList.add("drop");

  positionElement(drop);
  drop.addEventListener("click", collectWater);

  gameArea.appendChild(drop);

  if (Math.random() < 0.3) spawnBadItem();

  spawnTimeout = setTimeout(spawnDrop, getSpawnInterval());
}

// ================= POSITION HELPER =================
function positionElement(el) {
  const rect = gameArea.getBoundingClientRect();
  const size = 40;

  const x = Math.random() * (rect.width - size);
  const y = Math.random() * (rect.height - size);

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

// ================= BAD ITEM =================
function spawnBadItem() {
  const bad = document.createElement("div");
  bad.classList.add("drop", "bad");
  bad.textContent = "⚠️";

  positionElement(bad);

  bad.addEventListener("click", (e) => {
    if (!gameActive) return;

    let penalty = score > 150 ? 15 : score > 50 ? 10 : 5;
    score = Math.max(0, score - penalty);
    combo = 0;

    updateDisplay();
    badSound.play();

    showNegativeFeedback(e, penalty);
    bad.remove();
  });

  gameArea.appendChild(bad);
}

// ================= COLLECT =================
function collectWater(e) {
  if (!gameActive) return;

  combo++;
  score += 10 + combo * 2;
  peopleServed += 20;

  updateDisplay();
  collectSound.play();

  showFeedback(e);
  e.target.remove();
}

// ================= UI =================
function updateDisplay() {
  scoreEl.textContent = `Score: ${score}`;
  peopleEl.textContent = `People Served: ${peopleServed}`;
}

// ================= END GAME =================
function endGame() {
  gameActive = false;

  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);

  gameArea.innerHTML = "";

  finalScoreEl.textContent = `Final Score: ${score}`;
  finalPeopleEl.textContent = `People Served: ${peopleServed}`;
  messageEl.textContent = `You helped ${peopleServed} people 💧`;

  winSound.play();
  gameOverScreen.classList.remove("hidden");
}

// ================= RESET =================
resetBtn.addEventListener("click", resetGame);

function resetGame() {
  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);

  gameActive = false;

  const config = settings[difficulty];
  timeLeft = config.time;

  score = 0;
  peopleServed = 0;
  combo = 0;

  gameArea.innerHTML = "";
  updateDisplay();
  timerEl.textContent = `Time: ${timeLeft}`;

  gameOverScreen.classList.add("hidden");
}

// ================= FEEDBACK =================
function showFeedback(e) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.textContent = `+20 👥 (x${combo})`;

  placeFeedback(text, e);
}

function showNegativeFeedback(e, penalty) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.style.color = "red";
  text.textContent = `-${penalty}`;

  placeFeedback(text, e);
}

function placeFeedback(text, e) {
  const rect = gameArea.getBoundingClientRect();
  text.style.left = `${e.clientX - rect.left}px`;
  text.style.top = `${e.clientY - rect.top}px`;

  gameArea.appendChild(text);
  setTimeout(() => text.remove(), 1000);
}

// ================= PLAY AGAIN =================
playAgainBtn.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startGame();
});

// ================= DIFFICULTY =================
document.querySelectorAll("#difficulty button").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.mode;

    document.querySelectorAll("#difficulty button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  });
});
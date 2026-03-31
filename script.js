// =====================================
// CLEAN WATER CARAVAN - FINAL VERSION
// =====================================

// Confirm JS is connected
console.log("JavaScript connected");

// -------------------
// HTML ELEMENTS
// -------------------
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

// -------------------
// SOUND EFFECTS
// -------------------
const collectSound = new Audio("sounds/click.mp3");
const badSound = new Audio("sounds/bad.mp3");
const winSound = new Audio("sounds/win.mp3");

// -------------------
// DIFFICULTY SETTINGS
// -------------------
let difficulty = "normal";

const settings = {
  easy:   { time: 40, spawnMin: 1200, spawnMax: 1800 },
  normal: { time: 30, spawnMin: 800,  spawnMax: 1500 },
  hard:   { time: 20, spawnMin: 500,  spawnMax: 1000 }
};

// -------------------
// MILESTONES
// -------------------
const milestones = [
  { score: 50, message: "Great start! 💧" },
  { score: 100, message: "You're helping a village! 👏" },
  { score: 200, message: "Halfway there! 🚰" },
  { score: 300, message: "Incredible impact! 🌍" }
];

let shownMilestones = [];

// -------------------
// GAME STATE VARIABLES
// -------------------
let score = 0;
let peopleServed = 0;
let timeLeft = 30;

let gameActive = false;
let gameInterval;
let spawnTimeout;

let combo = 0;

// Hide game over screen initially
gameOverScreen.classList.add("hidden");

// -------------------
// START GAME
// -------------------
startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameActive) return;

  const config = settings[difficulty];

  // Reset game state
  score = 0;
  peopleServed = 0;
  timeLeft = config.time;
  combo = 0;
  shownMilestones = [];

  gameActive = true;
  gameOverScreen.classList.add("hidden");

  updateDisplay();
  spawnDrop();
  startTimer();
}

// -------------------
// TIMER
// -------------------
function startTimer() {
  clearInterval(gameInterval);

  gameInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// -------------------
// SPAWN SPEED (BASED ON DIFFICULTY)
// -------------------
function getSpawnInterval() {
  const config = settings[difficulty];
  return Math.random() * (config.spawnMax - config.spawnMin) + config.spawnMin;
}

// -------------------
// SPAWN GOOD DROP
// -------------------
function spawnDrop() {
  if (!gameActive) return;

  // Remove old items
  document.querySelectorAll(".drop").forEach(item => item.remove());

  const drop = document.createElement("div");
  drop.classList.add("drop");

  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - 40);
  const y = Math.random() * (rect.height - 40);

  drop.style.left = `${x}px`;
  drop.style.top = `${y}px`;

  drop.addEventListener("click", collectWater);

  gameArea.appendChild(drop);

  // 30% chance to spawn bad item
  if (Math.random() < 0.3) {
    spawnBadItem();
  }

  spawnTimeout = setTimeout(spawnDrop, getSpawnInterval());
}

// -------------------
// SPAWN BAD ITEM
// -------------------
function spawnBadItem() {
  const bad = document.createElement("div");
  bad.classList.add("drop", "bad");

  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - 40);
  const y = Math.random() * (rect.height - 40);

  bad.style.left = `${x}px`;
  bad.style.top = `${y}px`;

  bad.addEventListener("click", (event) => {
    if (!gameActive) return;

    let penalty = 5;
    if (score > 50) penalty = 10;
    if (score > 150) penalty = 15;

    score = Math.max(0, score - penalty);
    combo = 0;

    updateDisplay();
    badSound.play();

    const rect = gameArea.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    showNegativeFeedback(x, y, penalty);

    bad.remove();
  });

  gameArea.appendChild(bad);
}

// -------------------
// COLLECT GOOD ITEM
// -------------------
function collectWater(event) {
  if (!gameActive) return;

  const drop = event.target;

  combo++;

  score += 10 + combo * 2;
  peopleServed += 20;

  updateDisplay();
  collectSound.play();

  const rect = gameArea.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  showFeedback(x, y);

  drop.remove();
}

// -------------------
// UPDATE UI
// -------------------
function updateDisplay() {
  scoreEl.textContent = `Score: ${score}`;
  peopleEl.textContent = `People Served: ${peopleServed}`;
  checkMilestones();
}

// -------------------
// MILESTONE CHECK
// -------------------
function checkMilestones() {
  milestones.forEach(m => {
    if (score >= m.score && !shownMilestones.includes(m.score)) {
      messageEl.textContent = m.message;
      shownMilestones.push(m.score);
    }
  });
}

// -------------------
// END GAME
// -------------------
function endGame() {
  gameActive = false;

  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);

  gameArea.innerHTML = "";

  finalScoreEl.textContent = `Final Score: ${score}`;
  finalPeopleEl.textContent = `People Served: ${peopleServed}`;
  messageEl.textContent = `You helped ${peopleServed} people get clean water! 💧`;

  winSound.play();
  gameOverScreen.classList.remove("hidden");
}

// -------------------
// RESET GAME
// -------------------
resetBtn.addEventListener("click", resetGame);

playAgainBtn.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startGame();
});

function resetGame() {
  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);

  gameActive = false;

  score = 0;
  peopleServed = 0;
  timeLeft = 30;
  combo = 0;

  gameArea.innerHTML = "";
  updateDisplay();

  timerEl.textContent = `Time: ${timeLeft}`;
  gameOverScreen.classList.add("hidden");
}

// -------------------
// FEEDBACK TEXT
// -------------------
function showFeedback(x, y) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.textContent = `+20 👥 (x${combo})`;

  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  gameArea.appendChild(text);

  setTimeout(() => text.remove(), 1000);
}

function showNegativeFeedback(x, y, penalty) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.style.color = "red";
  text.textContent = `-${penalty} ❌`;

  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  gameArea.appendChild(text);

  setTimeout(() => text.remove(), 1000);
}

// -------------------
// DIFFICULTY BUTTONS
// -------------------
document.querySelectorAll("#difficulty button").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.mode;

    document.querySelectorAll("#difficulty button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
  });
});
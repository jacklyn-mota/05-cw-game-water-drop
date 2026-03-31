JavaScript code:
// =====================================
// WATER GAME - IMPROVED VERSION
// =====================================

// Log to ensure JS file is linked
console.log('JavaScript file is linked correctly.');

// -------------------
// Get HTML Elements
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
const collectSound = new Audio("sounds/click.mp3");
const badSound = new Audio("sounds/bad.mp3");
const winSound = new Audio("sounds/win.mp3");


let difficulty = "normal";

const settings = {
  easy:   { time: 40, spawnMin: 1200, spawnMax: 1800, goal: 200 },
  normal: { time: 30, spawnMin: 800,  spawnMax: 1500, goal: 300 },
  hard:   { time: 20, spawnMin: 500,  spawnMax: 1000, goal: 400 }
};

const milestones = [
  { score: 50, message: "Great start! 💧" },
  { score: 100, message: "You're helping a village! 👏" },
  { score: 200, message: "Halfway there! 🚰" },
  { score: 300, message: "Incredible impact! 🌍" }
];

let shownMilestones = [];
// -------------------
// Game variables
// -------------------
let score = 0;
let peopleServed = 0;
let timeLeft = 30;
let gameInterval; // Timer for countdown
let gameActive = false; // Is the game running?
let spawnTimeout; // Timeout for spawning drops
let confettiInterval;
let confettiCleanupTimeout;

const confettiColors = [
  "#FFC907", // charity: water yellow
  "#2E9DF7", // blue
  "#8BD1CB", // light blue
  "#4FCB53", // green
  "#FF902A", // orange
  "#F16061"  // pink
];

// Hide game-over screen on page load
gameOverScreen.classList.add("hidden");

// -------------------
// Start Game
// -------------------
startBtn.addEventListener("click", startGame);

function startGame() {
  if (gameActive) return; // prevent multiple clicks

  stopConfetti();
  gameOverScreen.classList.add("hidden"); // hide overlay
  gameActive = true;

  // Reset variables
  score = 0;
  peopleServed = 0;
  timeLeft = 30;

  updateDisplay(); // show initial score/people

  // Start spawning drops
  spawnDrop();

  // Start countdown timer
  startTimer();

  const config = settings[difficulty];

timeLeft = config.time;
}

// -------------------
// Countdown Timer
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
// Calculate Spawn Interval
// -------------------
// Dynamic spawn: starts slow and gets faster as score increases
function getSpawnInterval() {
  const maxInterval = 1500; // initial spawn interval (ms)
  const minInterval = 800;  // fastest spawn (ms)
  
  // Reduce interval as score increases
  // Every 10 points reduces interval by 5ms
  const interval = Math.max(minInterval, maxInterval - score * 5);
  return interval;
}

// -------------------
// Spawn Drop
// -------------------
function spawnDrop() {
  // Only spawn if game is active
  if (!gameActive) return;

  // Clear old drops (prevents visual clutter)
  const oldItems = document.querySelectorAll(".drop");
  oldItems.forEach(item => item.remove());

  // Create new drop element
  const drop = document.createElement("div");
  drop.classList.add("drop");

  // Random position within game area
  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - 40); // 40px = drop size
  const y = Math.random() * (rect.height - 40);
  drop.style.left = `${x}px`;
  drop.style.top = `${y}px`;

  // Click event for collecting water
  drop.addEventListener("click", collectWater);

  gameArea.appendChild(drop);

  // Random chance to spawn a bad item
  if (Math.random() < 0.3) {
    spawnBadItem();
  }

  // Schedule next spawn using dynamic interval
  spawnTimeout = setTimeout(spawnDrop, getSpawnInterval());
}

// -------------------
// Spawn Bad Item (Improved)
// -------------------
function spawnBadItem() {
  const bad = document.createElement("div");
  bad.classList.add("drop", "bad");

  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - 40);
  const y = Math.random() * (rect.height - 40);

  bad.style.left = `${x}px`;
  bad.style.top = `${y}px`;
  

  // Click event for bad item
  bad.addEventListener("click", (event) => {
    if (!gameActive) return;

    // Dynamic penalty: scales with score
    let penalty = 5; // default early game
    if (score > 50) penalty = 10;
    if (score > 150) penalty = 15;

    score = Math.max(0, score - penalty); // prevent negative score
    updateDisplay();

    // Show negative feedback with actual penalty
    const rect = gameArea.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    showNegativeFeedback(clickX, clickY, penalty);
    collectSound.play();
    combo = 0;
    bad.remove();
  });

  gameArea.appendChild(bad);
}

// -------------------
// Show Negative Feedback (Updated)
// -------------------
function showNegativeFeedback(x, y, penalty = 10) {
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
// Collect Water (Good Drop)
// -------------------
function collectWater(event) {
  if (!gameActive) return;

  const drop = event.target;

  score += 10;
  peopleServed += 20;

  updateDisplay();

  const rect = gameArea.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  showFeedback(x, y);
  collectSound.play();

  drop.remove(); // ✅ THIS is the key fix
}
// -------------------
// Update Display
// -------------------
function updateDisplay() {
  scoreEl.textContent = `Score: ${score}`;
  peopleEl.textContent = `People Served: ${peopleServed}`;
  checkMilestones();
}

// -------------------
// End Game
// -------------------
function endGame() {
  gameActive = false;

  // Stop timers
  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);

  // Clear game area
  gameArea.innerHTML = "";

  // Show final stats
  finalScoreEl.textContent = `Final Score: ${score}`;
  finalPeopleEl.textContent = `People Served: ${peopleServed}`;
  messageEl.textContent = `You helped bring clean water to ${peopleServed} people! 💧`;

  launchConfetti();
  gameOverScreen.classList.remove("hidden");
  collectSound.play();
}

// -------------------
// Reset Game
// -------------------
resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startGame();
});

function resetGame() {
  clearInterval(gameInterval);
  clearTimeout(spawnTimeout);
  stopConfetti();
  gameActive = false;

  score = 0;
  peopleServed = 0;
  timeLeft = 30;

  gameArea.innerHTML = "";
  updateDisplay();
  timerEl.textContent = `Time: ${timeLeft}`;
  gameOverScreen.classList.add("hidden");
}

// -------------------
// Confetti Effect
// -------------------
function launchConfetti() {
  stopConfetti();

  // Create a few small bursts for ~2.5 seconds.
  confettiInterval = setInterval(() => {
    createConfettiBurst(18);
  }, 180);

  confettiCleanupTimeout = setTimeout(() => {
    stopConfetti();
  }, 2500);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  clearTimeout(confettiCleanupTimeout);

  const leftoverConfetti = document.querySelectorAll(".confetti-piece");
  leftoverConfetti.forEach((piece) => piece.remove());
}

function createConfettiBurst(pieceCount = 16) {
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    const startX = Math.random() * window.innerWidth;
    const drift = (Math.random() - 0.5) * 220;
    const size = Math.random() * 8 + 6;
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const duration = Math.random() * 1.2 + 1.8;
    const delay = Math.random() * 0.2;

    piece.style.left = `${startX}px`;
    piece.style.top = "-20px";
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.6}px`;
    piece.style.backgroundColor = color;
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;

    document.body.appendChild(piece);

    // Remove each piece after it falls off-screen.
    setTimeout(() => {
      piece.remove();
    }, (duration + delay) * 1000 + 200);
  }
}

// -------------------
// Feedback Visuals
// -------------------
function showFeedback(x, y) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.textContent = "+20 👥";
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  gameArea.appendChild(text);

  setTimeout(() => text.remove(), 1000); // Remove after animation
}

function showNegativeFeedback(x, y, penalty = 10) {
  const text = document.createElement("div");
  text.classList.add("feedback");
  text.style.color = "red";
  text.textContent = `-${penalty} ❌`;
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  gameArea.appendChild(text);

  setTimeout(() => text.remove(), 1000);
}

function getSpawnInterval() {
  const config = settings[difficulty];
  return Math.random() * (config.spawnMax - config.spawnMin) + config.spawnMin;
}

 document.querySelectorAll("#difficulty button").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.mode;
  });
});

function checkMilestones() {
  milestones.forEach(m => {
    if (score >= m.score && !shownMilestones.includes(m.score)) {
      messageEl.textContent = m.message;
      shownMilestones.push(m.score);
    }
  });
}

let combo = 0;

function collectWater(event) {
  combo++;
  score += 10 + combo * 2;
}
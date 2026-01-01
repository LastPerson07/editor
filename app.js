// app.js
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

const boom = document.getElementById("boom");
const slider = document.getElementById("volume");
boom.volume = 0.3;
slider.value = 0.3;
slider.oninput = () => boom.volume = slider.value;

// Resize
window.addEventListener("resize", () => {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
});

// Arrays
let particles = [];
let confetti = [];
let rockets = [];
let stars = [];

// Colors
const fireworkColors = ["#FFD700", "#FF4500", "#FF1493", "#00FF7F", "#00BFFF", "#FF69B4", "#FFFFFF", "#ADFF2F"];
const confettiColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#FF00FF"];

// Create background stars
function createStars(count = 150) {
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.01
    });
  }
}
createStars();

// Rocket class-like object
function launchRocket() {
  rockets.push({
    x: Math.random() * w * 0.8 + w * 0.1,
    y: h,
    vx: Math.random() * 4 - 2,
    vy: -12 - Math.random() * 5,
    trail: []
  });
}

// Explosion
function explode(x, y, colorSet = fireworkColors) {
  if (boom.volume > 0) {
    boom.currentTime = 0;
    boom.play();
  }

  const count = 100 + Math.random() * 80;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 80 + Math.random() * 40,
      maxLife: 80 + Math.random() * 40,
      color: colorSet[Math.floor(Math.random() * colorSet.length)],
      size: Math.random() * 3 + 1,
      gravity: 0.05,
      trail: true
    });
  }

  // Add confetti on big explosions
  for (let i = 0; i < 60; i++) {
    confetti.push({
      x: x + Math.random() * 200 - 100,
      y: y,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 4 + 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.2 - 0.1,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      width: Math.random() * 8 + 6,
      height: Math.random() * 20 + 15,
      life: 200
    });
  }
}

// Click/tap explosion
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  explode(e.clientX, e.clientY - rect.top);
});

// Animation loop
function animate() {
  // Trail background
  ctx.fillStyle = "rgba(5, 6, 10, 0.2)";
  ctx.fillRect(0, 0, w, h);

  // Draw twinkling stars
  stars.forEach(s => {
    s.alpha += s.twinkleSpeed;
    if (s.alpha > 1 || s.alpha < 0.3) s.twinkleSpeed *= -1;
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  ctx.globalAlpha = 1;

  // Launch rockets occasionally
  if (Math.random() < 0.03) launchRocket();

  // Update & draw rockets + trails
  rockets.forEach((r, ri) => {
    // Add trail particle
    r.trail.push({ x: r.x, y: r.y, life: 30 });

    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.15; // gravity

    // Draw rocket (small white dot)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(r.x - 2, r.y - 4, 4, 8);

    // Draw trail
    r.trail.forEach((t, ti) => {
      t.life--;
      ctx.globalAlpha = t.life / 30;
      ctx.fillStyle = "#FFAA00";
      ctx.fillRect(t.x - 1, t.y, 2, 4 + t.life / 3);
      if (t.life <= 0) r.trail.splice(ti, 1);
    });

    // Explode if going up and slowing
    if (r.vy > 0 || r.y < h * 0.3) {
      explode(r.x, r.y);
      rockets.splice(ri, 1);
    }
  });
  ctx.globalAlpha = 1;

  // Random background explosions
  if (Math.random() < 0.04) {
    explode(Math.random() * w, Math.random() * h * 0.4);
  }

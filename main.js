// Main Sinter Vortex Engine Logic

// ==========================================
// 1. Vortex Engine (Fluid/Particle System)
// ==========================================
const canvas = document.getElementById('vortexCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
let particles = [];
const PARTICLE_COUNT = Math.min(window.innerWidth * window.innerHeight / 800, 3000); // Scale based on screen size

// "Systemic Viscosity" - close to 0 for superfluidity
const VISCOSITY = 0.94; // Velocity retention per frame (1.0 = zero friction, but unstable)
const BASE_SPEED = 1.2;
const VORTEX_STRENGTH = 0.08;
const GRAVITY_STRENGTH = 0.02;

let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
let lastMouse = { x: -1000, y: -1000 };
let mouseVelocity = 0; // Represents "Activity/Resonance"

// Initialize Canvas
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Update Nodes counter in UI
document.getElementById('nodeCount').innerText = PARTICLE_COUNT.toLocaleString();

// Particle Class (Represents "Capital" or "Labor" flowing)
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    
    // Syntropy colors: Cyan to Purple
    const hue = 180 + Math.random() * 80; // 180 (Cyan) to 260 (Purple)
    const sat = 70 + Math.random() * 30;
    const lit = 50 + Math.random() * 20;
    this.color = `hsl(${hue}, ${sat}%, ${lit}%)`;
    this.size = Math.random() * 1.5 + 0.5;
  }

  update(time) {
    // 1. Base vector field (Navier-Stokes fluid approximation)
    // Low frequency sine/cosine creates smooth laminar flow
    const scale = 0.003;
    const angle = Math.sin(this.x * scale + time) + Math.cos(this.y * scale + time);
    
    this.vx += Math.cos(angle) * BASE_SPEED * 0.1;
    this.vy += Math.sin(angle) * BASE_SPEED * 0.1;

    // 2. Pressure Gradient (Mouse Interaction)
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    // The "Opportunity Pressure" zone
    const radius = 350;
    if (dist < radius && dist > 0) {
      let force = (radius - dist) / radius;
      
      // Vortex curl (perpendicular force)
      this.vx += (dy / dist) * force * VORTEX_STRENGTH * 15;
      this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 15;
      
      // Gravity attraction (Resonant Pull)
      this.vx += (dx / dist) * force * GRAVITY_STRENGTH * 10;
      this.vy += (dy / dist) * force * GRAVITY_STRENGTH * 10;
    }

    // Apply systemic viscosity (friction)
    this.vx *= VISCOSITY;
    this.vy *= VISCOSITY;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Screen wrapping (Continuous manifold)
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// Instantiate particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Mouse Event Listeners
window.addEventListener('mousemove', (e) => {
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  
  // Calculate mouse velocity for the resonance graph
  let dx = mouse.x - lastMouse.x;
  let dy = mouse.y - lastMouse.y;
  mouseVelocity = Math.sqrt(dx * dx + dy * dy);
});

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
  mouseVelocity = 20; // Simulated constant velocity for touch
});

// ==========================================
// 2. Resonance Pulse (Waveform Graph)
// ==========================================
const resCanvas = document.getElementById('resonanceCanvas');
const resCtx = resCanvas.getContext('2d');
let resWidth, resHeight;
let waveData = [];
const MAX_WAVE_POINTS = 100;
let phase = 0;
let baseAmplitude = 5;

function resizeResonance() {
  resWidth = resCanvas.width = resCanvas.parentElement.clientWidth;
  resHeight = resCanvas.height = resCanvas.parentElement.clientHeight;
  
  // Initialize wave data
  waveData = new Array(MAX_WAVE_POINTS).fill(0);
}
window.addEventListener('resize', resizeResonance);
resizeResonance();

// UI Elements to update
const pulseStatus = document.getElementById('pulseStatus');
const injectionEvent = document.getElementById('injectionEvent');
const freqDisplay = document.getElementById('freqDisplay');

function updateResonanceGraph(activityLvl) {
  // Decay activity level smoothly
  mouseVelocity = mouseVelocity * 0.9;
  
  // Target amplitude based on activity
  let targetAmp = baseAmplitude + (mouseVelocity * 1.5);
  targetAmp = Math.min(targetAmp, resHeight / 2 - 5); // Cap amplitude
  
  // Update phase speed based on activity
  phase += 0.1 + (mouseVelocity * 0.01);
  
  // Shift wave data array and add new point
  waveData.shift();
  // Complex harmonic wave: combine multiple sine waves
  let newY = Math.sin(phase) * targetAmp 
           + Math.sin(phase * 2.5) * (targetAmp * 0.3)
           + (Math.random() - 0.5) * (mouseVelocity * 0.5); // Add "noise" when highly active
  waveData.push(newY);

  // Logic for UI Updates based on Resonance State
  let activityFactor = Math.min(100, mouseVelocity * 5);
  freqDisplay.innerText = Math.floor(432 + activityFactor * 2) + ' Hz';
  
  if (mouseVelocity > 30) {
    pulseStatus.innerText = "HARMONIC PEAK";
    pulseStatus.className = "text-[10px] font-mono text-emerald-400 font-bold";
    injectionEvent.style.opacity = "1";
  } else if (mouseVelocity < 1) {
    pulseStatus.innerText = "PHASE-OUT (INACTIVE)";
    pulseStatus.className = "text-[10px] font-mono text-rose-500";
    injectionEvent.style.opacity = "0";
  } else {
    pulseStatus.innerText = "HARMONIC PHASE";
    pulseStatus.className = "text-[10px] font-mono text-cyan-400";
    injectionEvent.style.opacity = "0";
  }

  // Draw Wave
  resCtx.clearRect(0, 0, resWidth, resHeight);
  
  // Draw center line
  resCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  resCtx.lineWidth = 1;
  resCtx.beginPath();
  resCtx.moveTo(0, resHeight / 2);
  resCtx.lineTo(resWidth, resHeight / 2);
  resCtx.stroke();

  // Draw wave line
  resCtx.beginPath();
  resCtx.strokeStyle = mouseVelocity > 30 ? '#34d399' : '#22d3ee'; // Emerald to Cyan
  resCtx.lineWidth = 2;
  resCtx.lineJoin = 'round';
  resCtx.shadowBlur = 10;
  resCtx.shadowColor = resCtx.strokeStyle;

  const sliceWidth = resWidth / (MAX_WAVE_POINTS - 1);
  for (let i = 0; i < MAX_WAVE_POINTS; i++) {
    const x = i * sliceWidth;
    const y = (resHeight / 2) + waveData[i];
    
    if (i === 0) {
      resCtx.moveTo(x, y);
    } else {
      resCtx.lineTo(x, y);
    }
  }
  resCtx.stroke();
  resCtx.shadowBlur = 0; // reset
}

// ==========================================
// 3. Main Animation Loop
// ==========================================
let time = 0;

function animate() {
  time += 0.005;

  // Fade effect for trails (The fluid look)
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; // Alpha controls trail length
  ctx.fillRect(0, 0, width, height);

  // Set composite operation for glowing overlapping particles
  ctx.globalCompositeOperation = 'lighter';

  // Update and draw particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles[i].update(time);
    particles[i].draw(ctx);
  }

  // Update secondary UI canvas
  updateResonanceGraph(mouseVelocity);

  requestAnimationFrame(animate);
}

// Start simulation
animate();

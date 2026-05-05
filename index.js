const canvas = document.getElementById('particles');
const fireCanvas = document.getElementById('fire-canvas');

const ctx = canvas.getContext('2d');
const fCtx = fireCanvas.getContext('2d');


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

fireCanvas.width = 60;
fireCanvas.height = 100;

let blownOut = false;
let smokeParticles = [];
let flameAlpha = 1;

let smokeActive = false;
let smokeDuration = 0;


const sparkles = [];
const TOTAL = 80;


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


function createSparkle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: 0,
        maxOpacity: Math.random() * 0.7 + 0.3,
        fadeSpeed: Math.random() * 0.02 + 0.005,
        fadingIn: true,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
    };
}

for (let i = 0; i < TOTAL; i++) {
    const s = createSparkle();
    s.opacity = Math.random() * s.maxOpacity;
    sparkles.push(s);
}

function drawSparkle(s) {

    ctx.save();
    ctx.globalAlpha = s.opacity;
    const col = s._color || '#A594F9';
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.lineWidth = s.size * 0.5;
    ctx.lineCap = 'round';

    const r = s.size * 3;

    ctx.beginPath(); ctx.moveTo(s.x - r, s.y); ctx.lineTo(s.x + r, s.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x, s.y - r); ctx.lineTo(s.x, s.y + r); ctx.stroke();

    const d = r * 0.5;
    ctx.lineWidth = s.size * 0.25;
    ctx.beginPath(); ctx.moveTo(s.x - d, s.y - d); ctx.lineTo(s.x + d, s.y + d); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x + d, s.y - d); ctx.lineTo(s.x - d, s.y + d); ctx.stroke();

    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of sparkles) {
        // mover
        s.x += s.dx;
        s.y += s.dy;

        // rebotar en bordes
        if (s.x < 0 || s.x > canvas.width) s.dx *= -1;
        if (s.y < 0 || s.y > canvas.height) s.dy *= -1;

        // parpadeo
        if (s.fadingIn) {
            s.opacity += s.fadeSpeed;
            if (s.opacity >= s.maxOpacity) s.fadingIn = false;
        } else {
            s.opacity -= s.fadeSpeed;
            if (s.opacity <= 0) {
                // renace en posición aleatoria
                Object.assign(s, createSparkle());
                s.opacity = 0;
                s.fadingIn = true;
            }
        }

        drawSparkle(s);
    }

    requestAnimationFrame(animate);
}

// ── VELA ─────────────────────────────────────────

class FlameParticle {
    constructor() { this.reset(); }
    reset() {
        this.x = fireCanvas.width / 2 + (Math.random() - 0.5) * 6;
        this.y = fireCanvas.height - 20;
        this.vy = -(Math.random() * 1.5 + 0.8);
        this.vx = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 6 + 4;
        this.alpha = 1;
        this.life = 0;
        this.maxLife = Math.random() * 20 + 15;
    }
    update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        this.size *= 0.95;
        this.alpha = 1 - this.life / this.maxLife;
    }
    draw() {
        const t = this.life / this.maxLife;
        const r = 255;
        const g = Math.floor(180 * (1 - t) + 255 * t);
        const b = 0;
        fCtx.save();
        fCtx.globalAlpha = this.alpha * flameAlpha;
        fCtx.fillStyle = `rgb(${r},${g},${b})`;
        fCtx.shadowColor = 'orange';
        fCtx.shadowBlur = 10;
        fCtx.beginPath();
        fCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();
    }
    isDead() { return this.life >= this.maxLife; }
}

class SmokeParticle {
    constructor() {
        this.x = fireCanvas.width / 2 + (Math.random() - 0.5) * 4;
        this.y = fireCanvas.height - 15;
        this.vy = -(Math.random() * 0.8 + 0.4);
        this.vx = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 4 + 3;
        this.alpha = 0.6;
        this.life = 0;
        this.maxLife = Math.random() * 15 + 10;
    }
    update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        this.size += 0.3;
        this.alpha = 0.5 * (1 - this.life / this.maxLife);
    }
    draw() {
        fCtx.save();
        fCtx.globalAlpha = this.alpha;
        fCtx.fillStyle = `rgb(180,180,180)`;
        fCtx.beginPath();
        fCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();
    }
    isDead() { return this.life >= this.maxLife; }
}

let flameParticles = Array.from({ length: 20 }, () => {
    const p = new FlameParticle();
    p.life = Math.floor(Math.random() * p.maxLife);
    return p;
});

document.addEventListener('keydown', () => {
    if (blownOut) return;
    blownOut = true;
    smokeActive = true;
    smokeDuration = 0;

    document.querySelector('.box-title').classList.add('slide-down');
    triggerStarExplosion();
});

document.addEventListener('click', () => {
    if (blownOut) return;
    blownOut = true;
    smokeActive = true;
    smokeDuration = 0;

    document.querySelector('.box-title').classList.add('slide-down');
    triggerStarExplosion();
});

function animateFire() {
    fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);

    if (!blownOut) {
        flameParticles.forEach((p, i) => {
            p.update();
            p.draw();
            if (p.isDead()) flameParticles[i] = new FlameParticle();
        });
    } else {
        flameAlpha = Math.max(0, flameAlpha - 0.09);

        if (flameAlpha > 0) {
            flameParticles.forEach(p => { p.update(); p.draw(); });
        }

        if (smokeActive) {
            smokeDuration++;
            if (smokeDuration < 30) {
                smokeParticles.push(new SmokeParticle());
            } else {
                smokeActive = false;
            }
        }

        smokeParticles.forEach(p => { p.update(); p.draw(); });
        smokeParticles = smokeParticles.filter(p => !p.isDead());
    }

    requestAnimationFrame(animateFire);
}

// ── EXPLOSIÓN DE ESTRELLAS ────────────────────────────────────

function triggerStarExplosion() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bdf', '#ff922b', '#cc5de8'];
    const bursts = 5;

    for (let b = 0; b < bursts; b++) {
        setTimeout(() => {
            const bx = Math.random() * canvas.width;
            const by = Math.random() * canvas.height * 0.8;
            const count = 18;
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i;
                const speed = Math.random() * 2.5 + 1;

                sparkles.push({
                    x: bx,
                    y: by,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.7 + 0.3,
                    maxOpacity: Math.random() * 0.7 + 0.3,
                    fadeSpeed: Math.random() * 0.015 + 0.008,
                    fadingIn: false, // ya visibles, empiezan a desvanecerse
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    _color: color, // color de explosión
                    _explosion: true,
                });
            }
        }, b * 300); // cada burst separado 300ms
    }
}

new CircleType(document.getElementById('text-title'))
    .radius(500);

animateFire();
animate();

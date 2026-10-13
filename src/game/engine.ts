import type { Level, Log } from "./levels";

export type HudState = {
  energy: number;
  integrity: number;
  collected: number;
  total: number;
  interacted: number;
  totalInteract: number;
  objective: string;
  levelName: string;
  levelIcon: string;
  levelIndex: number;
  totalLevels: number;
};

export type EngineCallbacks = {
  onLog: (log: Log) => void;
  onHud: (h: HudState) => void;
  onComplete: () => void;
  onGameOver: (reason: string) => void;
};

export type InputState = { left: boolean; right: boolean; jump: boolean; interact: boolean };

const GRAVITY = 1900;
const MOVE = 300;
const JUMP = -720;
const VIEW_H = 720;
const PLAYER_R = 15;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string };
type RBC = { x: number; y: number; r: number; speed: number; layer: number; wobble: number };

export class NanoEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: Level;
  private cb: EngineCallbacks;
  input: InputState = { left: false, right: false, jump: false, interact: false };

  private raf = 0;
  private last = 0;
  paused = false;
  private done = false;

  private px = 0; private py = 0;
  private vx = 0; private vy = 0;
  private onGround = false;
  private coyote = 0;
  private jumpBuf = 0;
  private prevJump = false;
  private prevInteract = false;
  private facing = 1;
  private invuln = 0;
  private thrustAnim = 0;

  private energy = 100;
  private integrity = 100;
  private collected = new Set<number>();
  private interacted = new Set<number>();

  private camX = 0;
  private camY = 0;
  private scale = 1;
  private vw = 1280;

  private particles: Particle[] = [];
  private rbcs: RBC[] = [];
  private t = 0;
  private hudTimer = 0;
  private resizeObs: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, level: Level, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.level = level;
    this.cb = cb;
    this.px = level.start.x;
    this.py = level.start.y;

    // hemácias de fundo (determinísticas, geradas por índice)
    for (let i = 0; i < 46; i++) {
      const layer = i % 3; // 0 longe, 1 meio, 2 perto
      this.rbcs.push({
        x: (i * 733) % level.width,
        y: 60 + ((i * 389) % (level.height - 140)),
        r: 14 + ((i * 37) % 22),
        speed: (12 + ((i * 53) % 30)) * (0.4 + layer * 0.4),
        layer,
        wobble: (i * 91) % 628,
      });
    }

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas.parentElement ?? canvas);
    this.resize();
    this.emitHud();
  }

  private resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.scale = (h * dpr) / VIEW_H;
    this.vw = (w * dpr) / this.scale;
  }

  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      if (!this.paused && !this.done) this.update(dt);
      this.render();
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
  }

  setPaused(p: boolean) {
    this.paused = p;
    this.last = performance.now();
  }

  private emitHud() {
    this.cb.onHud({
      energy: Math.max(0, Math.round(this.energy)),
      integrity: Math.max(0, Math.round(this.integrity)),
      collected: this.collected.size,
      total: this.level.collectibles.length,
      interacted: this.interacted.size,
      totalInteract: this.level.interactables.length,
      objective: this.level.objective,
      levelName: this.level.name,
      levelIcon: this.level.icon,
      levelIndex: this.level.id,
      totalLevels: 4,
    });
  }

  private burst(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const sp = 60 + ((i * 97) % 120);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0, max: 0.6 + ((i * 31) % 40) / 100,
        size: 2 + ((i * 13) % 3),
        color,
      });
    }
  }

  private update(dt: number) {
    this.t += dt;
    const L = this.level;

    // energia
    this.energy -= L.energyDrain * dt;
    if (this.energy <= 0) return this.gameOver("A energia do nanorrobô acabou. Gerencie melhor seus impulsos!");

    // input horizontal
    const accel = this.onGround ? 2600 : 1600;
    if (this.input.left) { this.vx = Math.max(this.vx - accel * dt, -MOVE); this.facing = -1; }
    else if (this.input.right) { this.vx = Math.min(this.vx + accel * dt, MOVE); this.facing = 1; }
    else this.vx *= this.onGround ? Math.pow(0.0001, dt) : Math.pow(0.02, dt);

    // pulo com buffer + coyote
    if (this.input.jump && !this.prevJump) this.jumpBuf = 0.12;
    this.prevJump = this.input.jump;
    this.jumpBuf -= dt;
    this.coyote -= dt;
    if (this.jumpBuf > 0 && (this.onGround || this.coyote > 0)) {
      this.vy = JUMP;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.thrustAnim = 0.3;
      this.burst(this.px, this.py + PLAYER_R, "#7dd3fc", 8);
    }
    // impulso contínuo no ar (segurar espaço)
    if (this.input.jump && !this.onGround && this.vy < 0) this.vy -= 300 * dt;

    this.vy += GRAVITY * dt;
    if (this.vy > 900) this.vy = 900;
    this.thrustAnim = Math.max(0, this.thrustAnim - dt);
    this.invuln = Math.max(0, this.invuln - dt);

    // movimento X + colisão
    this.px += this.vx * dt;
    for (const p of L.platforms) {
      if (this.overlap(p)) {
        if (this.vx > 0) this.px = p.x - PLAYER_R;
        else if (this.vx < 0) this.px = p.x + p.w + PLAYER_R;
        this.vx = 0;
      }
    }
    // movimento Y + colisão
    const wasGround = this.onGround;
    this.onGround = false;
    this.py += this.vy * dt;
    for (const p of L.platforms) {
      if (this.overlap(p)) {
        if (this.vy > 0) { this.py = p.y - PLAYER_R; this.onGround = true; }
        else if (this.vy < 0) this.py = p.y + p.h + PLAYER_R;
        this.vy = 0;
      }
    }
    if (wasGround && !this.onGround) this.coyote = 0.1;

    // limites do mundo
    this.px = Math.max(PLAYER_R, Math.min(L.width - PLAYER_R, this.px));
    if (this.py > L.height + 200) return this.gameOver("O nanorrobô saiu do vaso sanguíneo e se perdeu no tecido.");

    // partículas de propulsor
    if ((Math.abs(this.vx) > 40 || this.thrustAnim > 0) && this.t % 0.05 < dt) {
      this.particles.push({
        x: this.px - this.facing * 12, y: this.py + 8,
        vx: -this.facing * 60, vy: 30, life: 0, max: 0.4, size: 2.5, color: "#38bdf8",
      });
    }

    // coletáveis
    L.collectibles.forEach((c, i) => {
      if (this.collected.has(i)) return;
      const d = Math.hypot(c.x - this.px, c.y - this.py);
      if (d < PLAYER_R + 18) {
        this.collected.add(i);
        if (c.label.includes("energia")) this.energy = Math.min(100, this.energy + 30);
        this.burst(c.x, c.y, "#4ade80", 14);
        this.cb.onLog(c.log);
        this.emitHud();
      }
    });

    // interagíveis (tecla E)
    const interactPressed = this.input.interact && !this.prevInteract;
    this.prevInteract = this.input.interact;
    L.interactables.forEach((it, i) => {
      if (this.interacted.has(i)) return;
      const d = Math.hypot(it.x - this.px, it.y - this.py);
      if (d < 70 && interactPressed) {
        this.interacted.add(i);
        this.burst(it.x, it.y, "#facc15", 12);
        this.cb.onLog(it.log);
        this.emitHud();
      }
    });

    // perigos (leucócitos)
    for (const h of L.hazards) {
      const hx = h.axis === "x" ? h.x + Math.sin(this.t * h.speed) * h.range : h.x;
      const hy = h.axis === "y" ? h.y + Math.sin(this.t * h.speed) * h.range : h.y;
      if (Math.hypot(hx - this.px, hy - this.py) < h.r + PLAYER_R && this.invuln <= 0) {
        this.integrity -= 20;
        this.invuln = 1.2;
        this.vy = -420;
        this.vx = this.px < hx ? -320 : 320;
        this.burst(this.px, this.py, "#f87171", 16);
        this.emitHud();
        if (this.integrity <= 0) return this.gameOver("Os leucócitos destruíram o nanorrobô. O sistema imune venceu desta vez!");
      }
    }

    // objetivo
    const g = L.goal;
    const needInteract = L.interactables.length;
    if (
      this.collected.size >= L.collectibles.length &&
      this.interacted.size >= needInteract &&
      Math.abs(this.px - g.x) < 46 && Math.abs(this.py - g.y) < 70
    ) {
      this.done = true;
      this.burst(g.x, g.y, "#4ade80", 30);
      this.cb.onComplete();
      return;
    }

    // câmera suave
    const targetX = Math.max(0, Math.min(L.width - this.vw, this.px - this.vw / 2));
    const targetY = Math.max(0, Math.min(L.height - VIEW_H, this.py - VIEW_H / 2));
    this.camX += (targetX - this.camX) * Math.min(1, dt * 6);
    this.camY += (targetY - this.camY) * Math.min(1, dt * 6);

    // partículas
    this.particles = this.particles.filter((p) => {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      return p.life < p.max;
    });

    // hemácias à deriva
    for (const r of this.rbcs) {
      r.x -= r.speed * dt;
      if (r.x < -60) r.x = L.width + 60;
    }

    this.hudTimer += dt;
    if (this.hudTimer > 0.25) { this.hudTimer = 0; this.emitHud(); }
  }

  private overlap(p: { x: number; y: number; w: number; h: number }) {
    return (
      this.px + PLAYER_R > p.x && this.px - PLAYER_R < p.x + p.w &&
      this.py + PLAYER_R > p.y && this.py - PLAYER_R < p.y + p.h
    );
  }

  private gameOver(reason: string) {
    if (this.done) return;
    this.done = true;
    this.cb.onGameOver(reason);
  }

  private render() {
    const { ctx, scale } = this;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const L = this.level;

    ctx.clearRect(0, 0, W, H);

    // fundo: interior do vaso
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1a0510");
    bg.addColorStop(0.5, "#2b0a18");
    bg.addColorStop(1, "#1a0510");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.scale(scale, scale);

    // parallax: hemácias distantes
    for (const r of this.rbcs) {
      const par = [0.25, 0.5, 0.85][r.layer]!;
      const sx = r.x - this.camX * par;
      const sy = r.y - this.camY * par + Math.sin(this.t * 1.5 + r.wobble) * 8;
      if (sx < -60 || sx > this.vw + 60) continue;
      const alpha = [0.12, 0.2, 0.32][r.layer]!;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.ellipse(sx, sy, r.r, r.r * 0.62, Math.sin(this.t + r.wobble) * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.ellipse(sx, sy, r.r * 0.5, r.r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.translate(-this.camX, -this.camY);

    // plataformas (tecido do vaso)
    for (const p of L.platforms) {
      if (p.x + p.w < this.camX - 50 || p.x > this.camX + this.vw + 50) continue;
      const grad = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      grad.addColorStop(0, "#5b1530");
      grad.addColorStop(1, "#3a0d20");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 10);
      ctx.fill();
      ctx.fillStyle = "rgba(244,114,182,0.35)";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, 5, 3);
      ctx.fill();
    }

    // coletáveis
    L.collectibles.forEach((c, i) => {
      if (this.collected.has(i)) return;
      const pulse = 1 + Math.sin(this.t * 4 + i) * 0.15;
      const isEnergy = c.label.includes("energia");
      const col = isEnergy ? "#facc15" : "#4ade80";
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 22;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(c.x, c.y + Math.sin(this.t * 2 + i) * 5, 11 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(c.x - 3, c.y + Math.sin(this.t * 2 + i) * 5 - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // interagíveis
    L.interactables.forEach((it, i) => {
      const doneIt = this.interacted.has(i);
      ctx.save();
      ctx.shadowColor = doneIt ? "#64748b" : "#facc15";
      ctx.shadowBlur = doneIt ? 4 : 16;
      ctx.fillStyle = doneIt ? "#475569" : "#a16207";
      ctx.beginPath();
      ctx.roundRect(it.x - 16, it.y - 20, 32, 40, 6);
      ctx.fill();
      ctx.fillStyle = doneIt ? "#94a3b8" : "#fde047";
      ctx.fillRect(it.x - 9, it.y - 13, 18, 12);
      ctx.restore();
      const d = Math.hypot(it.x - this.px, it.y - this.py);
      if (d < 70 && !doneIt) {
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 15px 'Exo 2', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("[E] Inspecionar", it.x, it.y - 34);
      }
    });

    // perigos: leucócitos
    for (const h of L.hazards) {
      const hx = h.axis === "x" ? h.x + Math.sin(this.t * h.speed) * h.range : h.x;
      const hy = h.axis === "y" ? h.y + Math.sin(this.t * h.speed) * h.range : h.y;
      if (hx < this.camX - 80 || hx > this.camX + this.vw + 80) continue;
      ctx.save();
      ctx.shadowColor = "#e2e8f0";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(hx, hy, h.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      for (let k = 0; k < 5; k++) {
        const a = this.t * 2 + (k * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(hx + Math.cos(a) * h.r * 0.45, hy + Math.sin(a) * h.r * 0.45, h.r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // objetivo
    const g = L.goal;
    const unlocked = this.collected.size >= L.collectibles.length && this.interacted.size >= L.interactables.length;
    ctx.save();
    ctx.shadowColor = unlocked ? "#4ade80" : "#64748b";
    ctx.shadowBlur = unlocked ? 30 : 8;
    ctx.strokeStyle = unlocked ? "#4ade80" : "#64748b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 38 + Math.sin(this.t * 3) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = unlocked ? "rgba(74,222,128,0.25)" : "rgba(100,116,139,0.15)";
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = unlocked ? "#bbf7d0" : "#94a3b8";
    ctx.font = "bold 14px 'Exo 2', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g.label, g.x, g.y - 56);
    if (!unlocked) {
      ctx.font = "12px 'Exo 2', sans-serif";
      ctx.fillText("(complete os objetivos primeiro)", g.x, g.y + 62);
    }

    // partículas
    for (const p of this.particles) {
      ctx.globalAlpha = 1 - p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // jogador: nanorrobô
    const blink = this.invuln > 0 && Math.floor(this.t * 12) % 2 === 0;
    if (!blink) {
      ctx.save();
      ctx.translate(this.px, this.py);
      // propulsor
      if (Math.abs(this.vx) > 40 || this.thrustAnim > 0) {
        ctx.fillStyle = "rgba(56,189,248,0.7)";
        ctx.beginPath();
        ctx.moveTo(-this.facing * 10, -5);
        ctx.lineTo(-this.facing * (22 + Math.sin(this.t * 30) * 5), 0);
        ctx.lineTo(-this.facing * 10, 5);
        ctx.fill();
      }
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 26;
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(this.facing * 4, -3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(this.facing * 5, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      // anel orbital
      ctx.strokeStyle = "rgba(125,211,252,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, PLAYER_R + 6, 6, Math.sin(this.t * 2) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS, LEARNINGS, type Log } from "./levels";
import { NanoEngine, type HudState } from "./engine";

type Screen = "menu" | "howto" | "info" | "intro" | "playing" | "paused" | "complete" | "gameover" | "end";
const KEY = "nanomissao-save-v2";

export function Game() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [levelIdx, setLevelIdx] = useState(0);
  const [hud, setHud] = useState<HudState | null>(null);
  const [log, setLog] = useState<Log | null>(null);
  const [gameOverReason, setGameOverReason] = useState("");
  const [hasSave, setHasSave] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NanoEngine | null>(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v.levelIdx > 0 && v.levelIdx < LEVELS.length) setHasSave(true);
      }
    } catch {}
  }, []);

  const startLevel = useCallback((idx: number) => {
    setLevelIdx(idx);
    setLog(null);
    setScreen("playing");
    localStorage.setItem(KEY, JSON.stringify({ levelIdx: idx }));
  }, []);

  // cria/destrói o motor quando entra na tela de jogo
  useEffect(() => {
    if (screen !== "playing" && screen !== "paused") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new NanoEngine(canvas, LEVELS[levelIdx]!, {
      onLog: (l) => setLog(l),
      onHud: (h) => setHud(h),
      onComplete: () => {
        if (levelIdx + 1 >= LEVELS.length) {
          localStorage.removeItem(KEY);
          setScreen("end");
        } else setScreen("complete");
      },
      onGameOver: (reason) => {
        setGameOverReason(reason);
        setScreen("gameover");
      },
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen === "playing" || screen === "paused" ? levelIdx : null, screen === "playing" || screen === "paused"]);

  // pausa reflete no motor
  useEffect(() => {
    engineRef.current?.setPaused(screen !== "playing");
  }, [screen]);

  // teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        if (screenRef.current === "playing") setScreen("paused");
        else if (screenRef.current === "paused") setScreen("playing");
        return;
      }
      if (!eng || screenRef.current !== "playing") return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") eng.input.left = true;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") eng.input.right = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") eng.input.jump = true;
      if (e.key.toLowerCase() === "e") eng.input.interact = true;
    };
    const up = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (!eng) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") eng.input.left = false;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") eng.input.right = false;
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") eng.input.jump = false;
      if (e.key.toLowerCase() === "e") eng.input.interact = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const toMenu = () => {
    setScreen("menu");
    setHasSave(true);
  };
  const restartAll = () => {
    localStorage.removeItem(KEY);
    setHasSave(false);
    setLevelIdx(0);
    setScreen("intro");
  };
  const resume = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY)!);
      setLevelIdx(v.levelIdx);
      setScreen("intro");
    } catch {
      restartAll();
    }
  };

  const level = LEVELS[levelIdx]!;
  const inGame = screen === "playing" || screen === "paused" || screen === "complete" || screen === "gameover";

  const touchBtn = (key: "left" | "right" | "jump" | "interact", label: string, cls = "") => (
    <button
      className={`touch-btn ${cls}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        if (engineRef.current) engineRef.current.input[key] = true;
      }}
      onPointerUp={() => {
        if (engineRef.current) engineRef.current.input[key] = false;
      }}
      onPointerLeave={() => {
        if (engineRef.current) engineRef.current.input[key] = false;
      }}
      onPointerCancel={() => {
        if (engineRef.current) engineRef.current.input[key] = false;
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="nano-bg relative min-h-screen overflow-hidden">
      {screen === "menu" && (
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 text-center">
          <div className="nanobot mb-6" aria-hidden />
          <h1 className="font-display glow-text text-4xl font-black tracking-wider sm:text-7xl">NanoMissão</h1>
          <p className="font-display mt-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-base">Operação Corpo Humano</p>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Pilote um nanorrobô médico por dentro do corpo humano em 4 missões de exploração: colete amostras, desvie de leucócitos, entregue medicamentos e torne o tratamento acessível.
          </p>
          <button className="btn-hero mt-8" onClick={restartAll}>▶ JOGAR</button>
          {hasSave && <button className="btn-ghost mt-3" onClick={resume}>Continuar missão salva</button>}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button className="btn-ghost" onClick={() => setScreen("howto")}>🎮 Controles</button>
            <button className="btn-ghost" onClick={() => setScreen("info")}>🧬 O que é nanotecnologia médica?</button>
          </div>
        </div>
      )}

      {screen === "howto" && (
        <Panel title="Controles" onBack={() => setScreen("menu")}>
          <ul className="space-y-3 text-muted-foreground">
            <li>⬅️➡️ <b className="text-foreground">Setas ou A/D</b>: mover o nanorrobô.</li>
            <li>␣ <b className="text-foreground">Espaço</b>: pular / impulsionar (segure para impulso maior). Pressione de novo no ar para <b className="text-foreground">pulo duplo</b>.</li>
            <li>🔍 <b className="text-foreground">E</b>: interagir com equipamentos e pontos de risco.</li>
            <li>⏸️ <b className="text-foreground">Esc ou P</b>: pausar.</li>
            <li>📱 <b className="text-foreground">No celular</b>: use os botões de toque na tela.</li>
            <li>🩸 Desvie dos <b className="text-foreground">leucócitos</b> — eles danificam seu equipamento.</li>
            <li>🔋 Fique de olho na <b className="text-foreground">energia</b>: se acabar, a missão falha.</li>
          </ul>
        </Panel>
      )}

      {screen === "info" && (
        <Panel title="O que é nanotecnologia médica?" onBack={() => setScreen("menu")}>
          <div className="space-y-3 text-muted-foreground">
            <p><b className="text-foreground">Nanotecnologia</b> é o estudo e a manipulação de materiais na escala de 1 a 100 nanômetros — um nanômetro é um bilionésimo de metro. Um fio de cabelo tem cerca de 80.000 nm de espessura!</p>
            <p>Na <b className="text-foreground">medicina</b>, ela é usada e pesquisada para: diagnóstico por imagem, nanossensores, liberação direcionada de fármacos (lipossomas, nanopartículas poliméricas), vacinas (como as de RNA com nanopartículas lipídicas) e engenharia de tecidos.</p>
            <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">⚠️ Este jogo tem fins educativos. Não promete curas e não substitui orientação médica.</p>
          </div>
        </Panel>
      )}

      {screen === "intro" && (
        <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
          <div className="card-glass fade-in p-6 sm:p-10">
            <div className="text-6xl">{level.icon}</div>
            <p className="font-display mt-4 text-sm uppercase tracking-widest text-accent">Missão {level.id} de {LEVELS.length}</p>
            <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">{level.name}</h2>
            <p className="mt-4 text-muted-foreground">{level.intro}</p>
            <p className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-primary">🎯 {level.objective}</p>
            <button className="btn-hero mt-8" onClick={() => startLevel(levelIdx)}>Iniciar missão</button>
          </div>
        </div>
      )}

      {inGame && (
        <div className="fixed inset-0 z-20 flex flex-col bg-background">
          {/* HUD */}
          {hud && (
            <div className="game-hud">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold">{hud.levelIcon} M{hud.levelIndex}/{hud.totalLevels}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{hud.objective}</span>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3">
                <MiniBar label="🔋" v={hud.energy} kind="progress" title="Energia" />
                <MiniBar label="🛡️" v={hud.integrity} kind="safety" title="Integridade" />
                <span className="chip text-xs">🧪 {hud.collected}/{hud.total}{hud.totalInteract > 0 ? ` · 🔍 ${hud.interacted}/${hud.totalInteract}` : ""}</span>
                <button className="btn-ghost btn-sm" onClick={() => setScreen("paused")}>⏸</button>
              </div>
            </div>
          )}

          {/* canvas */}
          <div className="relative flex-1">
            <canvas ref={canvasRef} className="block h-full w-full" />

            {/* registro de missão */}
            {log && screen === "playing" && (
              <div className="mission-log fade-in">
                <p className="font-display text-sm font-bold text-accent">{log.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{log.text}</p>
                <button className="btn-ghost btn-sm mt-2" onClick={() => setLog(null)}>Fechar ✕</button>
              </div>
            )}

            {/* controles de toque */}
            {isTouch && screen === "playing" && (
              <>
                <div className="touch-cluster left">
                  {touchBtn("left", "◀")}
                  {touchBtn("right", "▶")}
                </div>
                <div className="touch-cluster right">
                  {touchBtn("interact", "E", "touch-interact")}
                  {touchBtn("jump", "⤒", "touch-jump")}
                </div>
              </>
            )}

            {/* pausa */}
            {screen === "paused" && (
              <Overlay title="⏸️ Pausado" sub={level.name}>
                <button className="btn-hero" onClick={() => setScreen("playing")}>Continuar</button>
                <button className="btn-ghost" onClick={() => startLevel(levelIdx)}>Reiniciar missão</button>
                <button className="btn-ghost" onClick={toMenu}>Menu principal</button>
              </Overlay>
            )}

            {/* missão completa */}
            {screen === "complete" && (
              <Overlay title="✅ Missão cumprida!" sub={`${level.icon} ${level.name}`}>
                <p className="max-w-md text-sm text-muted-foreground">Excelente trabalho, operador(a). Próxima missão: <b className="text-foreground">{LEVELS[levelIdx + 1]!.name}</b></p>
                <button className="btn-hero" onClick={() => { setLevelIdx(levelIdx + 1); setScreen("intro"); localStorage.setItem(KEY, JSON.stringify({ levelIdx: levelIdx + 1 })); }}>Próxima missão →</button>
                <button className="btn-ghost" onClick={() => startLevel(levelIdx)}>Rejogar esta missão</button>
              </Overlay>
            )}

            {/* game over */}
            {screen === "gameover" && (
              <Overlay title="💥 Missão falhou" sub={level.name}>
                <p className="max-w-md text-sm text-muted-foreground">{gameOverReason}</p>
                <button className="btn-hero" onClick={() => startLevel(levelIdx)}>Tentar de novo</button>
                <button className="btn-ghost" onClick={toMenu}>Menu principal</button>
              </Overlay>
            )}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
          <div className="card-glass fade-in p-6 text-center sm:p-10">
            <div className="text-6xl">🏆</div>
            <p className="font-display mt-3 text-sm uppercase tracking-widest text-accent">Operação Corpo Humano concluída</p>
            <h2 className="font-display glow-text mt-1 text-3xl font-black sm:text-4xl">Nanocientista de Verdade</h2>
            <p className="mt-3 text-muted-foreground">Você explorou a corrente sanguínea, entregou medicamentos, garantiu a segurança e lutou pelo acesso justo ao tratamento.</p>
          </div>
          <div className="card-glass fade-in mt-6 p-6">
            <h3 className="font-display text-xl font-bold">O que você aprendeu na missão</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LEARNINGS.map((l) => (
                <div key={l.t} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="font-display font-bold text-accent">{l.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{l.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Conteúdo introdutório e educativo. Não substitui orientação médica.</p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-hero" onClick={restartAll}>Jogar novamente</button>
            <button className="btn-ghost" onClick={() => { localStorage.removeItem(KEY); setHasSave(false); setScreen("menu"); }}>Voltar ao menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniBar({ label, v, kind, title }: { label: string; v: number; kind: string; title: string }) {
  return (
    <div className="w-20 sm:w-28" title={title}>
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>{label}</span><span>{v}%</span></div>
      <div className="bar-track mt-0.5 !h-1.5"><div className={`bar-fill bar-${kind}`} style={{ width: `${v}%` }} /></div>
    </div>
  );
}

function Overlay({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="card-glass fade-in mx-4 flex max-w-lg flex-col items-center gap-3 p-8 text-center">
        <h2 className="font-display glow-text text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
        {children}
      </div>
    </div>
  );
}

function Panel({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
      <div className="card-glass fade-in p-6 sm:p-10">
        <h2 className="font-display glow-text text-2xl font-bold sm:text-3xl">{title}</h2>
        <div className="mt-6">{children}</div>
        <button className="btn-hero mt-8" onClick={onBack}>← Voltar ao menu</button>
      </div>
    </div>
  );
}

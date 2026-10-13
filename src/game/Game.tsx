import { useEffect, useState } from "react";
import { PHASES, LEARNINGS, type Option } from "./data";

type Screen = "menu" | "info" | "howto" | "phaseIntro" | "challenge" | "end";
type Decision = { phase: string; challenge: string; choice: string; quality: Option["quality"] };
type State = {
  screen: Screen;
  phase: number;
  ch: number;
  picked: number | null;
  score: number;
  safety: number;
  budget: number;
  decisions: Decision[];
};

const INITIAL: State = { screen: "menu", phase: 0, ch: 0, picked: null, score: 0, safety: 70, budget: 100, decisions: [] };
const KEY = "nanomissao-save";
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const TOTAL = PHASES.reduce((a, p) => a + p.challenges.length, 0);

export function Game() {
  const [s, setS] = useState<State>(INITIAL);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHasSave(JSON.parse(raw).screen !== "menu");
    } catch {}
  }, []);
  useEffect(() => {
    if (s.screen === "challenge" || s.screen === "phaseIntro" || s.screen === "end") localStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);

  const go = (screen: Screen) => setS((p) => ({ ...p, screen }));
  const restart = () => { localStorage.removeItem(KEY); setHasSave(false); setS({ ...INITIAL, screen: "phaseIntro" }); };
  const resume = () => { try { setS(JSON.parse(localStorage.getItem(KEY)!)); } catch { restart(); } };
  const toMenu = () => { setS((p) => ({ ...p, screen: "menu" })); setHasSave(true); };

  const phase = PHASES[s.phase];
  const challenge = phase?.challenges[s.ch];
  const done = s.decisions.length;

  const pick = (i: number) => {
    if (s.picked !== null) return;
    const o = challenge.options[i];
    setS((p) => ({
      ...p,
      picked: i,
      score: p.score + o.points,
      safety: clamp(p.safety + o.safety),
      budget: clamp(p.budget + o.budget),
      decisions: [...p.decisions, { phase: phase.name, challenge: challenge.title, choice: o.text, quality: o.quality }],
    }));
  };
  const next = () => {
    if (s.picked === null) return;
    if (s.ch + 1 < phase.challenges.length) setS((p) => ({ ...p, ch: p.ch + 1, picked: null }));
    else if (s.phase + 1 < PHASES.length) setS((p) => ({ ...p, phase: p.phase + 1, ch: 0, picked: null, screen: "phaseIntro" }));
    else setS((p) => ({ ...p, picked: null, screen: "end" }));
  };

  return (
    <div className="nano-bg relative min-h-screen overflow-hidden">
      <Particles />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {s.screen === "menu" && (
          <div className="fade-in flex min-h-[85vh] flex-col items-center justify-center text-center">
            <div className="nanobot mb-6" aria-hidden />
            <h1 className="font-display glow-text text-5xl font-black tracking-wider sm:text-7xl">NanoMissão</h1>
            <p className="font-display mt-2 text-sm uppercase tracking-[0.3em] text-accent sm:text-base">Salvando o Corpo Humano</p>
            <p className="mt-6 text-xl text-primary">"A ciência está em suas mãos"</p>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Lidere uma equipe de nanomedicina em 4 fases: investigação, tratamento, segurança e bioética. Suas decisões afetam a pontuação, a segurança do paciente e o orçamento.
            </p>
            <button className="btn-hero mt-8" onClick={restart}>INICIAR MISSÃO</button>
            {hasSave && <button className="btn-ghost mt-3" onClick={resume}>Continuar missão salva</button>}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="btn-ghost" onClick={() => go("howto")}>📘 Instruções</button>
              <button className="btn-ghost" onClick={() => go("info")}>🧬 O que é nanotecnologia médica?</button>
            </div>
          </div>
        )}

        {s.screen === "howto" && (
          <Panel title="Instruções" onBack={() => go("menu")}>
            <ul className="space-y-3 text-muted-foreground">
              <li>🎯 São <b className="text-foreground">4 fases</b> com <b className="text-foreground">3 desafios</b> cada.</li>
              <li>🧠 Escolha uma alternativa: você recebe feedback e uma explicação científica imediatamente.</li>
              <li>⭐ <b className="text-foreground">Pontos</b>: aumentam com decisões responsáveis.</li>
              <li>🛡️ <b className="text-foreground">Segurança</b>: representa o bem-estar do paciente e da sociedade.</li>
              <li>💰 <b className="text-foreground">Orçamento</b>: recursos da equipe. Gaste com sabedoria.</li>
              <li>🔒 Não é possível avançar sem responder ao desafio atual.</li>
              <li>💾 O progresso é salvo automaticamente neste dispositivo.</li>
            </ul>
          </Panel>
        )}

        {s.screen === "info" && (
          <Panel title="O que é nanotecnologia médica?" onBack={() => go("menu")}>
            <div className="space-y-3 text-muted-foreground">
              <p><b className="text-foreground">Nanotecnologia</b> é o estudo e a manipulação de materiais na escala de 1 a 100 nanômetros — um nanômetro é um bilionésimo de metro. Um fio de cabelo tem cerca de 80.000 nm de espessura!</p>
              <p>Na <b className="text-foreground">medicina</b>, ela é usada e pesquisada para: diagnóstico por imagem, nanossensores, liberação direcionada de fármacos (lipossomas, nanopartículas poliméricas), vacinas (como as de RNA com nanopartículas lipídicas) e engenharia de tecidos.</p>
              <p><b className="text-foreground">Biotecnologia</b> usa organismos e moléculas biológicas para criar produtos e soluções — e frequentemente se combina com a nanotecnologia.</p>
              <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">⚠️ Este jogo tem fins educativos. Não promete curas e não substitui orientação médica.</p>
            </div>
          </Panel>
        )}

        {(s.screen === "phaseIntro" || s.screen === "challenge") && (
          <HUD s={s} done={done} onMenu={toMenu} onRestart={restart} />
        )}

        {s.screen === "phaseIntro" && (
          <div className="card-glass fade-in mt-6 p-6 text-center sm:p-10" key={`pi${s.phase}`}>
            <div className="text-6xl">{phase.icon}</div>
            <p className="font-display mt-4 text-sm uppercase tracking-widest text-accent">Fase {phase.id} de {PHASES.length}</p>
            <h2 className="font-display mt-1 text-3xl font-bold">{phase.name}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{phase.intro}</p>
            <button className="btn-hero mt-8" onClick={() => go("challenge")}>Começar fase</button>
          </div>
        )}

        {s.screen === "challenge" && (
          <div className="card-glass fade-in mt-6 p-5 sm:p-8" key={`c${s.phase}-${s.ch}`}>
            <p className="font-display text-xs uppercase tracking-widest text-accent">
              {phase.icon} Fase {phase.id} · Desafio {s.ch + 1}/{phase.challenges.length}
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold">{challenge.title}</h2>
            <p className="mt-2 text-muted-foreground">{challenge.scenario}</p>
            <div className="mt-6 grid gap-3">
              {challenge.options.map((o, i) => {
                const st = s.picked === null ? "" : i === s.picked ? `opt-${o.quality}` : o.quality === "otima" ? "opt-reveal" : "opt-dim";
                return (
                  <button key={i} className={`option ${st}`} disabled={s.picked !== null} onClick={() => pick(i)}>
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{o.text}</span>
                  </button>
                );
              })}
            </div>
            {s.picked !== null && (() => {
              const o = challenge.options[s.picked];
              const label = o.quality === "otima" ? "✅ Decisão excelente" : o.quality === "parcial" ? "⚠️ Decisão parcial" : "❌ Decisão inadequada";
              return (
                <div className={`feedback fb-${o.quality} fade-in mt-6`}>
                  <p className="font-display font-bold">{label}</p>
                  <p className="mt-2">{o.feedback}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Delta label="Pontos" v={o.points} />
                    <Delta label="Segurança" v={o.safety} />
                    <Delta label="Orçamento" v={o.budget} />
                  </div>
                  <button className="btn-hero mt-5" onClick={next}>Continuar →</button>
                </div>
              );
            })()}
          </div>
        )}

        {s.screen === "end" && <End s={s} onRestart={restart} onMenu={() => { localStorage.removeItem(KEY); setHasSave(false); setS(INITIAL); }} />}
      </div>
    </div>
  );
}

function HUD({ s, done, onMenu, onRestart }: { s: State; done: number; onMenu: () => void; onRestart: () => void }) {
  return (
    <div className="card-glass p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-lg font-bold glow-text">⭐ {s.score} pts</span>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm" onClick={onMenu}>Menu</button>
          <button className="btn-ghost btn-sm" onClick={onRestart}>Reiniciar</button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Bar label="🛡️ Segurança" v={s.safety} kind="safety" />
        <Bar label="💰 Orçamento" v={s.budget} kind="budget" />
        <Bar label="🚀 Progresso" v={Math.round((done / TOTAL) * 100)} kind="progress" />
      </div>
    </div>
  );
}

function Bar({ label, v, kind }: { label: string; v: number; kind: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{v}%</span></div>
      <div className="bar-track mt-1"><div className={`bar-fill bar-${kind}`} style={{ width: `${v}%` }} /></div>
    </div>
  );
}

function Delta({ label, v }: { label: string; v: number }) {
  if (v === 0) return <span className="chip">{label} 0</span>;
  return <span className={`chip ${v > 0 ? "chip-up" : "chip-down"}`}>{label} {v > 0 ? "+" : ""}{v}</span>;
}

function Panel({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="card-glass fade-in mx-auto mt-10 max-w-2xl p-6 sm:p-10">
      <h2 className="font-display glow-text text-2xl font-bold sm:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
      <button className="btn-hero mt-8" onClick={onBack}>← Voltar ao menu</button>
    </div>
  );
}

export function rank(score: number, safety: number, budget: number) {
  const max = TOTAL * 100;
  const pct = (score / max) * 60 + safety * 0.3 + budget * 0.1;
  if (pct >= 85) return { t: "Nanocientista Lendário", e: "🏆", d: "Decisões éticas, seguras e baseadas em evidências. Missão cumprida com excelência!" };
  if (pct >= 65) return { t: "Pesquisador(a) Responsável", e: "🥈", d: "Boa atuação! Algumas decisões podem ser aprimoradas." };
  if (pct >= 40) return { t: "Estagiário(a) em Formação", e: "🥉", d: "Você aprendeu bastante, mas a segurança e a ética precisam de mais atenção." };
  return { t: "Missão Comprometida", e: "⚠️", d: "Muitas decisões arriscadas. Revise as explicações e tente de novo!" };
}

function End({ s, onRestart, onMenu }: { s: State; onRestart: () => void; onMenu: () => void }) {
  const r = rank(s.score, s.safety, s.budget);
  const good = s.decisions.filter((d) => d.quality === "otima").length;
  return (
    <div className="fade-in space-y-6">
      <div className="card-glass p-6 text-center sm:p-10">
        <div className="text-6xl">{r.e}</div>
        <p className="font-display mt-3 text-sm uppercase tracking-widest text-accent">Missão concluída</p>
        <h2 className="font-display glow-text mt-1 text-3xl font-black sm:text-4xl">{r.t}</h2>
        <p className="mt-3 text-muted-foreground">{r.d}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat k="Pontuação" v={`${s.score}`} />
          <Stat k="Segurança" v={`${s.safety}%`} />
          <Stat k="Orçamento" v={`${s.budget}%`} />
          <Stat k="Acertos" v={`${good}/${TOTAL}`} />
        </div>
      </div>
      <div className="card-glass p-6">
        <h3 className="font-display text-xl font-bold">Suas decisões</h3>
        <ul className="mt-4 space-y-2">
          {s.decisions.map((d, i) => (
            <li key={i} className={`decision fb-${d.quality}`}>
              <span className="text-xs text-muted-foreground">{d.phase} · {d.challenge}</span>
              <span className="block">{d.quality === "otima" ? "✅" : d.quality === "parcial" ? "⚠️" : "❌"} {d.choice}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-glass p-6">
        <h3 className="font-display text-xl font-bold">O que você aprendeu</h3>
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
      <div className="flex flex-wrap justify-center gap-3">
        <button className="btn-hero" onClick={onRestart}>Jogar novamente</button>
        <button className="btn-ghost" onClick={onMenu}>Voltar ao menu</button>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-xs uppercase text-muted-foreground">{k}</p>
      <p className="font-display mt-1 text-2xl font-bold text-primary">{v}</p>
    </div>
  );
}

function Particles() {
  const items = Array.from({ length: 22 });
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {items.map((_, i) => (
        <span
          key={i}
          className={i % 3 === 0 ? "cell" : "particle"}
          style={{ left: `${(i * 47) % 100}%`, top: `${(i * 31) % 100}%`, animationDelay: `${(i % 7) * 1.3}s`, animationDuration: `${10 + (i % 5) * 3}s` }}
        />
      ))}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

type Tool = "gaze" | "scanner" | "bisturi" | "nano" | "sutura";
type Stage = "prep" | "scan" | "cut" | "deliver" | "suture" | "verify" | "done";

const TOOLS: { id: Tool; name: string; icon: string }[] = [
  { id: "gaze", name: "Gaze antisséptica", icon: "🧽" },
  { id: "scanner", name: "Nanoscanner", icon: "📡" },
  { id: "bisturi", name: "Bisturi", icon: "🔪" },
  { id: "nano", name: "Injetor de nanopartículas", icon: "💉" },
  { id: "sutura", name: "Porta-agulha (sutura)", icon: "🪡" },
];

const STAGE_INFO: Record<Stage, { tool: Tool | null; title: string; hint: string; learn: string }> = {
  prep: { tool: "gaze", title: "1/4 · Preparação", hint: "Use a gaze antisséptica e esfregue as 3 áreas marcadas.", learn: "Antissepsia reduz o risco de infecção — etapa básica de qualquer cirurgia." },
  scan: { tool: "scanner", title: "2/4 · Identificação do alvo", hint: "Passe o nanoscanner sobre o campo. Quando o sinal ficar verde, clique.", learn: "Nanopartículas de contraste (experimentais) podem ajudar a destacar tecidos alterados, mas exames e o olhar clínico continuam essenciais." },
  cut: { tool: "bisturi", title: "3/4 · Intervenção: acesso", hint: "Com o bisturi, segure e arraste ao longo da linha tracejada, da esquerda para a direita.", learn: "Precisão evita lesões a tecidos saudáveis. A cirurgia tradicional segue como base da intervenção." },
  deliver: { tool: "nano", title: "3/4 · Intervenção: nanoassistência", hint: "Com o injetor, clique exatamente sobre a região-alvo.", learn: "A liberação direcionada tenta concentrar o medicamento no alvo; fora dele, pode causar efeitos indesejados." },
  suture: { tool: "sutura", title: "4/4 · Verificação: sutura", hint: "Com o porta-agulha, clique nos 4 pontos de sutura.", learn: "Fechar bem a incisão ajuda na cicatrização e reduz complicações." },
  verify: { tool: null, title: "4/4 · Verificação final", hint: "Monitorando sinais vitais…", learn: "Após a intervenção, o paciente é monitorado. Resultados de técnicas experimentais precisam de acompanhamento e evidências." },
  done: { tool: null, title: "Cirurgia concluída", hint: "", learn: "" },
};

const TARGETS = [
  { x: 470, y: 330 },
  { x: 530, y: 345 },
  { x: 500, y: 315 },
];
const PREP = [
  { x: 420, y: 300 },
  { x: 580, y: 300 },
  { x: 500, y: 380 },
];

export function Surgery({
  paused,
  onComplete,
  onFail,
}: {
  paused: boolean;
  onComplete: () => void;
  onFail: (reason: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [target] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)]!);
  const [tool, setTool] = useState<Tool | null>(null);
  const [stage, setStage] = useState<Stage>("prep");
  const [stability, setStability] = useState(100);
  const [precision, setPrecision] = useState(100);
  const [time, setTime] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [prep, setPrep] = useState([0, 0, 0]);
  const [cutX, setCutX] = useState<number | null>(null);
  const [sutures, setSutures] = useState([false, false, false, false]);
  const [msg, setMsg] = useState<{ t: string; bad?: boolean } | null>(null);
  const [delivered, setDelivered] = useState(false);
  const down = useRef(false);
  const lastPenalty = useRef(0);
  const failed = useRef(false);

  const cutStart = target.x - 90;
  const cutEnd = target.x + 90;
  const suturePts = [0, 1, 2, 3].map((i) => ({ x: cutStart + 30 + i * 40, y: target.y }));

  // relógio e sinais
  useEffect(() => {
    if (paused || stage === "done") return;
    const id = setInterval(() => {
      setTime((t) => t + 0.1);
      setStability((s) => (time > 120 ? s - 0.1 : s));
    }, 100);
    return () => clearInterval(id);
  }, [paused, stage, time]);

  useEffect(() => {
    if (stability <= 0 && !failed.current) {
      failed.current = true;
      onFail("A estabilidade do paciente chegou a zero. Erros e demora comprometem a segurança — revise cada etapa com calma.");
    }
  }, [stability, onFail]);

  // verificação final automática
  useEffect(() => {
    if (stage !== "verify" || paused) return;
    const id = setTimeout(() => {
      setStability((s) => Math.min(100, s + 8));
      setStage("done");
    }, 2500);
    return () => clearTimeout(id);
  }, [stage, paused]);

  const flash = (t: string, bad = false) => setMsg({ t, bad });
  const penalize = (st: number, pr: number, t: string) => {
    const now = performance.now();
    if (now - lastPenalty.current < 400) return;
    lastPenalty.current = now;
    setStability((s) => Math.max(0, s - st));
    setPrecision((p) => Math.max(0, p - pr));
    flash(t, true);
  };

  const pt = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    // viewBox 1000x600 com preserveAspectRatio meet
    const scale = Math.min(r.width / 1000, r.height / 600);
    const ox = (r.width - 1000 * scale) / 2;
    const oy = (r.height - 600 * scale) / 2;
    return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale };
  };
  const inField = (p: { x: number; y: number }) => p.x > 330 && p.x < 670 && p.y > 240 && p.y < 430;
  const need = STAGE_INFO[stage].tool;

  const handle = (p: { x: number; y: number }, click: boolean) => {
    if (paused || !tool || !inField(p)) return;
    if (need && tool !== need) {
      if (click) penalize(6, 5, `Instrumento errado! Esta etapa pede: ${TOOLS.find((t) => t.id === need)!.name}.`);
      return;
    }
    if (stage === "prep" && down.current) {
      setPrep((arr) => {
        const n = arr.map((v, i) => (Math.hypot(p.x - PREP[i]!.x, p.y - PREP[i]!.y) < 45 ? Math.min(100, v + 6) : v));
        if (n.every((v) => v >= 100)) {
          setStage("scan");
          flash("Campo preparado e estéril. ✓");
        }
        return n;
      });
    }
    if (stage === "scan" && click) {
      if (Math.hypot(p.x - target.x, p.y - target.y) < 28) {
        setStage("cut");
        flash("Região-alvo identificada! ✓");
      } else penalize(3, 6, "Nada aqui. Observe o sinal do scanner antes de marcar.");
    }
    if (stage === "cut" && down.current) {
      const off = Math.abs(p.y - target.y);
      if (cutX === null) {
        if (Math.abs(p.x - cutStart) < 25 && off < 20) setCutX(cutStart);
        else if (click) flash("Comece pelo início da linha (esquerda).", true);
        return;
      }
      if (off > 14) {
        penalize(5, 8, "Corte fora da linha! Tecido saudável atingido.");
        return;
      }
      if (p.x > cutX && p.x - cutX < 60) {
        const nx = Math.min(cutEnd, p.x);
        setCutX(nx);
        if (nx >= cutEnd) {
          setStage("deliver");
          flash("Acesso aberto com precisão. ✓");
        }
      }
    }
    if (stage === "deliver" && click) {
      if (Math.hypot(p.x - target.x, p.y - target.y) < 22) {
        setDelivered(true);
        setStage("suture");
        flash("Nanopartículas liberadas no alvo. ✓");
      } else penalize(8, 10, "Liberação fora do alvo: risco de efeitos em tecido saudável.");
    }
    if (stage === "suture" && click) {
      const i = suturePts.findIndex((s, j) => !sutures[j] && Math.hypot(p.x - s.x, p.y - s.y) < 16);
      if (i < 0) {
        penalize(2, 4, "Ponto de sutura fora do lugar.");
        return;
      }
      const n = sutures.map((v, j) => v || j === i);
      setSutures(n);
      if (n.every(Boolean)) {
        setStage("verify");
        flash("Incisão fechada. Verificando sinais vitais…");
      }
    }
  };

  const signal = cursor && tool === "scanner" ? Math.max(0, 1 - Math.hypot(cursor.x - target.x, cursor.y - target.y) / 160) : 0;
  const hr = Math.round(72 + (100 - stability) * 0.6);
  const spo2 = Math.round(99 - (100 - stability) * 0.08);
  const progress = { prep: 0, scan: 20, cut: 40, deliver: 60, suture: 75, verify: 90, done: 100 }[stage];
  const score = Math.round(stability * 0.45 + precision * 0.45 + Math.max(0, 10 - Math.max(0, time - 60) / 10));
  const grade = score >= 85 ? "Excelente" : score >= 65 ? "Bom" : "Aceitável";
  const toolIcon = tool ? TOOLS.find((t) => t.id === tool)!.icon : null;
  const ecg = Array.from({ length: 40 }, (_, i) => {
    const ph = (i + time * 12) % 13;
    const y = ph < 1 ? -14 : ph < 2 ? 10 : ph < 3 ? -3 : 0;
    return `${i * 4},${y}`;
  }).join(" ");

  return (
    <div className="surgery-root">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none"
        style={{ cursor: tool ? "none" : "default" }}
        onPointerDown={(e) => {
          down.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          const p = pt(e);
          setCursor(p);
          handle(p, true);
        }}
        onPointerMove={(e) => {
          const p = pt(e);
          setCursor(p);
          if (down.current) handle(p, false);
        }}
        onPointerUp={() => (down.current = false)}
        onPointerCancel={() => (down.current = false)}
      >
        <defs>
          <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbe8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fffbe8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#173c45" />
            <stop offset="100%" stopColor="#0d262c" />
          </linearGradient>
          <radialGradient id="tissue" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f1a6a0" />
            <stop offset="100%" stopColor="#c86a6a" />
          </radialGradient>
        </defs>

        {/* sala */}
        <rect width="1000" height="600" fill="url(#wall)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={i * 100} y="470" width="98" height="130" fill="#0a1d22" stroke="#123139" />
        ))}
        {/* luminária */}
        <line x1="500" y1="0" x2="500" y2="40" stroke="#8aa" strokeWidth="6" />
        <ellipse cx="500" cy="52" rx="110" ry="22" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="3" />
        {[-60, -20, 20, 60].map((d) => (
          <circle key={d} cx={500 + d} cy="55" r="10" fill="#fffde7" />
        ))}
        <polygon points="400,60 600,60 720,470 280,470" fill="url(#lamp)" opacity="0.5" />

        {/* monitor de sinais vitais */}
        <g transform="translate(40,60)">
          <rect width="220" height="160" rx="10" fill="#050c0e" stroke="#4b6b70" strokeWidth="4" />
          <text x="12" y="24" fill="#4ade80" fontSize="14" fontFamily="Orbitron, monospace">FC {hr} bpm</text>
          <polyline transform="translate(10,60)" points={ecg} fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="12" y="100" fill="#22d3ee" fontSize="14" fontFamily="Orbitron, monospace">SpO₂ {spo2}%</text>
          <text x="12" y="122" fill={stability < 40 ? "#f87171" : "#facc15"} fontSize="13" fontFamily="Orbitron, monospace">ESTAB. {Math.round(stability)}%</text>
          <text x="12" y="144" fill="#e2e8f0" fontSize="12" fontFamily="Orbitron, monospace">PA 12x8 · T {time.toFixed(0)}s</text>
          <rect x="0" y="160" width="20" height="60" fill="#4b6b70" transform="translate(100,0)" />
        </g>

        {/* mesa e paciente */}
        <rect x="200" y="440" width="600" height="24" rx="6" fill="#90a4ae" />
        <rect x="480" y="464" width="40" height="100" fill="#607d8b" />
        <ellipse cx="200" cy="380" rx="70" ry="55" fill="#e0b394" />
        <path d="M150 360 Q200 300 260 350" fill="#5d4037" />
        <rect x="160" y="400" width="100" height="40" rx="10" fill="#4fc3f7" opacity="0.6" />
        <rect x="250" y="230" width="560" height="215" rx="40" fill="#1e8f7a" />
        {/* campo cirúrgico */}
        <rect x="330" y="240" width="340" height="190" rx="18" fill="#156e5e" />
        <rect x="350" y="255" width="300" height="160" rx="70" fill="url(#tissue)" stroke="#a24f52" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${370 + i * 60} 270 q20 ${50 + i * 6} 0 130`} stroke="#d98585" strokeWidth="2" fill="none" opacity="0.6" />
        ))}
        <path d="M360 290 C430 270, 520 320, 640 285" stroke="#7e57c2" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M360 390 C450 360, 560 400, 640 370" stroke="#c62828" strokeWidth="3" fill="none" opacity="0.5" />

        {/* preparação */}
        {stage === "prep" &&
          PREP.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r="40" fill="#ffeb3b" opacity={0.18 + (prep[i]! / 100) * 0.3} />
              <circle cx={s.x} cy={s.y} r="40" fill="none" stroke={prep[i]! >= 100 ? "#4ade80" : "#fff"} strokeDasharray="6 5" strokeWidth="2" />
              <text x={s.x} y={s.y + 5} textAnchor="middle" fill="#fff" fontSize="13">{Math.round(prep[i]!)}%</text>
            </g>
          ))}

        {/* alvo (visível após identificação) */}
        {stage !== "prep" && stage !== "scan" && (
          <circle cx={target.x} cy={target.y} r="18" fill={delivered ? "#4ade80" : "#6d214f"} opacity="0.8" stroke="#fff" strokeWidth="1.5" />
        )}
        {stage === "scan" && signal > 0 && (
          <circle cx={cursor!.x} cy={cursor!.y} r={60 - signal * 35} fill="none" stroke={signal > 0.8 ? "#4ade80" : signal > 0.5 ? "#facc15" : "#f87171"} strokeWidth="3" />
        )}

        {/* incisão */}
        {(stage === "cut" || stage === "deliver" || stage === "suture" || stage === "verify" || stage === "done") && (
          <>
            {stage === "cut" && (
              <>
                <line x1={cutStart} y1={target.y} x2={cutEnd} y2={target.y} stroke="#fff" strokeWidth="2" strokeDasharray="8 6" />
                <circle cx={cutStart} cy={target.y} r="8" fill="#22d3ee" />
              </>
            )}
            {cutX !== null && <line x1={cutStart} y1={target.y} x2={cutX} y2={target.y} stroke="#7f1d1d" strokeWidth="5" strokeLinecap="round" />}
          </>
        )}
        {delivered &&
          Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={target.x + Math.cos(i + time * 3) * (10 + (i % 4) * 5)} cy={target.y + Math.sin(i * 1.7 + time * 3) * 10} r="2.5" fill="#22d3ee" />
          ))}
        {(stage === "suture" || stage === "verify" || stage === "done") &&
          suturePts.map((s, i) =>
            sutures[i] ? (
              <path key={i} d={`M${s.x - 6} ${s.y - 9} L${s.x + 6} ${s.y + 9} M${s.x + 6} ${s.y - 9} L${s.x - 6} ${s.y + 9}`} stroke="#1e3a8a" strokeWidth="3" />
            ) : (
              <circle key={i} cx={s.x} cy={s.y} r="8" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
            ),
          )}

        {/* bandeja de instrumentos */}
        <g transform="translate(760,60)">
          <rect width="210" height="330" rx="12" fill="#b0bec5" stroke="#78909c" strokeWidth="4" />
          <text x="105" y="26" textAnchor="middle" fontSize="13" fill="#263238" fontFamily="Orbitron, monospace">INSTRUMENTOS</text>
          {TOOLS.map((t, i) => (
            <g
              key={t.id}
              transform={`translate(12,${40 + i * 56})`}
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (!paused) {
                  setTool(t.id);
                  flash(`${t.icon} ${t.name} selecionado.`);
                }
              }}
            >
              <rect width="186" height="48" rx="8" fill={tool === t.id ? "#22d3ee" : "#eceff1"} stroke={need === t.id ? "#16a34a" : "#90a4ae"} strokeWidth={need === t.id ? 3 : 1.5} />
              <text x="14" y="32" fontSize="24">{t.icon}</text>
              <text x="50" y="30" fontSize="12" fill="#263238">{t.name.length > 20 ? t.name.slice(0, 19) + "…" : t.name}</text>
            </g>
          ))}
        </g>

        {/* cursor do instrumento */}
        {cursor && toolIcon && (
          <text x={cursor.x - 4} y={cursor.y + 4} fontSize="30" pointerEvents="none">{toolIcon}</text>
        )}
      </svg>

      {/* painel da etapa (estilo monitor de parede) */}
      <div className="surgery-panel">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-xs font-bold text-accent sm:text-sm">{STAGE_INFO[stage].title}</p>
          <span className="text-xs text-muted-foreground">🎯 {Math.round(precision)}% · ⏱ {time.toFixed(0)}s</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        {stage !== "done" && <p className="mt-1 text-xs sm:text-sm">{STAGE_INFO[stage].hint}</p>}
        {stage !== "done" && <p className="mt-1 hidden text-xs text-muted-foreground sm:block">🧬 {STAGE_INFO[stage].learn}</p>}
        {msg && stage !== "done" && <p className={`mt-1 text-xs font-bold ${msg.bad ? "text-destructive" : "text-primary"}`}>{msg.t}</p>}
      </div>

      {stage === "done" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 p-4">
          <div className="card-glass fade-in max-w-md p-6 text-center">
            <div className="text-5xl">🩺</div>
            <h3 className="font-display mt-2 text-2xl font-bold">Cirurgia concluída</h3>
            <p className="mt-2 text-sm text-muted-foreground">Estabilidade {Math.round(stability)}% · Precisão {Math.round(precision)}% · Tempo {time.toFixed(0)}s</p>
            <p className="font-display mt-2 text-lg text-accent">Desempenho: {grade} ({score} pts)</p>
            <p className="mt-3 text-xs text-muted-foreground">A nanotecnologia foi usada aqui como recurso experimental de apoio. A cirurgia tradicional, a equipe médica e as evidências científicas seguem no centro do tratamento. Simulação fictícia e educativa.</p>
            <button className="btn-hero mt-5" onClick={onComplete}>Concluir missão</button>
          </div>
        </div>
      )}
    </div>
  );
}

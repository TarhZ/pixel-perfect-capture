export type Log = { title: string; text: string };
export type Platform = { x: number; y: number; w: number; h: number };
export type Hazard = { x: number; y: number; r: number; axis: "x" | "y"; range: number; speed: number };
export type Collectible = { x: number; y: number; label: string; log: Log };
export type Interactable = { x: number; y: number; label: string; log: Log };
export type Level = {
  id: number;
  name: string;
  icon: string;
  intro: string;
  objective: string;
  width: number;
  height: number;
  start: { x: number; y: number };
  platforms: Platform[];
  hazards: Hazard[];
  collectibles: Collectible[];
  interactables: Interactable[];
  goal: { x: number; y: number; label: string };
  energyDrain: number; // por segundo
};

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Exploração da Corrente Sanguínea",
    icon: "🩸",
    intro:
      "Você é um nanorrobô médico recém-injetado na corrente sanguínea. Atravesse o vaso, desvie dos leucócitos patrulheiros e colete 3 amostras da região suspeita.",
    objective: "Colete 3 amostras e alcance a zona de análise",
    width: 3600,
    height: 720,
    start: { x: 80, y: 500 },
    energyDrain: 0.35,
    platforms: [
      { x: 0, y: 640, w: 700, h: 80 },
      { x: 780, y: 640, w: 500, h: 80 },
      { x: 1360, y: 640, w: 700, h: 80 },
      { x: 2140, y: 640, w: 600, h: 80 },
      { x: 2820, y: 640, w: 780, h: 80 },
      { x: 420, y: 480, w: 180, h: 24 },
      { x: 900, y: 460, w: 160, h: 24 },
      { x: 1180, y: 360, w: 160, h: 24 },
      { x: 1500, y: 470, w: 180, h: 24 },
      { x: 1800, y: 380, w: 160, h: 24 },
      { x: 2200, y: 470, w: 170, h: 24 },
      { x: 2500, y: 380, w: 160, h: 24 },
      { x: 2900, y: 460, w: 180, h: 24 },
      { x: 0, y: 0, w: 3600, h: 40 },
    ],
    hazards: [
      { x: 850, y: 560, r: 26, axis: "x", range: 140, speed: 1.4 },
      { x: 1600, y: 560, r: 26, axis: "x", range: 180, speed: 1.8 },
      { x: 2400, y: 300, r: 24, axis: "y", range: 160, speed: 1.5 },
      { x: 3050, y: 560, r: 28, axis: "x", range: 200, speed: 2.0 },
    ],
    collectibles: [
      {
        x: 510, y: 430, label: "Amostra 1",
        log: {
          title: "🧪 Amostra coletada: hemácias",
          text: "As hemácias transportam oxigênio. Nanopartículas conseguem viajar pela corrente sanguínea junto delas — é assim que pesquisadores imaginam a entrega direcionada de medicamentos.",
        },
      },
      {
        x: 1260, y: 310, label: "Amostra 2",
        log: {
          title: "🧪 Amostra coletada: célula alterada",
          text: "Células com comportamento anômalo podem indicar doença. Nanossensores em pesquisa conseguem detectar marcadores moleculares muito antes dos sintomas aparecerem.",
        },
      },
      {
        x: 2580, y: 330, label: "Amostra 3",
        log: {
          title: "🧪 Amostra coletada: tecido suspeito",
          text: "Com amostras suficientes, a equipe médica pode decidir o tratamento com evidências — na ciência real, nenhuma decisão é tomada sem dados.",
        },
      },
    ],
    interactables: [
      {
        x: 1880, y: 340, label: "Terminal de dados",
        log: {
          title: "🖥️ Terminal de dados",
          text: "Dados de saúde são sensíveis: na pesquisa real, exigem consentimento do paciente e proteção de privacidade (no Brasil, a LGPD).",
        },
      },
    ],
    goal: { x: 3400, y: 540, label: "Zona de Análise" },
  },
  {
    id: 2,
    name: "Entrega Direcionada",
    icon: "💊",
    intro:
      "Sua carga: nanopartículas com medicamento. Atravesse o labirinto capilar e entregue-as na célula-alvo. Cada segundo gasta energia — não desperdice!",
    objective: "Leve a carga até a célula-alvo antes que a energia acabe",
    width: 3400,
    height: 900,
    start: { x: 80, y: 700 },
    energyDrain: 1.1,
    platforms: [
      { x: 0, y: 820, w: 600, h: 80 },
      { x: 700, y: 820, w: 500, h: 80 },
      { x: 1300, y: 820, w: 600, h: 80 },
      { x: 2000, y: 820, w: 500, h: 80 },
      { x: 2600, y: 820, w: 800, h: 80 },
      { x: 350, y: 660, w: 150, h: 24 },
      { x: 650, y: 540, w: 150, h: 24 },
      { x: 950, y: 660, w: 150, h: 24 },
      { x: 1250, y: 540, w: 150, h: 24 },
      { x: 1550, y: 660, w: 150, h: 24 },
      { x: 1850, y: 540, w: 150, h: 24 },
      { x: 2150, y: 660, w: 150, h: 24 },
      { x: 2450, y: 540, w: 150, h: 24 },
      { x: 2750, y: 660, w: 150, h: 24 },
      { x: 400, y: 300, w: 400, h: 24 },
      { x: 1000, y: 300, w: 400, h: 24 },
      { x: 1600, y: 300, w: 400, h: 24 },
      { x: 2200, y: 300, w: 400, h: 24 },
      { x: 0, y: 0, w: 3400, h: 40 },
    ],
    hazards: [
      { x: 600, y: 470, r: 24, axis: "y", range: 130, speed: 1.8 },
      { x: 1200, y: 470, r: 24, axis: "y", range: 130, speed: 2.2 },
      { x: 1800, y: 470, r: 24, axis: "y", range: 130, speed: 1.6 },
      { x: 2400, y: 470, r: 24, axis: "y", range: 130, speed: 2.4 },
      { x: 1200, y: 200, r: 22, axis: "x", range: 150, speed: 1.7 },
    ],
    collectibles: [
      {
        x: 600, y: 250, label: "Célula de energia",
        log: {
          title: "🔋 Célula de energia (+30 energia)",
          text: "Nanorrobôs hipotéticos precisariam de fontes de energia microscópicas — um dos grandes desafios reais da nanomedicina.",
        },
      },
      {
        x: 1800, y: 250, label: "Célula de energia",
        log: {
          title: "🔋 Célula de energia (+30 energia)",
          text: "Eficiência importa: quanto menor a dose perdida no caminho, menor o custo e os efeitos colaterais do tratamento.",
        },
      },
    ],
    interactables: [
      {
        x: 1050, y: 610, label: "Placa de orientação",
        log: {
          title: "🧭 Entrega direcionada",
          text: "Lipossomas e nanopartículas poliméricas já são usados de verdade para levar remédios direto ao alvo — as vacinas de RNA usam nanopartículas lipídicas!",
        },
      },
    ],
    goal: { x: 3150, y: 720, label: "Célula-Alvo" },
  },
  {
    id: 3,
    name: "Laboratório de Segurança",
    icon: "🔬",
    intro:
      "Antes de liberar o tratamento, explore a área de testes. Colete 3 registros de dados e inspecione 2 pontos de risco com a tecla E. A segurança vem primeiro.",
    objective: "Colete 3 dados e inspecione 2 pontos de risco (tecla E)",
    width: 3800,
    height: 720,
    start: { x: 80, y: 500 },
    energyDrain: 0.4,
    platforms: [
      { x: 0, y: 640, w: 800, h: 80 },
      { x: 900, y: 640, w: 600, h: 80 },
      { x: 1600, y: 640, w: 700, h: 80 },
      { x: 2400, y: 640, w: 600, h: 80 },
      { x: 3100, y: 640, w: 700, h: 80 },
      { x: 500, y: 480, w: 160, h: 24 },
      { x: 1000, y: 420, w: 160, h: 24 },
      { x: 1450, y: 500, w: 160, h: 24 },
      { x: 1900, y: 420, w: 160, h: 24 },
      { x: 2350, y: 500, w: 160, h: 24 },
      { x: 2800, y: 420, w: 160, h: 24 },
      { x: 3250, y: 500, w: 160, h: 24 },
      { x: 0, y: 0, w: 3800, h: 40 },
    ],
    hazards: [
      { x: 1100, y: 560, r: 26, axis: "x", range: 160, speed: 1.9 },
      { x: 2100, y: 560, r: 26, axis: "x", range: 200, speed: 1.5 },
      { x: 2900, y: 350, r: 24, axis: "y", range: 180, speed: 1.7 },
    ],
    collectibles: [
      {
        x: 580, y: 430, label: "Dados de toxicidade",
        log: {
          title: "📊 Dados de toxicidade",
          text: "Todo novo material passa por testes de toxicidade: nanopartículas podem se acumular em órgãos como fígado e baço, e isso precisa ser medido.",
        },
      },
      {
        x: 1530, y: 450, label: "Dados de dose",
        log: {
          title: "📊 Dados de dose segura",
          text: "A dose faz o veneno: os testes definem a faixa em que o tratamento ajuda sem causar dano. Por isso ensaios clínicos têm fases rigorosas.",
        },
      },
      {
        x: 2880, y: 370, label: "Dados de longo prazo",
        log: {
          title: "📊 Dados de longo prazo",
          text: "Efeitos podem demorar anos para aparecer. Acompanhar voluntários por muito tempo é parte essencial da ciência responsável.",
        },
      },
    ],
    interactables: [
      {
        x: 1080, y: 370, label: "Ponto de risco",
        log: {
          title: "⚠️ Risco identificado: reação imune",
          text: "O sistema imunológico pode atacar nanopartículas como invasoras, causando inflamação. Pesquisadores desenvolvem revestimentos 'invisíveis' para reduzir esse risco.",
        },
      },
      {
        x: 2430, y: 450, label: "Ponto de risco",
        log: {
          title: "⚠️ Risco identificado: efeito fora do alvo",
          text: "Se as partículas atingirem células saudáveis, há efeitos adversos. Testes de segurança existem justamente para detectar isso antes do uso em pessoas.",
        },
      },
    ],
    goal: { x: 3600, y: 540, label: "Liberar Tratamento" },
  },
  {
    id: 4,
    name: "Acesso ao Tratamento",
    icon: "⚖️",
    intro:
      "O tratamento funciona, mas os recursos são limitados. Reúna 4 unidades de recurso e atravesse o último trecho para tornar o acesso justo uma realidade.",
    objective: "Reúna 4 recursos e alcance o centro de distribuição",
    width: 4000,
    height: 720,
    start: { x: 80, y: 500 },
    energyDrain: 0.5,
    platforms: [
      { x: 0, y: 640, w: 600, h: 80 },
      { x: 700, y: 640, w: 500, h: 80 },
      { x: 1300, y: 640, w: 500, h: 80 },
      { x: 1900, y: 640, w: 500, h: 80 },
      { x: 2500, y: 640, w: 500, h: 80 },
      { x: 3100, y: 640, w: 900, h: 80 },
      { x: 350, y: 490, w: 140, h: 24 },
      { x: 750, y: 400, w: 140, h: 24 },
      { x: 1150, y: 490, w: 140, h: 24 },
      { x: 1550, y: 400, w: 140, h: 24 },
      { x: 1950, y: 490, w: 140, h: 24 },
      { x: 2350, y: 400, w: 140, h: 24 },
      { x: 2750, y: 490, w: 140, h: 24 },
      { x: 3150, y: 400, w: 140, h: 24 },
      { x: 0, y: 0, w: 4000, h: 40 },
    ],
    hazards: [
      { x: 950, y: 560, r: 26, axis: "x", range: 180, speed: 2.0 },
      { x: 1650, y: 560, r: 26, axis: "x", range: 180, speed: 2.3 },
      { x: 2250, y: 330, r: 24, axis: "y", range: 170, speed: 1.8 },
      { x: 2950, y: 560, r: 26, axis: "x", range: 180, speed: 2.5 },
      { x: 3400, y: 330, r: 24, axis: "y", range: 170, speed: 2.0 },
    ],
    collectibles: [
      {
        x: 420, y: 440, label: "Recurso",
        log: {
          title: "💰 Recurso reunido",
          text: "Terapias de ponta podem custar milhões por paciente. O custo de pesquisa e produção é um dos maiores desafios da nanomedicina.",
        },
      },
      {
        x: 1220, y: 440, label: "Recurso",
        log: {
          title: "💰 Recurso reunido",
          text: "Quem decide quem recebe um tratamento caro primeiro? Bioética é a área que discute escolhas justas quando os recursos não chegam para todos.",
        },
      },
      {
        x: 2020, y: 440, label: "Recurso",
        log: {
          title: "💰 Recurso reunido",
          text: "Sistemas públicos de saúde, como o SUS no Brasil, existem para que o acesso não dependa da renda de cada pessoa.",
        },
      },
      {
        x: 2820, y: 440, label: "Recurso",
        log: {
          title: "💰 Recurso reunido",
          text: "Ciência aberta, patentes equilibradas e produção local ajudam a reduzir custos e ampliar o acesso a novos tratamentos.",
        },
      },
    ],
    interactables: [
      {
        x: 1620, y: 350, label: "Painel de ética",
        log: {
          title: "⚖️ Decisão ética",
          text: "Uma tecnologia segura mas inacessível beneficia poucos. O desafio final da nanomedicina não é só técnico: é garantir que todos possam se beneficiar.",
        },
      },
    ],
    goal: { x: 3800, y: 540, label: "Centro de Distribuição" },
  },
];

export const LEARNINGS = [
  { t: "Entrega direcionada", d: "Nanopartículas podem levar medicamentos direto às células doentes, reduzindo efeitos colaterais." },
  { t: "Diagnóstico precoce", d: "Nanossensores em pesquisa podem detectar marcadores de doenças antes dos sintomas." },
  { t: "Segurança em fases", d: "Testes de toxicidade, dose e longo prazo protegem pacientes antes de qualquer liberação." },
  { t: "Riscos reais", d: "Reações imunes e efeitos fora do alvo são riscos que a pesquisa precisa controlar." },
  { t: "Privacidade", d: "Dados de saúde exigem consentimento e proteção legal (LGPD)." },
  { t: "Acesso justo", d: "O desafio final é ético e econômico: tornar tratamentos avançados acessíveis a todos." },
];

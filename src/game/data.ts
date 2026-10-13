export type Option = {
  text: string;
  points: number;
  safety: number;
  budget: number;
  quality: "otima" | "parcial" | "ruim";
  feedback: string;
};
export type Challenge = { title: string; scenario: string; options: Option[] };
export type Phase = { id: number; name: string; icon: string; intro: string; challenges: Challenge[] };

export const PHASES: Phase[] = [
  {
    id: 1,
    name: "Investigação",
    icon: "🔬",
    intro:
      "Paciente fictício: Lucas, 52 anos, com suspeita de um tumor em estágio inicial no fígado. Sua equipe precisa investigar como a nanotecnologia pode ajudar no diagnóstico.",
    challenges: [
      {
        title: "Primeiro passo da investigação",
        scenario: "Antes de propor qualquer nanotecnologia, o que a equipe deve fazer?",
        options: [
          { text: "Revisar a literatura científica e os exames já disponíveis de Lucas", points: 100, safety: 5, budget: -5, quality: "otima", feedback: "Correto! A pesquisa começa revisando estudos publicados e dados clínicos. Isso evita repetir erros e orienta qual tecnologia faz sentido." },
          { text: "Aplicar imediatamente nanopartículas experimentais no paciente", points: -50, safety: -20, budget: -15, quality: "ruim", feedback: "Arriscado! Tecnologias experimentais só podem ser usadas em humanos após testes e aprovação ética e regulatória." },
          { text: "Esperar sem fazer nada até surgirem novos sintomas", points: 0, safety: -10, budget: 0, quality: "ruim", feedback: "Esperar pode atrasar o diagnóstico. Investigar com métodos já validados é a conduta mais responsável." },
        ],
      },
      {
        title: "Escala nanométrica",
        scenario: "Um estagiário pergunta: o que significa trabalhar na 'nanoescala'?",
        options: [
          { text: "Estruturas entre cerca de 1 e 100 nanômetros (1 nm = bilionésimo do metro)", points: 100, safety: 0, budget: 0, quality: "otima", feedback: "Isso! Nessa escala, materiais podem ter propriedades diferentes (ópticas, químicas, magnéticas), úteis para medicina." },
          { text: "Estruturas do tamanho de uma célula inteira", points: 20, safety: 0, budget: 0, quality: "parcial", feedback: "Quase. Células humanas medem em geral de 10 a 100 micrômetros — cerca de mil vezes maiores que nanoestruturas." },
          { text: "Robôs metálicos visíveis ao microscópio comum", points: 0, safety: 0, budget: 0, quality: "ruim", feedback: "Não. 'Nanorrobôs' de ficção ainda são em grande parte conceitos; a maior parte da nanomedicina atual usa nanopartículas, lipossomas e nanossensores." },
        ],
      },
      {
        title: "Ferramenta de diagnóstico",
        scenario: "Qual abordagem nanotecnológica pode apoiar o diagnóstico por imagem?",
        options: [
          { text: "Nanopartículas como agentes de contraste em pesquisa, combinadas com exames convencionais", points: 100, safety: 5, budget: -10, quality: "otima", feedback: "Boa escolha! Nanopartículas (ex.: de óxido de ferro ou ouro) são estudadas como contrastes. Elas complementam, não substituem, exames validados." },
          { text: "Usar só um nanossensor experimental e dispensar a biópsia", points: 10, safety: -15, budget: -10, quality: "parcial", feedback: "Nanossensores são promissores, mas ainda precisam de validação. Dispensar exames confirmatórios pode gerar diagnósticos errados." },
          { text: "Comprar o equipamento mais caro do mercado, sem avaliar evidências", points: -20, safety: 0, budget: -30, quality: "ruim", feedback: "Custo alto não garante eficácia. Decisões devem se basear em evidências científicas." },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Tratamento",
    icon: "💊",
    intro: "O diagnóstico foi confirmado. Agora é hora de avaliar estratégias de tratamento, incluindo a liberação direcionada de medicamentos.",
    challenges: [
      {
        title: "Como funciona a liberação direcionada?",
        scenario: "Explique ao paciente a ideia da liberação direcionada de fármacos.",
        options: [
          { text: "Nanocarreadores transportam o remédio e tendem a se acumular mais na região-alvo, podendo reduzir efeitos em tecidos sadios", points: 100, safety: 5, budget: 0, quality: "otima", feedback: "Exato! Lipossomas e nanopartículas podem proteger o fármaco e direcioná-lo (por tamanho ou por moléculas na superfície). Mas o direcionamento nunca é 100% perfeito." },
          { text: "O remédio vai somente ao tumor, sem nenhum efeito colateral", points: 0, safety: -10, budget: 0, quality: "ruim", feedback: "Exagero! Parte das nanopartículas se acumula em órgãos como fígado e baço, e efeitos adversos ainda podem ocorrer." },
          { text: "Os nanorrobôs operam o tumor como um cirurgião", points: -10, safety: -5, budget: 0, quality: "ruim", feedback: "Isso ainda é ficção científica. Não devemos prometer o que a ciência não comprovou." },
        ],
      },
      {
        title: "Escolha da estratégia",
        scenario: "Qual plano de tratamento a equipe deve recomendar para Lucas?",
        options: [
          { text: "Decidir com a equipe médica, comparando opções convencionais e nanoformulações já aprovadas, conforme o caso", points: 100, safety: 10, budget: -15, quality: "otima", feedback: "Excelente! Existem nanoformulações aprovadas (ex.: doxorrubicina lipossomal), mas nem sempre são melhores. A escolha depende de evidências e do paciente." },
          { text: "Usar somente nanotecnologia porque é sempre superior", points: 10, safety: -10, budget: -25, quality: "parcial", feedback: "Nanotecnologia não é automaticamente melhor. Em muitos casos, cirurgia, quimioterapia ou radioterapia convencionais são as opções mais indicadas." },
          { text: "Recusar qualquer tratamento novo por desconfiança", points: 20, safety: 0, budget: 5, quality: "parcial", feedback: "Cautela é válida, mas recusar opções aprovadas sem análise pode privar o paciente de benefícios comprovados." },
        ],
      },
      {
        title: "Dose e acompanhamento",
        scenario: "Após iniciar o tratamento, o que é essencial?",
        options: [
          { text: "Monitorar exames regularmente e ajustar a conduta", points: 100, safety: 10, budget: -5, quality: "otima", feedback: "Isso mesmo. O acompanhamento permite detectar efeitos adversos e avaliar se o tratamento está funcionando." },
          { text: "Aumentar a dose para acelerar a cura", points: -40, safety: -25, budget: -5, quality: "ruim", feedback: "Perigoso! Doses acima das estudadas aumentam o risco de toxicidade." },
          { text: "Encerrar o acompanhamento para economizar", points: -10, safety: -15, budget: 10, quality: "ruim", feedback: "Economizar no acompanhamento compromete a segurança do paciente." },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Segurança",
    icon: "🛡️",
    intro: "Um laboratório quer lançar uma nova nanopartícula. Você faz parte do comitê que avalia testes, riscos e evidências.",
    challenges: [
      {
        title: "Etapas de testes",
        scenario: "Qual é a sequência adequada para testar uma nova nanoformulação?",
        options: [
          { text: "Testes em laboratório e pré-clínicos → ensaios clínicos fases 1, 2 e 3 → avaliação regulatória (ex.: Anvisa)", points: 100, safety: 15, budget: -15, quality: "otima", feedback: "Perfeito! Cada etapa avalia segurança e eficácia de forma progressiva antes da aprovação." },
          { text: "Pular para a fase 3, porque a tecnologia parece segura", points: -30, safety: -20, budget: 10, quality: "ruim", feedback: "Pular etapas expõe voluntários a riscos desconhecidos. As fases iniciais existem justamente para isso." },
          { text: "Testar apenas em células no laboratório e liberar a venda", points: -20, safety: -15, budget: 5, quality: "ruim", feedback: "Resultados em células nem sempre se repetem em organismos vivos. Ensaios clínicos são indispensáveis." },
        ],
      },
      {
        title: "Efeitos adversos",
        scenario: "Na fase 1, alguns voluntários apresentam reação inflamatória leve. O que fazer?",
        options: [
          { text: "Registrar, comunicar ao comitê de ética e investigar a causa antes de prosseguir", points: 100, safety: 15, budget: -10, quality: "otima", feedback: "Correto! Transparência e notificação de eventos adversos são obrigações éticas e legais." },
          { text: "Ocultar os dados para não atrasar o projeto", points: -80, safety: -30, budget: 5, quality: "ruim", feedback: "Grave violação ética! Ocultar dados coloca vidas em risco e compromete a confiança na ciência." },
          { text: "Cancelar toda a pesquisa imediatamente", points: 30, safety: 5, budget: -5, quality: "parcial", feedback: "Prudente, mas talvez precipitado. Reações leves devem ser investigadas; a decisão depende da análise dos dados." },
        ],
      },
      {
        title: "Evidências de eficácia",
        scenario: "Um influenciador diz que a nanopartícula 'cura todos os tipos de câncer'. Como responder?",
        options: [
          { text: "Explicar que eficácia exige estudos controlados e revisados por pares, e que não existe cura universal", points: 100, safety: 10, budget: 0, quality: "otima", feedback: "Isso! Afirmações extraordinárias exigem evidências robustas. Cada tipo de câncer responde de forma diferente." },
          { text: "Aproveitar a propaganda para atrair investidores", points: -40, safety: -10, budget: 15, quality: "ruim", feedback: "Divulgar promessas falsas é antiético e pode levar pacientes a abandonar tratamentos eficazes." },
          { text: "Ignorar o assunto", points: 10, safety: -5, budget: 0, quality: "parcial", feedback: "Cientistas têm papel importante no combate à desinformação. Comunicar com clareza protege o público." },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Bioética e acesso",
    icon: "⚖️",
    intro: "O tratamento foi aprovado. Agora surgem dilemas sobre dados, consentimento, custo e acesso justo.",
    challenges: [
      {
        title: "Privacidade dos dados",
        scenario: "Nanossensores coletam dados de saúde em tempo real. Uma empresa quer comprá-los para publicidade.",
        options: [
          { text: "Negar e proteger os dados conforme a LGPD, usando-os só com consentimento e finalidade clara", points: 100, safety: 10, budget: -5, quality: "otima", feedback: "Correto! Dados de saúde são sensíveis pela Lei Geral de Proteção de Dados e exigem proteção rigorosa." },
          { text: "Vender os dados anonimamente sem avisar os pacientes", points: -50, safety: -15, budget: 25, quality: "ruim", feedback: "Mesmo 'anonimizados', dados podem ser reidentificados. Usá-los sem consentimento viola direitos dos pacientes." },
          { text: "Perguntar aos pacientes se aceitam compartilhar, explicando os riscos", points: 50, safety: 5, budget: 5, quality: "parcial", feedback: "Melhor que vender escondido, mas o uso comercial para publicidade ainda levanta sérias questões éticas." },
        ],
      },
      {
        title: "Consentimento informado",
        scenario: "Como obter o consentimento de um paciente para o novo tratamento?",
        options: [
          { text: "Explicar benefícios, riscos, alternativas e garantir que ele pode recusar ou desistir", points: 100, safety: 10, budget: 0, quality: "otima", feedback: "Exato! O consentimento informado deve ser livre, esclarecido e pode ser retirado a qualquer momento." },
          { text: "Entregar um termo longo e técnico para assinar rapidamente", points: -10, safety: -5, budget: 0, quality: "ruim", feedback: "Assinatura sem compreensão não é consentimento real. A linguagem deve ser acessível." },
          { text: "Decidir pelo paciente, já que a equipe sabe mais", points: -40, safety: -10, budget: 0, quality: "ruim", feedback: "Isso fere a autonomia do paciente, um princípio central da bioética." },
        ],
      },
      {
        title: "Custo e acesso justo",
        scenario: "O tratamento é muito caro. Como ampliar o acesso?",
        options: [
          { text: "Avaliar a incorporação ao SUS com base em custo-efetividade, incentivar pesquisa nacional e produção local", points: 100, safety: 5, budget: -10, quality: "otima", feedback: "Ótimo! Avaliação de tecnologias em saúde e investimento público em pesquisa ajudam a tornar tratamentos mais acessíveis e justos." },
          { text: "Oferecer apenas para quem pode pagar", points: -30, safety: 0, budget: 20, quality: "ruim", feedback: "Isso aprofunda desigualdades. A justiça é um princípio da bioética: benefícios devem ser distribuídos de forma equitativa." },
          { text: "Distribuir para todos imediatamente, sem avaliar custo ou prioridade", points: 20, safety: -5, budget: -35, quality: "parcial", feedback: "Boa intenção, mas sem planejamento o sistema de saúde pode ficar sem recursos para outros tratamentos essenciais." },
        ],
      },
    ],
  },
];

export const LEARNINGS = [
  { t: "Benefícios", d: "Nanopartículas podem melhorar diagnósticos por imagem e direcionar fármacos, reduzindo parte dos efeitos em tecidos sadios." },
  { t: "Riscos", d: "Nanomateriais podem causar reações inflamatórias, toxicidade ou acúmulo em órgãos; o direcionamento nunca é perfeito." },
  { t: "Custos", d: "Tecnologias novas costumam ser caras; custo alto não significa maior eficácia." },
  { t: "Segurança", d: "Testes pré-clínicos, ensaios clínicos em fases e avaliação regulatória são essenciais antes do uso." },
  { t: "Bioética", d: "Consentimento informado, autonomia e proteção de dados de saúde (LGPD) são obrigatórios." },
  { t: "Acesso justo", d: "Políticas públicas e avaliação de custo-efetividade ajudam a distribuir benefícios com equidade." },
];

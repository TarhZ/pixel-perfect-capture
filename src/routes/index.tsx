import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NanoMissão: Operação Corpo Humano" },
      { name: "description", content: "Jogo 2D de exploração: pilote um nanorrobô médico pelo corpo humano e aprenda nanomedicina." },
      { property: "og:title", content: "NanoMissão: Operação Corpo Humano" },
      { property: "og:description", content: "Explore a corrente sanguínea, entregue medicamentos e aprenda nanotecnologia médica jogando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NanoMissão: Salvando o Corpo Humano" },
      { name: "description", content: "Jogo educativo sobre nanotecnologia médica, segurança e bioética." },
      { property: "og:title", content: "NanoMissão: Salvando o Corpo Humano" },
      { property: "og:description", content: "A ciência está em suas mãos. Jogue e aprenda nanomedicina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

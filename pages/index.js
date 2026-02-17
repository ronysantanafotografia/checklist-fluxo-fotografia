"use client";

import { useState } from "react";

type Trabalho = {
  id: number;
  nome: string;
  tipo: string;
  data: string;
  status: string;
  concluido: boolean;
};

export default function Home() {
  const [studioName] = useState("Rony Santana Fotografia");
  const [logo] = useState("/logo.png"); // coloque sua logo em /public/logo.png

  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([
    {
      id: 1,
      nome: "Carla & Gilvan",
      tipo: "Casamento",
      data: "15 jan 2026",
      status: "Edição",
      concluido: false,
    },
    {
      id: 2,
      nome: "Jamille e Daniel",
      tipo: "Ensaio",
      data: "03 fev 2026",
      status: "Seleção",
      concluido: false,
    },
    {
      id: 3,
      nome: "Laura",
      tipo: "Gestante",
      data: "22 mar 2026",
      status: "Entregue",
      concluido: true,
    },
  ]);

  const ativos = trabalhos.filter((t) => !t.concluido);
  const concluidos = trabalhos.filter((t) => t.concluido);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* TOPO */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">StudioFlow</h1>
          <p className="text-sm text-gray-400">
            Organize, edite e entregue sem perder prazos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
            className="w-9 h-9 object-contain opacity-90"
          />
          <span className="text-sm text-gray-700">{studioName}</span>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-10 py-10">
        {/* BOAS VINDAS */}
        <div className="mb-10">
          <h2 className="text-xl font-medium">Bom dia, Rony.</h2>
          <p className="text-gray-400 text-sm">Seu estúdio está sob controle.</p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-14">
          <Card titulo="Trabalhos ativos" valor={ativos.length} />
          <Card titulo="Em andamento" valor={ativos.length} />
          <Card titulo="Concluídos" valor={concluidos.length} />
          <Card titulo="Atrasados" valor={0} />
        </div>

        {/* TRABALHOS ATIVOS */}
        <Section title="Trabalhos ativos">
          {ativos.map((t) => (
            <TrabalhoItem key={t.id} trabalho={t} />
          ))}
          {ativos.length === 0 && (
            <p className="text-gray-400 text-sm">Nenhum trabalho ativo.</p>
          )}
        </Section>

        {/* CONCLUÍDOS */}
        <Section title="Concluídos">
          {concluidos.map((t) => (
            <TrabalhoItem key={t.id} trabalho={t} />
          ))}
          {concluidos.length === 0 && (
            <p className="text-gray-400 text-sm">Nenhum trabalho concluído.</p>
          )}
        </Section>
      </main>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-400">{titulo}</p>
      <p className="text-3xl mt-2 font-semibold">{valor}</p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-medium mb-6">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TrabalhoItem({ trabalho }: { trabalho: Trabalho }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50 transition cursor-pointer">
      <p className="font-medium">{trabalho.nome}</p>
      <p className="text-sm text-gray-400">
        {trabalho.tipo} • {trabalho.data}
      </p>
      <p className="text-xs text-gray-400 mt-1">{trabalho.status}</p>
    </div>
  );
}

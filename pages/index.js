// Código atualizado com:
// - Tema escuro já aplicado
// - Botão Novo Projeto
// - 45 dias úteis com feriados nacionais
// - Removido campo LINK (agora só NOTAS)

import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eks_checklist_jobs_v1";

// Feriados nacionais fixos (Brasil) – formato MM-DD
const HOLIDAYS = [
  "01-01", // Confraternização
  "04-21", // Tiradentes
  "05-01", // Trabalho
  "09-07", // Independência
  "10-12", // N. Sra Aparecida
  "11-02", // Finados
  "11-15", // Proclamação República
  "12-25"  // Natal
];

const TEMPLATE_TASKS = [
  { id: "backup", title: "FAZER BACKUP", hasDate: false },
  { id: "blog_50", title: "ESCOLHER 50 FOTOS PARA O BLOG", hasDate: false },
  { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },
  { id: "filter_1", title: "PRIMEIRO FILTRO", hasDate: false },
  { id: "filter_2", title: "SEGUNDO FILTRO", hasDate: false },
  { id: "filter_final", title: "FILTRO FINAL", hasDate: false },
  { id: "treat_all", title: "TRATAMENTO DE TODAS AS IMAGENS", hasDate: false },
  { id: "gallery_sent", title: "REVISOU E EXPORTOU AS IMAGENS PARA A GALERIA ON-LINE, ENVIOU PARA O CLIENTE", hasDate: true },
  { id: "album_link_sent", title: "ENVIOU LINK PARA O CLIENTE ESCOLHER AS FOTOS DO ÁLBUM NO DIA", hasDate: true },
  { id: "album_selected", title: "CLIENTE SELECIONOU AS FOTOS DO ÁLBUM NA DATA", hasDate: true, extraChoice: true },
  { id: "layout_sent", title: "DIAGRAMOU E ENVIOU PARA O CLIENTE APROVAR NO DIA", hasDate: true },
  { id: "album_approved", title: "CLIENTE APROVOU O ÁLBUM NO DIA", hasDate: true },
  { id: "album_export", title: "REVISOU AS FOTOS E EXPORTOU O ÁLBUM", hasDate: false },
  { id: "bindery_sent", title: "ENVIOU PARA ENCADERNADORA NO DIA", hasDate: true },
  { id: "bindery_arrived", title: "CHEGOU DA ENCADERNADORA NO DIA", hasDate: true },
  { id: "delivery_prep", title: "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir 5 fotos, cartão de agradecimento e feedback, mimos, etc.)", hasDate: false },
  { id: "delivered", title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA", hasDate: true }
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function isHoliday(date) {
  const mmdd = `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  return HOLIDAYS.includes(mmdd);
}

function addBusinessDaysISO(startISO, businessDays) {
  if (!startISO) return "";
  let d = new Date(startISO + "T00:00:00");
  let added = 0;

  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6 && !isHoliday(d)) {
      added++;
    }
  }

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function loadJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function makeDefaultTasks() {
  return TEMPLATE_TASKS.map((t) => ({
    id: t.id,
    title: t.title,
    done: false,
    date: "",
    notes: "",
    choice: t.extraChoice ? "" : undefined,
  }));
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [newJob, setNewJob] = useState({
    client: "",
    event: "",
    eventDate: "",
    deliveryFormat: "ÁLBUM / DIGITAL",
    dueDate: "",
  });

  useEffect(() => {
    const loaded = loadJobs();
    setJobs(loaded);
    setActiveId(loaded?.[0]?.id || null);
  }, []);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  const active = jobs.find((j) => j.id === activeId) || null;

  function createJob() {
    if (!newJob.client || !newJob.event) return;

    const job = {
      id: uid(),
      client: newJob.client,
      event: newJob.event,
      eventDate: newJob.eventDate,
      deliveryFormat: newJob.deliveryFormat,
      dueDate: newJob.dueDate,
      tasks: makeDefaultTasks(),
    };

    setJobs((prev) => [job, ...prev]);
    setActiveId(job.id);
    setNewJob({ client: "", event: "", eventDate: "", deliveryFormat: "ÁLBUM / DIGITAL", dueDate: "" });
  }

  function updateActive(patch) {
    if (!active) return;

    if (patch.eventDate !== undefined) {
      patch.dueDate = patch.eventDate ? addBusinessDaysISO(patch.eventDate, 45) : "";
    }

    setJobs((prev) => prev.map((j) => (j.id === active.id ? { ...j, ...patch } : j)));
  }

  function updateTask(taskId, patch) {
    if (!active) return;
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== active.id) return j;
        return {
          ...j,
          tasks: j.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        };
      })
    );
  }

  return (
    <div style={{ background: "#272727", minHeight: "100vh", color: "#F2F2F2", fontFamily: "Calibri, Segoe UI, Arial" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        <h1>Checklist do Fluxo de Trabalho</h1>

        <button onClick={createJob}>Novo Projeto</button>

        {active && (
          <div>
            <h2>{active.client}</h2>

            <input
              type="date"
              value={active.eventDate || ""}
              onChange={(e) => updateActive({ eventDate: e.target.value })}
            />

            <p>Prazo final: {formatBR(active.dueDate)}</p>

            {active.tasks.map((t) => (
              <div key={t.id} style={{ marginBottom: 15 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => updateTask(t.id, { done: e.target.checked })}
                  />
                  {t.title}
                </label>

                {t.hasDate && (
                  <input
                    type="date"
                    value={t.date || ""}
                    onChange={(e) => updateTask(t.id, { date: e.target.value })}
                  />
                )}

                <input
                  placeholder="Notas"
                  value={t.notes || ""}
                  onChange={(e) => updateTask(t.id, { notes: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

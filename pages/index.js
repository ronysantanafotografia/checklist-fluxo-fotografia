import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eks_checklist_jobs_v5";

// Feriados nacionais fixos (Brasil) – MM-DD
const FIXED_HOLIDAYS_MMDD = [
  "01-01",
  "04-21",
  "05-01",
  "09-07",
  "10-12",
  "11-02",
  "11-15",
  "12-25",
];

const PROJECT_TYPE = {
  EVENTO: "EVENTO",
  ENSAIO: "ENSAIO",
};

const DELIVERY_MODE = {
  DIGITAL: "DIGITAL",
  DIGITAL_ALBUM: "DIGITAL_ALBUM",
};

// 4 checklists (templates)
const TASK_TEMPLATES = {
  // Ensaio - somente digital
  [`${PROJECT_TYPE.ENSAIO}__${DELIVERY_MODE.DIGITAL}`]: [
    { id: "backup", title: "FAZER BACKUP" },
    { id: "blog_15", title: "ESCOLHER 15 FOTOS PARA O BLOG" },
    { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },

    { id: "filter_1", title: "PRIMEIRO FILTRO" },
    { id: "filter_final", title: "FILTRO FINAL" },

    { id: "treat_fast", title: "TRATAMENTO RÁPIDO DE TODAS AS IMAGENS" },

    { id: "client_choose_sent", title: "ENVIOU PARA O CLIENTE ESCOLHER NO DIA", hasDate: true },

    {
      id: "client_chose_images",
      title: "CLIENTE SELECIONOU AS IMAGENS NO DIA",
      hasDate: true,
      extraChoice: true,
    },

    {
      id: "final_treatment_export",
      title: "TRATAMENTO FINAL DAS IMAGENS E EXPORTAR (INTERNET, TRATADAS)",
    },

    {
      id: "send_images_client",
      title:
        "ENVIAR IMAGENS PARA O CLIENTE (Em baixa no WhatsApp e em alta no MyAirBridge)",
    },

    {
      id: "delivery_prep",
      title:
        "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir 3 fotos, cartão de agradecimento e feedback, mimos, etc.)",
    },

    {
      id: "delivered",
      title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA",
      hasDate: true,
    },
  ],

  // Evento - somente digital
  [`${PROJECT_TYPE.EVENTO}__${DELIVERY_MODE.DIGITAL}`]: [
    { id: "backup", title: "FAZER BACKUP" },

    { id: "blog_50", title: "ESCOLHER 50 FOTOS PARA O BLOG" },
    { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },

    { id: "filter_1", title: "PRIMEIRO FILTRO" },
    { id: "filter_2", title: "SEGUNDO FILTRO" },
    { id: "filter_final", title: "FILTRO FINAL" },

    { id: "treat_all", title: "TRATAMENTO DE TODAS AS IMAGENS" },

    {
      id: "gallery_sent",
      title: "REVISOU E EXPORTOU AS IMAGENS PARA A GALERIA ON-LINE, ENVIOU PARA O CLIENTE",
      hasDate: true,
    },

    {
      id: "delivery_prep",
      title:
        "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir 5 fotos, cartão de agradecimento e feedback, mimos, etc.)",
    },

    {
      id: "delivered",
      title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA",
      hasDate: true,
    },
  ],

  // Ensaio - com álbum
  [`${PROJECT_TYPE.ENSAIO}__${DELIVERY_MODE.DIGITAL_ALBUM}`]: [
    { id: "backup", title: "FAZER BACKUP" },

    { id: "blog_15", title: "ESCOLHER 15 FOTOS PARA O BLOG" },
    { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },

    { id: "filter_final", title: "FILTRO FINAL" },

    { id: "treat_fast", title: "TRATAMENTO RÁPIDO DE TODAS AS IMAGENS" },

    { id: "client_choose_sent", title: "ENVIOU PARA O CLIENTE ESCOLHER NO DIA", hasDate: true },

    {
      id: "client_chose_images",
      title: "CLIENTE SELECIONOU AS IMAGENS NO DIA",
      hasDate: true,
      extraChoice: true,
    },

    {
      id: "final_treatment_export",
      title: "TRATAMENTO FINAL DAS IMAGENS E EXPORTAR (INTERNET, TRATADAS)",
    },

    { id: "album_layout_sent", title: "DIAGRAMAR ÁLBUM E ENVIAR PARA APROVAÇÃO NO DIA", hasDate: true },

    { id: "album_approved", title: "CLIENTE APROVOU O ÁLBUM NO DIA", hasDate: true },

    { id: "album_review_images", title: "REVISAR AS IMAGENS DO ÁLBUM" },

    { id: "send_lowres_client", title: "ENVIAR IMAGENS EM BAIXA RESOLUÇÃO PARA O CLIENTE" },

    { id: "bindery_sent", title: "FOI ENVIADO PARA ENCADERNADORA NO DIA", hasDate: true },

    { id: "bindery_arrived", title: "CHEGOU DA ENCADERNADORA NO DIA", hasDate: true },

    {
      id: "delivery_prep",
      title:
        "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir cartão de agradecimento e feedback, mimos, etc.)",
    },

    { id: "delivered", title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA", hasDate: true },
  ],

  // Evento - com álbum
  [`${PROJECT_TYPE.EVENTO}__${DELIVERY_MODE.DIGITAL_ALBUM}`]: [
    { id: "backup", title: "FAZER BACKUP" },

    { id: "blog_50", title: "ESCOLHER 50 FOTOS PARA O BLOG" },
    { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },

    { id: "filter_1", title: "PRIMEIRO FILTRO" },
    { id: "filter_2", title: "SEGUNDO FILTRO" },
    { id: "filter_final", title: "FILTRO FINAL" },

    { id: "treat_all", title: "TRATAMENTO DE TODAS AS IMAGENS" },

    {
      id: "gallery_sent",
      title: "REVISOU E EXPORTOU AS IMAGENS PARA A GALERIA ON-LINE, ENVIOU PARA O CLIENTE",
      hasDate: true,
    },

    {
      id: "album_link_sent",
      title: "ENVIOU LINK PARA O CLIENTE ESCOLHER AS FOTOS DO ÁLBUM NO DIA",
      hasDate: true,
    },

    {
      id: "album_selected",
      title: "CLIENTE SELECIONOU AS FOTOS DO ÁLBUM NA DATA",
      hasDate: true,
      extraChoice: true,
    },

    { id: "layout_sent", title: "DIAGRAMOU E ENVIOU PARA O CLIENTE APROVAR NO DIA", hasDate: true },

    { id: "album_approved", title: "CLIENTE APROVOU O ÁLBUM NO DIA", hasDate: true },

    { id: "album_export", title: "REVISOU AS FOTOS E EXPORTOU O ÁLBUM" },

    { id: "bindery_sent", title: "ENVIOU PARA ENCADERNADORA NO DIA", hasDate: true },

    { id: "bindery_arrived", title: "CHEGOU DA ENCADERNADORA NO DIA", hasDate: true },

    {
      id: "delivery_prep",
      title:
        "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir 5 fotos, cartão de agradecimento e feedback, mimos, etc.)",
    },

    { id: "delivered", title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA", hasDate: true },
  ],
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function mmdd(date) {
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function isFixedHoliday(dateObj) {
  return FIXED_HOLIDAYS_MMDD.includes(mmdd(dateObj));
}

function isBusinessDay(dateObj) {
  const dow = dateObj.getDay(); // 0 dom, 6 sab
  const isWeekend = dow === 0 || dow === 6;
  return !isWeekend && !isFixedHoliday(dateObj);
}

// adiciona X dias úteis após data
function addBusinessDaysISO(startISO, businessDays) {
  if (!startISO) return "";
  let d = new Date(startISO + "T00:00:00");
  let added = 0;

  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    if (isBusinessDay(d)) added++;
  }

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// conta dias úteis entre A e B (A -> B). Se B < A, retorna negativo
function businessDaysBetween(fromISO, toISO) {
  if (!fromISO || !toISO) return null;

  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");

  const sign = b >= a ? 1 : -1;
  let start = sign === 1 ? a : b;
  let end = sign === 1 ? b : a;

  let count = 0;
  let d = new Date(start);
  while (d < end) {
    d.setDate(d.getDate() + 1);
    if (d <= end && isBusinessDay(d)) count++;
  }
  return count * sign;
}

function computeProgress(tasks) {
  if (!tasks?.length) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

function templateKey(projectType, deliveryMode) {
  return `${projectType}__${deliveryMode}`;
}

function makeTasks(projectType, deliveryMode) {
  const tpl = TASK_TEMPLATES[templateKey(projectType, deliveryMode)] || [];
  return tpl.map((t) => ({
    id: t.id,
    title: t.title,
    done: false,
    date: "",
    notes: "",
    choice: t.extraChoice ? "" : undefined,
    hasDate: !!t.hasDate,
    extraChoice: !!t.extraChoice,
  }));
}

/**
 * Rebuild de tasks quando muda o deliveryMode:
 * - preserva dados por id (done/date/notes/choice)
 * - remove o que não existe no novo template
 * - adiciona o que entrou
 */
function rebuildTasksForDeliveryChange(projectType, fromTasks, newDeliveryMode) {
  const tpl = TASK_TEMPLATES[templateKey(projectType, newDeliveryMode)] || [];
  const oldById = new Map((fromTasks || []).map((t) => [t.id, t]));

  return tpl.map((ref) => {
    const prev = oldById.get(ref.id);
    return {
      id: ref.id,
      title: ref.title,
      done: prev ? !!prev.done : false,
      date: prev ? prev.date || "" : "",
      notes: prev ? prev.notes || "" : "",
      choice: ref.extraChoice ? (prev?.choice || "") : undefined,
      hasDate: !!ref.hasDate,
      extraChoice: !!ref.extraChoice,
    };
  });
}

function labelProjectType(pt) {
  return pt === PROJECT_TYPE.ENSAIO ? "Ensaio fotográfico" : "Evento";
}

function labelDeliveryMode(dm) {
  return dm === DELIVERY_MODE.DIGITAL ? "Somente digital" : "Digital + álbum";
}

function normalizeLoadedJobs(rawJobs) {
  if (!Array.isArray(rawJobs)) return [];
  return rawJobs.map((j) => {
    const projectType = j.projectType || PROJECT_TYPE.EVENTO;
    const deliveryMode = j.deliveryMode || DELIVERY_MODE.DIGITAL_ALBUM;

    let tasks = Array.isArray(j.tasks) ? j.tasks : [];
    const tpl = TASK_TEMPLATES[templateKey(projectType, deliveryMode)];

    if (tpl?.length) {
      const byId = new Map(tpl.map((t) => [t.id, t]));
      tasks = tasks.map((t) => {
        const ref = byId.get(t.id);
        return {
          id: t.id,
          title: t.title || ref?.title || "",
          done: !!t.done,
          date: t.date || "",
          notes: t.notes || "",
          choice: t.choice ?? (ref?.extraChoice ? "" : undefined),
          hasDate: t.hasDate !== undefined ? !!t.hasDate : !!ref?.hasDate,
          extraChoice: t.extraChoice !== undefined ? !!t.extraChoice : !!ref?.extraChoice,
        };
      });

      const existing = new Set(tasks.map((x) => x.id));
      for (const item of tpl) {
        if (!existing.has(item.id)) {
          tasks.push({
            id: item.id,
            title: item.title,
            done: false,
            date: "",
            notes: "",
            choice: item.extraChoice ? "" : undefined,
            hasDate: !!item.hasDate,
            extraChoice: !!item.extraChoice,
          });
        }
      }
    }

    return {
      ...j,
      projectType,
      deliveryMode,
      tasks,
      isCompleted: !!j.isCompleted,
      completedAt: j.completedAt || "",
    };
  });
}

function loadJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return normalizeLoadedJobs(Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function exportJSON(jobs) {
  const blob = new Blob([JSON.stringify(jobs, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-checklist-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function jobStatus(job) {
  if (job.isCompleted) return "Finalizado";

  // mantém seus status existentes
  if (job?.dueDate) {
    const remBiz = businessDaysBetween(todayISO(), job.dueDate);
    if (remBiz !== null && remBiz < 0) return "Atrasado";
    if (remBiz !== null && remBiz <= 7) return "Próximos 7 dias";
  }
  return "Em andamento";
}

// semáforo: verde (ok), amarelo (>30 dias úteis do evento), vermelho (<=7 dias úteis do prazo ou atrasado)
function trafficTone(job) {
  if (job.isCompleted) return "neutral";

  const hasDue = !!job.dueDate;
  const hasEvent = !!job.eventDate;

  if (hasDue) {
    const remBiz = businessDaysBetween(todayISO(), job.dueDate);
    if (remBiz !== null && remBiz <= 7) return "red"; // inclui atrasado (negativo)
  }

  if (hasEvent) {
    const elapsedBiz = businessDaysBetween(job.eventDate, todayISO());
    if (elapsedBiz !== null && elapsedBiz > 30) return "yellow";
  }

  return "green";
}

function toneStyle(tone, active) {
  const base = active ? 0.16 : 0.12;
  if (tone === "green") {
    return {
      background: `rgba(96, 206, 128, ${base})`,
      border: `1px solid rgba(96, 206, 128, 0.18)`,
    };
  }
  if (tone === "yellow") {
    return {
      background: `rgba(255, 214, 102, ${base})`,
      border: `1px solid rgba(255, 214, 102, 0.18)`,
    };
  }
  if (tone === "red") {
    return {
      background: `rgba(255, 120, 120, ${base})`,
      border: `1px solid rgba(255, 120, 120, 0.18)`,
    };
  }
  return {
    background: active ? "rgba(255,255,255,0.06)" : "transparent",
    border: `1px solid rgba(255,255,255,0.06)`,
  };
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // “tela” (aba) da lista
  const [view, setView] = useState("PENDENTES"); // PENDENTES | FINALIZADOS

  const [newJob, setNewJob] = useState({
    client: "",
    event: "",
    eventDate: "",
    deliveryMode: DELIVERY_MODE.DIGITAL_ALBUM,
    projectType: PROJECT_TYPE.EVENTO,
    dueDate: "",
  });

  useEffect(() => {
    const loaded = loadJobs();
    setJobs(loaded);

    // escolhe um active compatível com a view
    const firstPending = loaded.find((j) => !j.isCompleted);
    const firstDone = loaded.find((j) => j.isCompleted);

    setActiveId(firstPending?.id || firstDone?.id || null);
  }, []);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  const pendingJobs = useMemo(() => jobs.filter((j) => !j.isCompleted), [jobs]);
  const doneJobs = useMemo(() => jobs.filter((j) => j.isCompleted), [jobs]);

  const listBase = view === "PENDENTES" ? pendingJobs : doneJobs;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listBase;

    return listBase.filter((j) =>
      [
        j.client,
        j.event,
        labelProjectType(j.projectType),
        labelDeliveryMode(j.deliveryMode),
      ].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [listBase, query]);

  const active = useMemo(() => jobs.find((j) => j.id === activeId) || null, [jobs, activeId]);

  // stats só faz sentido em pendentes, mas deixo bonito
  const stats = useMemo(() => {
    const base = pendingJobs;
    const s = { "Em andamento": 0, "Próximos 7 dias": 0, Atrasado: 0 };
    for (const j of base) {
      const st = jobStatus(j);
      if (st === "Em andamento") s["Em andamento"]++;
      if (st === "Próximos 7 dias") s["Próximos 7 dias"]++;
      if (st === "Atrasado") s["Atrasado"]++;
    }
    return s;
  }, [pendingJobs]);

  // se trocar view e o active não pertence a ela, ajusta
  useEffect(() => {
    if (!active) return;

    if (view === "PENDENTES" && active.isCompleted) {
      setActiveId(pendingJobs?.[0]?.id || null);
    }
    if (view === "FINALIZADOS" && !active.isCompleted) {
      setActiveId(doneJobs?.[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function createProject() {
    const client = newJob.client.trim();
    const event = newJob.event.trim();
    if (!client || !event) return;

    const project = {
      id: uid(),
      client,
      event,
      eventDate: newJob.eventDate,
      dueDate: newJob.dueDate,
      projectType: newJob.projectType,
      deliveryMode: newJob.deliveryMode,
      createdAt: new Date().toISOString(),
      tasks: makeTasks(newJob.projectType, newJob.deliveryMode),
      isCompleted: false,
      completedAt: "",
    };

    setJobs((prev) => [project, ...prev]);
    setView("PENDENTES");
    setActiveId(project.id);
    setShowNew(false);

    setNewJob({
      client: "",
      event: "",
      eventDate: "",
      dueDate: "",
      projectType: PROJECT_TYPE.EVENTO,
      deliveryMode: DELIVERY_MODE.DIGITAL_ALBUM,
    });
  }

  function updateActive(patch) {
    if (!active) return;

    // recalcula prazo quando muda data do evento
    if (Object.prototype.hasOwnProperty.call(patch, "eventDate")) {
      const eventDate = patch.eventDate;
      patch = { ...patch, dueDate: eventDate ? addBusinessDaysISO(eventDate, 45) : "" };
    }

    setJobs((prev) => prev.map((j) => (j.id === active.id ? { ...j, ...patch } : j)));
  }

  // troca de formato de entrega (adapta checklist)
  function changeDeliveryMode(newMode) {
    if (!active) return;
    if (newMode === active.deliveryMode) return;

    const newTasks = rebuildTasksForDeliveryChange(active.projectType, active.tasks, newMode);

    setJobs((prev) =>
      prev.map((j) =>
        j.id === active.id
          ? { ...j, deliveryMode: newMode, tasks: newTasks }
          : j
      )
    );
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

  function deleteProject(id) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  }

  function finalizeProject() {
    if (!active) return;

    const now = todayISO();
    setJobs((prev) =>
      prev.map((j) =>
        j.id === active.id
          ? { ...j, isCompleted: true, completedAt: now }
          : j
      )
    );

    // muda para finalizados e seleciona ele, ou o primeiro finalizado
    setView("FINALIZADOS");
    // mantém esse mesmo como ativo (agora ele está em finalizados)
    // se preferir, dá para selecionar o próximo pendente automaticamente
    setActiveId(active.id);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "[]"));
        if (!Array.isArray(data)) return;
        const normalized = normalizeLoadedJobs(data);
        setJobs(normalized);

        const firstPending = normalized.find((j) => !j.isCompleted);
        const firstDone = normalized.find((j) => j.isCompleted);

        setActiveId(firstPending?.id || firstDone?.id || null);
      } catch {
        // ignore
      }
    };
    reader.readAsText(file);
  }

  const progress = active ? computeProgress(active.tasks) : 0;
  const status = active ? jobStatus(active) : "";

  const sidebarTitle = view === "PENDENTES" ? "PROJETOS PENDENTES" : "PROJETOS FINALIZADOS";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.h1}>Checklist do Fluxo de Trabalho</div>
            <div style={styles.sub}>MVP single-user • salva no navegador • com backup JSON</div>
          </div>

          <div style={styles.headerBtns}>
            <button style={styles.btnGhost} onClick={() => setShowBackup(true)}>
              Backup
            </button>
            <button style={styles.btn} onClick={() => setShowNew(true)}>
              Novo Projeto
            </button>
          </div>
        </header>

        <div style={styles.grid}>
          {/* Sidebar */}
          <aside>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.sidebarTitleRow}>
                  <div style={styles.sidebarTitle}>{sidebarTitle}</div>
                </div>

                <div style={styles.tabs}>
                  <button
                    style={{ ...styles.tab, ...(view === "PENDENTES" ? styles.tabActive : {}) }}
                    onClick={() => setView("PENDENTES")}
                  >
                    Pendentes ({pendingJobs.length})
                  </button>
                  <button
                    style={{ ...styles.tab, ...(view === "FINALIZADOS" ? styles.tabActive : {}) }}
                    onClick={() => setView("FINALIZADOS")}
                  >
                    Finalizados ({doneJobs.length})
                  </button>
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por cliente, evento, formato…"
                  style={styles.search}
                />

                {view === "PENDENTES" ? (
                  <div style={styles.pills}>
                    <span style={styles.pill}>Em andamento: {stats["Em andamento"]}</span>
                    <span style={styles.pill}>7 dias: {stats["Próximos 7 dias"]}</span>
                    <span style={styles.pill}>Atrasados: {stats["Atrasado"]}</span>
                  </div>
                ) : (
                  <div style={styles.pills}>
                    <span style={styles.pill}>Finalizados: {doneJobs.length}</span>
                  </div>
                )}
              </div>

              <div style={styles.list}>
                {filtered.length === 0 ? (
                  <div style={styles.empty}>
                    {view === "PENDENTES"
                      ? "Nenhum projeto pendente."
                      : "Nenhum projeto finalizado."}
                  </div>
                ) : (
                  filtered.map((j) => {
                    const isActive = j.id === activeId;
                    const p = computeProgress(j.tasks);
                    const st = jobStatus(j);
                    const tone = trafficTone(j);
                    const toneBox = toneStyle(tone, isActive);

                    return (
                      <button
                        key={j.id}
                        onClick={() => setActiveId(j.id)}
                        style={{
                          ...styles.listItem,
                          ...toneBox,
                          outline: "none",
                        }}
                      >
                        <div style={styles.listTop}>
                          <div style={styles.listTitle}>
                            {j.client} - {j.event}
                          </div>
                          <div style={styles.listRight}>{p}%</div>
                        </div>

                        <div style={styles.listMeta}>
                          <span style={styles.pill}>{st}</span>
                          <span style={styles.pill}>{labelProjectType(j.projectType)}</span>
                          <span style={styles.pill}>{labelDeliveryMode(j.deliveryMode)}</span>
                          <span style={styles.pill}>
                            Prazo: {j.dueDate ? formatBR(j.dueDate) : "—"}
                          </span>
                        </div>

                        {j.isCompleted && j.completedAt ? (
                          <div style={styles.doneLine}>
                            Finalizado em {formatBR(j.completedAt)}
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>
            <div style={styles.card}>
              {!active ? (
                <div style={styles.emptyBig}>Selecione um projeto na lista.</div>
              ) : (
                <div>
                  <div style={styles.mainHeader}>
                    <div>
                      <div style={styles.mainTitle}>
                        {active.client} - {active.event}
                      </div>

                      <div style={styles.mainMeta}>
                        <span style={styles.pill}>{status}</span>
                        <span style={styles.pill}>{labelProjectType(active.projectType)}</span>
                        <span style={styles.pill}>{labelDeliveryMode(active.deliveryMode)}</span>
                        {active.eventDate ? (
                          <span style={styles.pill}>Evento: {formatBR(active.eventDate)}</span>
                        ) : null}
                        {active.dueDate ? (
                          <span style={styles.pill}>Prazo final: {formatBR(active.dueDate)}</span>
                        ) : null}
                        {active.isCompleted && active.completedAt ? (
                          <span style={styles.pill}>
                            Finalizado em: {formatBR(active.completedAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button style={styles.btnDanger} onClick={() => deleteProject(active.id)}>
                      Excluir
                    </button>
                  </div>

                  <div style={styles.progressWrap}>
                    <div style={styles.progressRow}>
                      <span style={styles.progressLabel}>Progresso</span>
                      <strong>{progress}%</strong>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                    </div>
                  </div>

                  <div style={styles.fields}>
                    <div style={styles.field}>
                      <label style={styles.label}>Cliente</label>
                      <input
                        value={active.client}
                        onChange={(e) => updateActive({ client: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Evento / Ensaio</label>
                      <input
                        value={active.event}
                        onChange={(e) => updateActive({ event: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Data do evento</label>
                      <input
                        type="date"
                        value={active.eventDate || ""}
                        onChange={(e) => updateActive({ eventDate: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Prazo final (auto 45 dias úteis)</label>
                      <input
                        type="date"
                        value={active.dueDate || ""}
                        onChange={(e) => updateActive({ dueDate: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    {/* Formato editável */}
                    <div style={styles.fieldWide}>
                      <label style={styles.label}>Formato de entrega (pode alterar)</label>
                      <div style={styles.inlineRadioWrap}>
                        <label style={styles.inlineRadio}>
                          <input
                            type="radio"
                            name={`delivery_${active.id}`}
                            checked={active.deliveryMode === DELIVERY_MODE.DIGITAL}
                            onChange={() => changeDeliveryMode(DELIVERY_MODE.DIGITAL)}
                          />
                          <span>Somente digital</span>
                        </label>
                        <label style={styles.inlineRadio}>
                          <input
                            type="radio"
                            name={`delivery_${active.id}`}
                            checked={active.deliveryMode === DELIVERY_MODE.DIGITAL_ALBUM}
                            onChange={() => changeDeliveryMode(DELIVERY_MODE.DIGITAL_ALBUM)}
                          />
                          <span>Digital + álbum</span>
                        </label>
                      </div>
                    </div>

                    {/* Tipo fixo */}
                    <div style={styles.fieldWide}>
                      <label style={styles.label}>Tipo de projeto (fixo)</label>
                      <input
                        value={labelProjectType(active.projectType)}
                        readOnly
                        style={styles.inputReadOnly}
                      />
                    </div>
                  </div>

                  <div style={styles.taskHint}>
                    Dica: tarefas com “data” registram quando algo foi feito.
                  </div>

                  <div style={{ padding: 18 }}>
                    {active.tasks.map((t) => (
                      <div key={t.id} style={styles.taskCard}>
                        <div style={styles.taskTop}>
                          <label style={styles.checkboxRow}>
                            <input
                              type="checkbox"
                              checked={!!t.done}
                              onChange={(e) => updateTask(t.id, { done: e.target.checked })}
                            />
                            <span style={{ ...styles.taskTitle, opacity: t.done ? 0.6 : 1 }}>
                              {t.title}
                            </span>
                          </label>
                        </div>

                        <div style={styles.taskGrid}>
                          {t.hasDate ? (
                            <div style={styles.field}>
                              <label style={styles.label}>Data</label>
                              <input
                                type="date"
                                value={t.date || ""}
                                onChange={(e) => updateTask(t.id, { date: e.target.value })}
                                style={styles.input}
                              />
                            </div>
                          ) : null}

                          {t.extraChoice ? (
                            <div style={styles.field}>
                              <label style={styles.label}>Seleção</label>
                              <select
                                value={t.choice || ""}
                                onChange={(e) => updateTask(t.id, { choice: e.target.value })}
                                style={styles.input}
                              >
                                <option value="">Escolha…</option>
                                <option value="ONLINE">Online</option>
                                <option value="PRESENCIAL">Presencial</option>
                              </select>
                            </div>
                          ) : null}

                          <div style={styles.fieldWide}>
                            <label style={styles.label}>Notas</label>
                            <input
                              value={t.notes || ""}
                              onChange={(e) => updateTask(t.id, { notes: e.target.value })}
                              placeholder="ex.: observações, encadernadora, número do pedido…"
                              style={styles.input}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* ✅ Botão FINALIZAR no final do checklist (somente se ainda não finalizado) */}
                    {!active.isCompleted ? (
                      <div style={styles.finishWrap}>
                        <button style={styles.btnFinish} onClick={finalizeProject}>
                          FINALIZAR PROJETO
                        </button>
                        <div style={styles.finishHint}>
                          Ao finalizar, este projeto sai da lista de pendentes e vai para projetos finalizados.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        <footer style={styles.footer}>
          MVP • Local-first • Próximo passo: sincronizar em nuvem + lembretes automáticos reais
        </footer>
      </div>

      {/* Modal Novo Projeto */}
      {showNew ? (
        <div style={styles.modalOverlay} onClick={() => setShowNew(false)}>
          <div style={styles.modalWide} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <strong>Novo Projeto</strong>
              <button style={styles.btnGhost} onClick={() => setShowNew(false)}>
                Fechar
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalGridTop}>
                <div style={styles.field}>
                  <label style={styles.label}>Cliente</label>
                  <input
                    value={newJob.client}
                    onChange={(e) => setNewJob((s) => ({ ...s, client: e.target.value }))}
                    style={styles.input}
                    placeholder="Ex.: Rony & Natália, Juliana, etc."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Evento / Ensaio</label>
                  <input
                    value={newJob.event}
                    onChange={(e) => setNewJob((s) => ({ ...s, event: e.target.value }))}
                    style={styles.input}
                    placeholder="Ex.: Casamento, Ensaio de 15 anos, etc."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Data do evento</label>
                  <input
                    type="date"
                    value={newJob.eventDate}
                    onChange={(e) => {
                      const eventDate = e.target.value;
                      const dueDate = eventDate ? addBusinessDaysISO(eventDate, 45) : "";
                      setNewJob((s) => ({ ...s, eventDate, dueDate }));
                    }}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Prazo final (auto 45 dias úteis)</label>
                  <input
                    type="date"
                    value={newJob.dueDate}
                    onChange={(e) => setNewJob((s) => ({ ...s, dueDate: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalGridBottom}>
                <div style={styles.block}>
                  <div style={styles.blockTitle}>Tipo de Projeto</div>
                  <div style={styles.optionRow}>
                    <label style={styles.optionLabel}>
                      <input
                        type="radio"
                        name="projectType"
                        checked={newJob.projectType === PROJECT_TYPE.EVENTO}
                        onChange={() => setNewJob((s) => ({ ...s, projectType: PROJECT_TYPE.EVENTO }))}
                      />
                      <span style={styles.optionText}>Evento</span>
                    </label>

                    <label style={styles.optionLabel}>
                      <input
                        type="radio"
                        name="projectType"
                        checked={newJob.projectType === PROJECT_TYPE.ENSAIO}
                        onChange={() => setNewJob((s) => ({ ...s, projectType: PROJECT_TYPE.ENSAIO }))}
                      />
                      <span style={styles.optionText}>Ensaio fotográfico</span>
                    </label>
                  </div>
                </div>

                <div style={styles.block}>
                  <div style={styles.blockTitle}>Formato de Entrega</div>
                  <div style={styles.optionRow}>
                    <label style={styles.optionLabel}>
                      <input
                        type="radio"
                        name="deliveryMode"
                        checked={newJob.deliveryMode === DELIVERY_MODE.DIGITAL}
                        onChange={() => setNewJob((s) => ({ ...s, deliveryMode: DELIVERY_MODE.DIGITAL }))}
                      />
                      <span style={styles.optionText}>Somente digital</span>
                    </label>

                    <label style={styles.optionLabel}>
                      <input
                        type="radio"
                        name="deliveryMode"
                        checked={newJob.deliveryMode === DELIVERY_MODE.DIGITAL_ALBUM}
                        onChange={() =>
                          setNewJob((s) => ({ ...s, deliveryMode: DELIVERY_MODE.DIGITAL_ALBUM }))
                        }
                      />
                      <span style={styles.optionText}>Digital + álbum</span>
                    </label>
                  </div>
                </div>

                <div style={styles.modalActionsRight}>
                  <button style={styles.btnGhost} onClick={() => setShowNew(false)}>
                    Cancelar
                  </button>
                  <button style={styles.btn} onClick={createProject}>
                    Criar Projeto
                  </button>
                </div>
              </div>

              <div style={styles.modalNote}>
                O checklist será criado automaticamente de acordo com as opções escolhidas.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Backup */}
      {showBackup ? (
        <div style={styles.modalOverlay} onClick={() => setShowBackup(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <strong>Backup</strong>
              <button style={styles.btnGhost} onClick={() => setShowBackup(false)}>
                Fechar
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ marginTop: 0, color: "rgba(255,255,255,0.75)" }}>
                Seus dados ficam salvos no navegador. Faça exportação periódica.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={styles.btnGhost} onClick={() => exportJSON(jobs)}>
                  Exportar JSON
                </button>

                <label style={styles.btnGhostLabel}>
                  Importar JSON
                  <input
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) importJSON(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Se abrir em outro computador/celular, seus projetos não aparecem automaticamente (ainda).
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#272727",
    color: "#F2F2F2",
    fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 18,
  },
  header: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  h1: { fontSize: 26, fontWeight: 700 },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  headerBtns: { display: "flex", gap: 10, alignItems: "center" },

  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 14,
  },

  card: {
    background: "#1F1F1F",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },

  cardHeader: { padding: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" },

  sidebarTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sidebarTitle: {
    fontSize: 14,
    letterSpacing: 0.6,
    fontWeight: 900,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 10,
  },

  tabs: { display: "flex", gap: 8, marginBottom: 10 },
  tab: {
    flex: 1,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.82)",
    padding: "9px 10px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },
  tabActive: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.20)",
    color: "#F2F2F2",
  },

  search: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#2B2B2B",
    color: "#F2F2F2",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },

  pills: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  pill: {
    fontSize: 12,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.88)",
  },

  list: { maxHeight: "70vh", overflow: "auto" },

  listItem: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    margin: 10,
    padding: 14,
    cursor: "pointer",
    color: "#F2F2F2",
  },

  listTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  listTitle: { fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.92)" },
  listRight: { fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.80)" },
  listMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  doneLine: { marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.68)" },

  mainHeader: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  mainTitle: { fontSize: 18, fontWeight: 900 },
  mainMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  progressWrap: { padding: "0 16px 16px" },
  progressRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 12 },
  progressLabel: { color: "rgba(255,255,255,0.72)" },
  progressBar: {
    height: 10,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: { height: "100%", background: "#F2F2F2" },

  fields: {
    padding: 16,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldWide: { display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" },
  label: { fontSize: 12, color: "rgba(255,255,255,0.70)" },
  input: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#2B2B2B",
    color: "#F2F2F2",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  inputReadOnly: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.85)",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },

  inlineRadioWrap: {
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
  },
  inlineRadio: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },

  taskHint: { padding: "0 16px 8px", fontSize: 13, color: "rgba(255,255,255,0.70)" },

  taskCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#1F1F1F",
  },
  taskTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  checkboxRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  taskTitle: { fontWeight: 900, fontSize: 13, lineHeight: 1.35 },

  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginTop: 12,
  },

  finishWrap: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    textAlign: "center",
  },
  btnFinish: {
    width: "100%",
    background: "#F2F2F2",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },
  finishHint: { marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.60)" },

  btn: {
    background: "#F2F2F2",
    color: "#111",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },
  btnGhost: {
    background: "transparent",
    color: "#F2F2F2",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },
  btnDanger: {
    background: "transparent",
    color: "#ffb4ab",
    border: "1px solid rgba(255,180,171,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },

  empty: { padding: 16, color: "rgba(255,255,255,0.70)", fontSize: 13 },
  emptyBig: { padding: 22, color: "rgba(255,255,255,0.70)", fontSize: 14 },

  footer: { marginTop: 16, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.55)" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: 860,
    background: "#1F1F1F",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
    overflow: "hidden",
    color: "#F2F2F2",
  },
  modalWide: {
    width: "100%",
    maxWidth: 1100,
    background: "#1F1F1F",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
    overflow: "hidden",
    color: "#F2F2F2",
  },
  modalHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBody: { padding: 14 },

  modalGridTop: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    alignItems: "end",
  },
  modalGridBottom: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 18,
    marginTop: 18,
    alignItems: "end",
  },

  block: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },
  blockTitle: { fontSize: 13, fontWeight: 900, marginBottom: 10, color: "rgba(255,255,255,0.85)" },
  optionRow: { display: "flex", gap: 20, flexWrap: "wrap" },
  optionLabel: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  optionText: { fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.85)" },

  modalActionsRight: { display: "flex", gap: 10, justifyContent: "flex-end" },
  modalNote: { marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" },

  btnGhostLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "#F2F2F2",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
  },
};

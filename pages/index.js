import React, { useEffect, useMemo, useState } from "react";

/**
 * MVP – Checklist de Fluxo de Trabalho (single-user)
 * - Next.js Pages Router (pages/index.js)
 * - Persistência: localStorage
 * - Sem Tailwind (CSS inline + classes simples)
 */

const STORAGE_KEY = "eks_checklist_jobs_v1";

const TEMPLATE_TASKS = [
  { id: "backup", title: "FAZER BACKUP", hasDate: false },
  { id: "blog_50", title: "ESCOLHER 50 FOTOS PARA O BLOG", hasDate: false },
  { id: "blog_posted", title: "FOI POSTADO NO BLOG NO DIA", hasDate: true },
  { id: "filter_1", title: "PRIMEIRO FILTRO", hasDate: false },
  { id: "filter_2", title: "SEGUNDO FILTRO", hasDate: false },
  { id: "filter_final", title: "FILTRO FINAL", hasDate: false },
  { id: "treat_all", title: "TRATAMENTO DE TODAS AS IMAGENS", hasDate: false },
  {
    id: "gallery_sent",
    title:
      "REVISOU E EXPORTOU AS IMAGENS PARA A GALERIA ON-LINE, ENVIOU PARA O CLIENTE",
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
    extraChoice: true, // Online / Presencial
  },
  {
    id: "layout_sent",
    title: "DIAGRAMOU E ENVIOU PARA O CLIENTE APROVAR NO DIA",
    hasDate: true,
  },
  { id: "album_approved", title: "CLIENTE APROVOU O ÁLBUM NO DIA", hasDate: true },
  { id: "album_export", title: "REVISOU AS FOTOS E EXPORTOU O ÁLBUM", hasDate: false },
  { id: "bindery_sent", title: "ENVIOU PARA ENCADERNADORA NO DIA", hasDate: true },
  { id: "bindery_arrived", title: "CHEGOU DA ENCADERNADORA NO DIA", hasDate: true },
  {
    id: "delivery_prep",
    title:
      "PREPAROU A ENTREGA (Gravar imagens em alta no pen drive, imprimir 5 fotos, cartão de agradecimento e feedback, mimos, etc.)",
    hasDate: false,
  },
  {
    id: "delivered",
    title: "ENTREGOU / INFORMOU PARA O CLIENTE QUE FOI FINALIZADO NO DIA",
    hasDate: true,
  },
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

function daysBetween(fromISO, toISO) {
  if (!fromISO || !toISO) return null;
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function addDaysISO(iso, days) {
  const d = new Date((iso || todayISO()) + "T00:00:00");
  d.setDate(d.getDate() + days);
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
    link: "",
    notes: "",
    choice: t.extraChoice ? "" : undefined,
  }));
}

function computeProgress(tasks) {
  if (!tasks?.length) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

function jobStatus(job) {
  const allDone = job?.tasks?.every((t) => t.done);
  if (allDone) return "Concluído";

  if (job?.dueDate) {
    const diff = daysBetween(todayISO(), job.dueDate);
    if (diff !== null && diff < 0) return "Atrasado";
    if (diff !== null && diff <= 7) return "Próximos 7 dias";
  }
  return "Em andamento";
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

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");

  const [newJob, setNewJob] = useState({
    client: "",
    event: "",
    eventDate: "",
    deliveryFormat: "ÁLBUM / DIGITAL",
    dueDate: addDaysISO(todayISO(), 60),
  });

  const [showNew, setShowNew] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    const loaded = loadJobs();
    setJobs(loaded);
    setActiveId(loaded?.[0]?.id || null);
  }, []);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.client, j.event, j.deliveryFormat].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [jobs, query]);

  const active = useMemo(
    () => jobs.find((j) => j.id === activeId) || null,
    [jobs, activeId]
  );

  const stats = useMemo(() => {
    const s = { "Em andamento": 0, "Próximos 7 dias": 0, Atrasado: 0, Concluído: 0 };
    for (const j of jobs) s[jobStatus(j)]++;
    return s;
  }, [jobs]);

  function createJob() {
    const client = newJob.client.trim();
    const event = newJob.event.trim();
    if (!client || !event) return;

    const job = {
      id: uid(),
      client,
      event,
      eventDate: newJob.eventDate,
      deliveryFormat: newJob.deliveryFormat,
      dueDate: newJob.dueDate,
      createdAt: new Date().toISOString(),
      tasks: makeDefaultTasks(),
    };

    setJobs((prev) => [job, ...prev]);
    setActiveId(job.id);
    setShowNew(false);
    setNewJob({
      client: "",
      event: "",
      eventDate: "",
      deliveryFormat: "ÁLBUM / DIGITAL",
      dueDate: addDaysISO(todayISO(), 60),
    });
  }

  function updateActive(patch) {
    if (!active) return;
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

  function deleteJob(id) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (activeId === id) {
      const next = jobs.find((j) => j.id !== id);
      setActiveId(next?.id || null);
    }
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "[]"));
        if (!Array.isArray(data)) return;
        setJobs(data);
        setActiveId(data?.[0]?.id || null);
      } catch {
        // ignore
      }
    };
    reader.readAsText(file);
  }

  const progress = active ? computeProgress(active.tasks) : 0;
  const status = active ? jobStatus(active) : "";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.h1}>Checklist do Fluxo de Trabalho</div>
            <div style={styles.sub}>
              MVP single-user • salva no navegador • com backup JSON
            </div>
          </div>

          <div style={styles.headerBtns}>
            <button style={styles.btnGhost} onClick={() => setShowBackup(true)}>
              Backup
            </button>
            <button style={styles.btn} onClick={() => setShowNew(true)}>
              Novo job
            </button>
          </div>
        </header>

        <div style={styles.grid}>
          {/* Sidebar */}
          <aside style={styles.sidebar}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por cliente, evento, formato…"
                  style={styles.search}
                />
                <div style={styles.pills}>
                  <span style={styles.pill}>Em andamento: {stats["Em andamento"]}</span>
                  <span style={styles.pill}>7 dias: {stats["Próximos 7 dias"]}</span>
                  <span style={styles.pill}>Atrasados: {stats["Atrasado"]}</span>
                  <span style={styles.pill}>Concluídos: {stats["Concluído"]}</span>
                </div>
              </div>

              <div style={styles.list}>
                {filtered.length === 0 ? (
                  <div style={styles.empty}>Nenhum job. Clique em “Novo job”.</div>
                ) : (
                  filtered.map((j) => {
                    const isActive = j.id === activeId;
                    const p = computeProgress(j.tasks);
                    const st = jobStatus(j);

                    return (
                      <button
                        key={j.id}
                        onClick={() => setActiveId(j.id)}
                        style={{
                          ...styles.listItem,
                          background: isActive ? "rgba(0,0,0,0.04)" : "transparent",
                        }}
                      >
                        <div style={styles.listTop}>
                          <div style={styles.listTitle}>{j.client}</div>
                          <div style={styles.listRight}>{p}%</div>
                        </div>
                        <div style={styles.listSub}>{j.event}</div>
                        <div style={styles.listMeta}>
                          <span style={styles.pill}>{st}</span>
                          <span style={styles.pill}>
                            Prazo: {j.dueDate ? formatBR(j.dueDate) : "—"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={styles.main}>
            <div style={styles.card}>
              {!active ? (
                <div style={styles.emptyBig}>Selecione um job na lista.</div>
              ) : (
                <div>
                  <div style={styles.mainHeader}>
                    <div>
                      <div style={styles.mainTitle}>
                        {active.client} • {active.event}
                      </div>
                      <div style={styles.mainMeta}>
                        <span style={styles.pill}>{status}</span>
                        <span style={styles.pill}>{active.deliveryFormat}</span>
                        {active.eventDate ? (
                          <span style={styles.pill}>Evento: {formatBR(active.eventDate)}</span>
                        ) : null}
                        {active.dueDate ? (
                          <span style={styles.pill}>Prazo final: {formatBR(active.dueDate)}</span>
                        ) : null}
                      </div>
                    </div>

                    <button style={styles.btnDanger} onClick={() => deleteJob(active.id)}>
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
                      <label style={styles.label}>Evento</label>
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
                      <label style={styles.label}>Prazo final</label>
                      <input
                        type="date"
                        value={active.dueDate || ""}
                        onChange={(e) => updateActive({ dueDate: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.taskHint}>
                    Dica: tarefas com “data” registram quando algo foi feito.
                  </div>

                  <div style={{ padding: 18 }}>
                    {active.tasks.map((t) => {
                      const tpl = TEMPLATE_TASKS.find((x) => x.id === t.id);
                      const hasDate = tpl?.hasDate;
                      const extraChoice = tpl?.extraChoice;

                      return (
                        <div key={t.id} style={styles.taskCard}>
                          <div style={styles.taskTop}>
                            <label style={styles.checkboxRow}>
                              <input
                                type="checkbox"
                                checked={!!t.done}
                                onChange={(e) => updateTask(t.id, { done: e.target.checked })}
                              />
                              <span style={{ ...styles.taskTitle, opacity: t.done ? 0.5 : 1 }}>
                                {t.title}
                              </span>
                            </label>
                          </div>

                          <div style={styles.taskGrid}>
                            {hasDate ? (
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

                            {extraChoice ? (
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
                              <label style={styles.label}>Link (opcional)</label>
                              <input
                                value={t.link || ""}
                                onChange={(e) => updateTask(t.id, { link: e.target.value })}
                                placeholder="ex.: link do blog, galeria, seleção…"
                                style={styles.input}
                              />
                            </div>

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
                      );
                    })}
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

      {/* Modal Novo Job */}
      {showNew ? (
        <div style={styles.modalOverlay} onClick={() => setShowNew(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <strong>Novo job</strong>
              <button style={styles.btnGhost} onClick={() => setShowNew(false)}>
                Fechar
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.fields}>
                <div style={styles.field}>
                  <label style={styles.label}>Cliente</label>
                  <input
                    value={newJob.client}
                    onChange={(e) => setNewJob((s) => ({ ...s, client: e.target.value }))}
                    style={styles.input}
                    placeholder="ex.: Carla"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Evento</label>
                  <input
                    value={newJob.event}
                    onChange={(e) => setNewJob((s) => ({ ...s, event: e.target.value }))}
                    style={styles.input}
                    placeholder="ex.: Casamento Carla & Gilvan"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Data do evento</label>
                  <input
                    type="date"
                    value={newJob.eventDate}
                    onChange={(e) => setNewJob((s) => ({ ...s, eventDate: e.target.value }))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Prazo final</label>
                  <input
                    type="date"
                    value={newJob.dueDate}
                    onChange={(e) => setNewJob((s) => ({ ...s, dueDate: e.target.value }))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldWide}>
                  <label style={styles.label}>Formato de entrega</label>
                  <select
                    value={newJob.deliveryFormat}
                    onChange={(e) =>
                      setNewJob((s) => ({ ...s, deliveryFormat: e.target.value }))
                    }
                    style={styles.input}
                  >
                    <option value="ÁLBUM / DIGITAL">ÁLBUM / DIGITAL</option>
                    <option value="SOMENTE DIGITAL">SOMENTE DIGITAL</option>
                    <option value="SOMENTE ÁLBUM">SOMENTE ÁLBUM</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnGhost} onClick={() => setShowNew(false)}>
                  Cancelar
                </button>
                <button style={styles.btn} onClick={createJob}>
                  Criar job
                </button>
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
              <p style={{ marginTop: 0, color: "rgba(0,0,0,0.7)" }}>
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

              <div style={{ marginTop: 14, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                Se abrir em outro computador/celular, seus jobs não aparecem automaticamente (ainda).
                A gente resolve isso na fase 2 com sincronização em nuvem.
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
    background: "#fafafa",
    color: "#111",
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
  sub: { fontSize: 13, color: "rgba(0,0,0,0.6)" },
  headerBtns: { display: "flex", gap: 10, alignItems: "center" },

  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 14,
  },
  sidebar: {},
  main: {},

  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  cardHeader: { padding: 14, borderBottom: "1px solid rgba(0,0,0,0.06)" },
  search: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  pills: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  pill: {
    fontSize: 12,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.08)",
  },

  list: { maxHeight: "70vh", overflow: "auto" },
  listItem: {
    width: "100%",
    textAlign: "left",
    border: "none",
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  listTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  listTitle: { fontWeight: 700, fontSize: 14 },
  listRight: { fontWeight: 700, fontSize: 13, color: "rgba(0,0,0,0.75)" },
  listSub: { marginTop: 4, fontSize: 13, color: "rgba(0,0,0,0.7)" },
  listMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  mainHeader: {
    padding: 16,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  mainTitle: { fontSize: 18, fontWeight: 800 },
  mainMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  progressWrap: { padding: "0 16px 16px" },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginTop: 12,
  },
  progressLabel: { color: "rgba(0,0,0,0.7)" },
  progressBar: {
    height: 10,
    background: "rgba(0,0,0,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: { height: "100%", background: "#111" },

  fields: {
    padding: 16,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldWide: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    gridColumn: "span 2",
  },
  label: { fontSize: 12, color: "rgba(0,0,0,0.6)" },
  input: {
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },

  taskHint: {
    padding: "0 16px 8px",
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
  },

  taskCard: {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#fff",
  },
  taskTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  checkboxRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  taskTitle: { fontWeight: 700, fontSize: 13, lineHeight: 1.35 },

  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginTop: 12,
  },

  btn: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  btnGhost: {
    background: "transparent",
    color: "#111",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  btnDanger: {
    background: "#fff",
    color: "#b42318",
    border: "1px solid rgba(180,35,24,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },

  empty: { padding: 16, color: "rgba(0,0,0,0.6)", fontSize: 13 },
  emptyBig: { padding: 22, color: "rgba(0,0,0,0.6)", fontSize: 14 },

  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: 860,
    background: "#fff",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBody: { padding: 14 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },

  btnGhostLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "#111",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
};

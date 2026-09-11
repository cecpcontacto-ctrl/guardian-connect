import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { CaseCard } from "@/components/CaseCard";
import { CaseModal } from "@/components/CaseModal";
import {
  ORIGINS,
  PROGRESS,
  STAGES,
  createCase,
  deleteCase,
  fetchCases,
  isOverdue,
  updateCase,
  type CaseInput,
  type CaseRow,
} from "@/lib/cases";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline de Atención a Apoderados" },
      {
        name: "description",
        content:
          "Tablero para gestionar la atención a apoderados: seguimiento, notas, WhatsApp y avance de cada proceso.",
      },
      { property: "og:title", content: "Pipeline de Atención a Apoderados" },
      {
        property: "og:description",
        content:
          "Organiza cada caso de apoderado por etapa, registra notas y contacta por WhatsApp en un clic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Board,
});

function Board() {
  const qc = useQueryClient();
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [progressFilter, setProgressFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cases"] });

  const create = useMutation({
    mutationFn: (input: CaseInput) => createCase(input),
    onSuccess: (row) => {
      invalidate();
      setSelectedId(row.id);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CaseInput }) => updateCase(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCase(id),
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
    },
  });

  const filtered = useMemo(
    () =>
      cases.filter(
        (c) =>
          (progressFilter === "Todos" || c.progress === progressFilter) &&
          (originFilter === "Todos" || c.origin === originFilter),
      ),
    [cases, progressFilter, originFilter],
  );

  const selected = cases.find((c) => c.id === selectedId) ?? null;
  const overdueCount = filtered.filter((c) => isOverdue(c.next_followup)).length;

  const handleDrop = (stage: string) => {
    setOverStage(null);
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;
    const item = cases.find((c) => c.id === id);
    if (!item || item.stage === stage) return;
    qc.setQueryData<CaseRow[]>(["cases"], (prev) =>
      (prev ?? []).map((c) => (c.id === id ? { ...c, stage } : c)),
    );
    update.mutate({ id, input: { stage } });
  };

  const addCase = (stage: string) =>
    create.mutate({
      student_name: "Nuevo alumno",
      guardian_name: "Nuevo apoderado",
      whatsapp: "",
      email: "",
      origin: "Otro",
      work_minutes: 0,
      progress: "Sin Proceso",
      stage,
      notes: [],
    });

  return (
    <main className="min-h-screen bg-background">
      <header
        className="border-b border-border px-4 py-5 sm:px-6"
        style={{ backgroundImage: "var(--gradient-header)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Users className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                Pipeline de Atención a Apoderados
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} procesos · {overdueCount} con seguimiento vencido
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar por avance"
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground"
            >
              <option value="Todos">Todos los avances</option>
              {PROGRESS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar por origen"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground"
            >
              <option value="Todos">Todos los orígenes</option>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto px-4 py-5 sm:px-6">
        <div className="flex min-w-max gap-4 max-md:min-w-0 max-md:flex-col">
          {STAGES.map((stage) => {
            const items = filtered.filter((c) => c.stage === stage);
            return (
              <section
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(stage);
                }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(stage);
                }}
                className={`flex w-80 shrink-0 flex-col rounded-2xl border border-border bg-card/40 p-3 transition-colors max-md:w-full ${
                  overStage === stage ? "column-over" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    {stage}
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                      {items.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => addCase(stage)}
                    aria-label={`Agregar apoderado en ${stage}`}
                    className="rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-accent"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="flex min-h-24 flex-col gap-3">
                  {isLoading ? (
                    <p className="text-xs text-muted-foreground">Cargando…</p>
                  ) : items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Arrastra tarjetas aquí
                    </p>
                  ) : (
                    items.map((item) => (
                      <CaseCard
                        key={item.id}
                        item={item}
                        dragging={draggingId === item.id}
                        onDragStart={() => setDraggingId(item.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onOpen={() => setSelectedId(item.id)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {selected ? (
        <CaseModal
          item={selected}
          onClose={() => setSelectedId(null)}
          onSave={async (id, input) => {
            await update.mutateAsync({ id, input });
          }}
          onDelete={async (id) => {
            await remove.mutateAsync(id);
          }}
        />
      ) : null}
    </main>
  );
}

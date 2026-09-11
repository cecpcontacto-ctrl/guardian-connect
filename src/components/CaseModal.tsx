import { useEffect, useState } from "react";
import { MessageCircle, Trash2, X } from "lucide-react";
import type { CaseInput, CaseRow, Note } from "@/lib/cases";
import { ORIGINS, PROGRESS, STAGES, waLink } from "@/lib/cases";

const inputClass =
  "w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

export function CaseModal({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: CaseRow;
  onClose: () => void;
  onSave: (id: string, input: CaseInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<CaseRow>(item);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => setForm(item), [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof CaseRow>(key: K, value: CaseRow[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const persist = async (patch: CaseInput) => {
    setSaving(true);
    try {
      await onSave(item.id, patch);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await persist({
      student_name: form.student_name,
      guardian_name: form.guardian_name,
      whatsapp: form.whatsapp,
      email: form.email,
      origin: form.origin,
      work_minutes: Number(form.work_minutes) || 0,
      progress: form.progress,
      next_followup: form.next_followup || null,
      stage: form.stage,
      notes: form.notes,
    });
    onClose();
  };

  const addNote = async () => {
    const text = noteText.trim();
    if (!text) return;
    const note: Note = {
      id: crypto.randomUUID(),
      text,
      created_at: new Date().toISOString(),
    };
    const notes = [note, ...form.notes];
    setForm((prev) => ({ ...prev, notes }));
    setNoteText("");
    await persist({ notes });
  };

  const history = [...form.notes].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-popover p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Detalle del proceso</h2>
            <p className="text-xs text-muted-foreground">{form.student_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre del alumno</label>
            <input
              className={inputClass}
              value={form.student_name}
              onChange={(e) => set("student_name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Nombre del apoderado</label>
            <input
              className={inputClass}
              value={form.guardian_name}
              onChange={(e) => set("guardian_name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input
              className={inputClass}
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="56912345678"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Origen del proceso</label>
            <select
              className={inputClass}
              value={form.origin}
              onChange={(e) => set("origin", e.target.value)}
            >
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Periodo de trabajo (minutos)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.work_minutes}
              onChange={(e) => set("work_minutes", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Avance</label>
            <select
              className={inputClass}
              value={form.progress}
              onChange={(e) => set("progress", e.target.value)}
            >
              {PROGRESS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Próximo seguimiento</label>
            <input
              type="date"
              className={inputClass}
              value={form.next_followup ?? ""}
              onChange={(e) => set("next_followup", e.target.value || null)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Etapa</label>
            <select
              className={inputClass}
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.whatsapp ? (
          <a
            href={waLink(form.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
          >
            <MessageCircle className="size-4" /> Abrir WhatsApp
          </a>
        ) : null}

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Historial del apoderado</h3>
          <div className="mt-2 flex gap-2">
            <input
              className={inputClass}
              placeholder="Agregar nota…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button
              onClick={addNote}
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              Agregar
            </button>
          </div>
          <ol className="mt-3 space-y-2 border-l border-border pl-4">
            {history.length === 0 ? (
              <li className="text-xs text-muted-foreground">Aún no hay notas registradas.</li>
            ) : (
              history.map((n) => (
                <li key={n.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("es-CL")}
                  </p>
                  <p className="text-sm text-foreground">{n.text}</p>
                </li>
              ))
            )}
          </ol>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">¿Eliminar este proceso?</span>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" /> Eliminar
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

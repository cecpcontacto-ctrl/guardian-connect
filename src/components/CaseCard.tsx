import { MessageCircle, Clock, CalendarClock, Mail } from "lucide-react";
import type { CaseRow } from "@/lib/cases";
import { formatDate, isOverdue, notePreview, waLink } from "@/lib/cases";

const progressStyles: Record<string, string> = {
  "Sin Proceso": "bg-danger/15 text-danger border-danger/40",
  "En Proceso": "bg-warning/15 text-warning border-warning/40",
  "Proceso Exitoso": "bg-info/15 text-info border-info/40",
};

export function CaseCard({
  item,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  item: CaseRow;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  const overdue = isOverdue(item.next_followup);
  const preview = notePreview(item.notes);

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={`card-lift cursor-grab rounded-xl border bg-card p-3 active:cursor-grabbing ${
        overdue ? "border-danger/70 ring-1 ring-danger/40" : "border-border"
      } ${dragging ? "card-dragging" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.student_name}</h3>
          <p className="truncate text-xs text-muted-foreground">{item.guardian_name}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            progressStyles[item.progress] ?? progressStyles["Sin Proceso"]
          }`}
        >
          {item.progress}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-secondary px-2 py-0.5">{item.origin}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" /> {item.work_minutes} min
        </span>
      </div>

      {item.email ? (
        <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <Mail className="size-3 shrink-0" /> {item.email}
        </p>
      ) : null}

      <p
        className={`mt-1 flex items-center gap-1 text-[11px] ${
          overdue ? "font-medium text-danger" : "text-muted-foreground"
        }`}
      >
        <CalendarClock className="size-3 shrink-0" />
        Seguimiento: {formatDate(item.next_followup)}
        {overdue ? " (vencido)" : ""}
      </p>

      {preview ? (
        <p className="mt-2 line-clamp-2 rounded-md bg-muted/60 p-2 text-[11px] text-muted-foreground">
          {preview}
        </p>
      ) : null}

      {item.whatsapp ? (
        <a
          href={waLink(item.whatsapp)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="size-3.5" /> WhatsApp {item.whatsapp}
        </a>
      ) : null}
    </article>
  );
}

import { supabase } from "@/integrations/supabase/client";

export const STAGES = [
  "Nuevo Apoderado",
  "Problema Observado",
  "Propuesta Enviada",
  "Negociando",
  "Proceso Exitoso",
  "Proceso en Construcción",
] as const;

export const ORIGINS = [
  "Inasistencia",
  "Atrasos",
  "Calificaciones",
  "Conducta",
  "Otro",
] as const;

export const PROGRESS = ["Sin Proceso", "En Proceso", "Proceso Exitoso"] as const;

export type Stage = (typeof STAGES)[number];
export type Origin = (typeof ORIGINS)[number];
export type Progress = (typeof PROGRESS)[number];

export type Note = {
  id: string;
  text: string;
  created_at: string;
};

export type CaseRow = {
  id: string;
  student_name: string;
  guardian_name: string;
  whatsapp: string;
  email: string;
  origin: string;
  work_minutes: number;
  progress: string;
  next_followup: string | null;
  stage: string;
  position: number;
  notes: Note[];
  created_at: string;
  updated_at: string;
};

export type CaseInput = Partial<Omit<CaseRow, "id" | "created_at" | "updated_at">>;

function normalize(row: Record<string, unknown>): CaseRow {
  const rawNotes = row["notes"];
  return {
    ...(row as unknown as CaseRow),
    notes: Array.isArray(rawNotes) ? (rawNotes as Note[]) : [],
  };
}

export async function fetchCases(): Promise<CaseRow[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
}

export async function createCase(input: CaseInput): Promise<CaseRow> {
  const { data, error } = await supabase
    .from("cases")
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}

export async function updateCase(id: string, input: CaseInput): Promise<CaseRow> {
  const { data, error } = await supabase
    .from("cases")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
}

export function isOverdue(nextFollowup: string | null): boolean {
  if (!nextFollowup) return false;
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = nextFollowup.split("-").map(Number);
  if (!y || !m || !d) return false;
  return new Date(y, m - 1, d).getTime() < todayKey.getTime();
}

export function formatDate(value: string | null): string {
  if (!value) return "Sin fecha";
  const [y, m, d] = value.split("-");
  return `${d}-${m}-${y}`;
}

export function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

export function notePreview(notes: Note[]): string | null {
  if (!notes.length) return null;
  const sorted = [...notes].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (sorted[0]?.text ?? "").split("\n")[0] ?? null;
}

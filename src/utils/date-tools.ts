export function formatDuration(seconds: number | null) {
  if (seconds === null) return "Duración pendiente";

  const rounded = Math.max(0, Math.round(seconds));

  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

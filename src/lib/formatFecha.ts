// src/utils/formatFecha.ts
export function formatFecha(fecha: string | number | Date | null | undefined): string {
  if (!fecha) return "Sin fecha";

  try {
    // Si viene como string numérico, conviértelo
    const value =
      typeof fecha === "string" && /^\d+$/.test(fecha)
        ? Number(fecha)
        : fecha;

    const date = new Date(value);
    if (isNaN(date.getTime())) return "Sin fecha";

    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      
    });
  } catch {
    return "Sin fecha";
  }
}

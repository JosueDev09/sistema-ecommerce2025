export const formatFechas = (ms: number) => {
  const date = new Date(ms);

  const dia = String(date.getUTCDate()).padStart(2, "0");
  const mes = String(date.getUTCMonth() + 1).padStart(2, "0");
  const año = date.getUTCFullYear();

  const horas = String(date.getUTCHours()).padStart(2, "0");
  const minutos = String(date.getUTCMinutes()).padStart(2, "0");
  const segundos = String(date.getUTCSeconds()).padStart(2, "0");

  return `${dia}-${mes}-${año} ${horas}:${minutos}:${segundos}`;
};


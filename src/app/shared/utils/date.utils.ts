// Converteix una data de MySQL ("2025-08-30 00:00:00") a "YYYY-MM-DD" (IMPORTANT PER QUAN RECOLLIM INFO QUE VOLEM INTRODUIR DINS DEL GENERIC FORM)
export const mysqlToDateInput = (mysqlDate: string): string | null => {
  if (!mysqlDate) return null;
  return mysqlDate.split(" ")[0]; // talla l'hora i es queda amb "2025-08-30"
};

// Converteix ISO format més llegible per UI (p. ex. "30/08/2025 00:00")
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Converteix data de l'input ("YYYY-MM-DD") -> format MySQL ("YYYY-MM-DD HH:mm:ss")
export const formatDateToMySQL = (dateStr: string): string => {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// Valida que la data inicial < data final
export function dateRangeValidator(initialDate: string, endDate: string): boolean {
  if (!initialDate || !endDate) return true; // si falten valors, no donem error
  return new Date(initialDate) <= new Date(endDate);
}

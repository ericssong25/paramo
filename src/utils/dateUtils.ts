/**
 * Utilidades para manejo de fechas en la aplicación
 * Resuelve problemas de zona horaria entre Supabase y JavaScript
 */

/**
 * Convierte una fecha de Supabase (string YYYY-MM-DD) a Date local
 * Evita problemas de zona horaria interpretando la fecha como local
 */
export const parseSupabaseDate = (dateString: string | null): Date | undefined => {
  if (!dateString) {
    return undefined;
  }
  
  // Para fechas de tipo DATE en Supabase (YYYY-MM-DD), crear la fecha en zona horaria local
  const [year, month, day] = dateString.split('-').map(Number);
  const result = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  
  return result;
};

/**
 * Convierte un Date a string para Supabase (YYYY-MM-DD)
 * Asegura que la fecha se formatee en zona horaria local
 */
export const formatDateForSupabase = (date: Date | undefined): string | undefined => {
  if (!date) {
    return undefined;
  }
  
  // Asegurar que la fecha se formatee en zona horaria local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0-11
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  
  return result;
};

/**
 * Formatea una fecha para mostrar en la UI
 * Usa la zona horaria local del usuario
 */
export const formatDateForDisplay = (date: Date | undefined): string => {
  if (!date) return '';
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Verifica si una fecha está vencida (comparando solo la fecha, no la hora)
 */
export const isDateOverdue = (date: Date | undefined): boolean => {
  if (!date) return false;
  
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return dueDate < todayDate;
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD para Supabase
 */
export const getTodayForSupabase = (): string => {
  return formatDateForSupabase(new Date()) || '';
};

/**
 * Convierte una fecha de input HTML (YYYY-MM-DD) a Date
 */
export const parseInputDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  return parseSupabaseDate(dateString);
};

/**
 * Convierte un Date a formato para input HTML (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  return formatDateForSupabase(date) || '';
};

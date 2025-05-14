
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

/**
 * Format a date string to Thai locale format
 * @param dateString ISO date string
 * @param formatPattern Format pattern (defaults to full date and time with Thai notation)
 * @returns Formatted date string in Thai locale
 */
export const formatThaiDate = (dateString: string | null | undefined, formatPattern: string = "dd MMMM yyyy HH:mm:ss น."): string => {
  if (!dateString) return "ไม่มีข้อมูล";
  try {
    return format(parseISO(dateString), formatPattern, { locale: th });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "วันที่ไม่ถูกต้อง";
  }
};

/**
 * Format a date string to Thai short format (date only)
 * @param dateString ISO date string
 * @returns Formatted date string in Thai locale (date only)
 */
export const formatThaiShortDate = (dateString: string | null | undefined): string => {
  return formatThaiDate(dateString, "dd MMMM yyyy");
};

/**
 * Get current date and time in Thai format
 * @returns Current date and time formatted in Thai locale
 */
export const getCurrentThaiDateTime = (): string => {
  return format(new Date(), "dd MMMM yyyy HH:mm:ss น.", { locale: th });
};

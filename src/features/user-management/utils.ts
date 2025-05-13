
// Format date for display
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "ไม่เคยเข้าสู่ระบบ";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format price for display
export const formatPrice = (price?: number | null): string => {
  if (price === undefined || price === null) return "-";
  return price.toLocaleString('th-TH');
};

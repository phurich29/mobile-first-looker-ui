
// Format date for display
export const formatDate = (dateString?: string | null, language: 'th' | 'en' = 'th'): string => {
  if (!dateString) {
    return language === 'th' ? "ไม่เคยเข้าสู่ระบบ" : "Never signed in";
  }
  
  const date = new Date(dateString);
  
  if (language === 'en') {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } else {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

// Format price for display
export const formatPrice = (price?: number | null): string => {
  if (price === undefined || price === null) return "-";
  return price.toLocaleString('th-TH');
};


// Format date for display
export const formatDate = (dateString?: string | null, language: 'th' | 'en' | 'zh' = 'th'): string => {
  if (!dateString) {
    switch (language) {
      case 'en': return "Never signed in";
      case 'zh': return "从未登录";
      default: return "ไม่เคยเข้าสู่ระบบ";
    }
  }
  
  const date = new Date(dateString);
  
  switch (language) {
    case 'en':
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    case 'zh':
      return new Intl.DateTimeFormat('zh-CN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    default:
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

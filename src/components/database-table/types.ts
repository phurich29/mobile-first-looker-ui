
export interface RiceQualityAnalysisRow {
  id: number;
  device_code: string;
  created_at: string;
  thai_datetime: string;
  [key: string]: any;
}

export interface PaginationProps {
  currentPage: number;
  rowLimit: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  goToPage: string;
  setGoToPage: (page: string) => void;
  handleGoToPageSubmit: (e: React.FormEvent) => void;
}

export interface TableControlsProps {
  rowLimit: number;
  setRowLimit: (limit: number) => void;
  handleRefresh: () => void;
  isRefreshing?: boolean;
}

export interface TableContentProps {
  data: RiceQualityAnalysisRow[];
  loading: boolean;
  error: string | null;
  columnKeys: string[];
  formatDate: (dateString: string | null, columnKey?: string) => string;
  fetchData: () => Promise<void>;
}

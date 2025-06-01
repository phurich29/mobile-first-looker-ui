
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Show user-friendly error message
    toast({
      title: "เกิดข้อผิดพลาด",
      description: "มีข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าเว็บ",
      variant: "destructive",
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-4">
              ขออภัย มีบางอย่างผิดพลาด กรุณารีเฟรชหน้าเว็บแล้วลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              รีเฟรชหน้าเว็บ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

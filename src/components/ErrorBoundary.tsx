
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this looks like an infinite loop
    if (error.message.includes('Maximum update depth exceeded') || 
        error.message.includes('Too many re-renders')) {
      console.error('🔄 Detected potential infinite loop - stopping execution');
      
      // Auto-reset after 3 seconds to prevent permanent lock
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleReset();
      }, 3000);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Clear any problematic localStorage items that might cause loops
    try {
      localStorage.removeItem('lastViewedDeviceCode');
      console.log('🧹 Cleared potentially problematic localStorage items');
    } catch (err) {
      console.warn('Failed to clear localStorage:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.handleReset} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="max-w-md mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ระบบพบปัญหาและได้หยุดการทำงานเพื่อป้องกันการวนซ้ำ
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                ลองใหม่อีกครั้ง
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/equipment'} 
                className="w-full"
              >
                ไปหน้าอุปกรณ์
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

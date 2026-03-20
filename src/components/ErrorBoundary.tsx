import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">애플리케이션 오류가 발생했습니다</h1>
          <p className="text-white/60 text-sm max-w-md mb-8 leading-relaxed">
            죄송합니다. 예상치 못한 오류로 인해 화면을 불러올 수 없습니다. 
            아래 버튼을 눌러 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 w-full max-w-lg overflow-auto">
            <p className="text-[10px] font-mono text-red-400 text-left whitespace-pre-wrap">
              {this.state.error?.toString()}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black text-sm font-bold hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

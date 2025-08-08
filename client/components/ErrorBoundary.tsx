import * as React from "react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-950 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                KRUGER
              </h1>
              <p className="text-xl mb-4">Initializing...</p>
              <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-pulse" />
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

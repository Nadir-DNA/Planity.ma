
"use client";

import { Component, ReactNode } from "react";
import { Button } from "./button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Erreur</h2>
          <p className="text-sm text-neutral-500 mb-4">{this.state.error?.message}</p>
          <Button onClick={this.reset} className="gap-2"><RefreshCw className="w-4 h-4" />Réessayer</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold mb-2">Erreur</h2>
      <p className="text-sm text-neutral-500">{message || "Une erreur s est produite"}</p>
    </div>
  );
}

'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[DOBITKA] Error in ${this.props.section ?? 'unknown section'}:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="py-4 text-center">
          <p className="text-[12px] text-muted-foreground">
            Nie udało się załadować {this.props.section ?? 'sekcji'}. Odśwież stronę.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';

interface SafeBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface SafeBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SafeBoundary extends React.Component<SafeBoundaryProps, SafeBoundaryState> {
  constructor(props: SafeBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`[SafeBoundary] Caught component error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default SafeBoundary;

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * PRODUCTION-GRADE ERROR BOUNDARY
 * ------------------------------
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors to the console (and potentially a cloud service),
 * and displays a fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real production app, you would log this to Sentry or Google Cloud Error Reporting
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          margin: '2rem auto',
          maxWidth: '600px'
        }}>
          <div style={{
            background: '#fee2e2',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1.5rem'
          }}>
            <AlertTriangle size={48} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
            We encountered an unexpected error. Don&apos;t worry, your data is safe. 
            Try refreshing the page or going back to the home screen.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={() => window.location.reload()}>
              <RotateCcw size={18} /> Refresh Page
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f3f4f6',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              textAlign: 'left',
              overflow: 'auto',
              maxWidth: '100%'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

"use client";

import React, { type ReactNode } from "react";
import { SurfaceErrorFallback } from "@/components/errors/SurfaceErrorFallback";

type SurfaceKind = "widget" | "shell" | "map";

interface SurfaceErrorBoundaryProps {
  kind: SurfaceKind;
  children: ReactNode;
  title?: string;
  body?: string;
  className?: string;
  compact?: boolean;
}

interface SurfaceErrorBoundaryState {
  hasError: boolean;
  errorKey: number;
}

export class SurfaceErrorBoundary extends React.Component<
  SurfaceErrorBoundaryProps,
  SurfaceErrorBoundaryState
> {
  state: SurfaceErrorBoundaryState = {
    hasError: false,
    errorKey: 0,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[${this.props.kind} boundary]`, error);
  }

  private handleRetry = () => {
    this.setState((currentState) => ({
      hasError: false,
      errorKey: currentState.errorKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <SurfaceErrorFallback
          kind={this.props.kind}
          title={this.props.title}
          body={this.props.body}
          onRetry={this.handleRetry}
          className={this.props.className}
          compact={this.props.compact}
        />
      );
    }

    return <React.Fragment key={this.state.errorKey}>{this.props.children}</React.Fragment>;
  }
}

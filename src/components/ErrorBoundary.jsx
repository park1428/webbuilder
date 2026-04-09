import React from 'react';
import { Icons } from './Icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <Icons.AlertCircle style={{ width: 64, height: 64, color: '#ef4444' }} />
            </div>
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try reloading the page.'}
            </p>

            {this.state.error && (
              <details className="error-details">
                <summary>Error details (for debugging)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button className="btn-primary" onClick={this.handleReload}>
                <Icons.Redo />
                Reload Page
              </button>
              <button className="btn-secondary" onClick={this.handleReset}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

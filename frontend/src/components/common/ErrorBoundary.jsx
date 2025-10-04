import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#1E3A5F] to-[#0A1929] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gradient-to-br from-[#1E3A5F]/50 to-[#0A1929]/50 backdrop-blur-sm border border-[#00D9FF]/30 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF3366]/20 border-2 border-[#FF3366] mb-4">
                <svg
                  className="w-10 h-10 text-[#FF3366]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-[#B0BEC5] text-lg">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-[#0A1929]/50 border border-[#FF3366]/30 rounded-lg">
                <h3 className="text-[#FF3366] font-semibold mb-2">Error Details:</h3>
                <p className="text-[#B0BEC5] text-sm font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-[#00D9FF] cursor-pointer hover:text-[#7B61FF] transition-colors">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-[#B0BEC5] mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00D9FF]/50 transition-all duration-300"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-[#1E3A5F] text-white font-semibold rounded-lg border border-[#00D9FF]/30 hover:bg-[#1E3A5F]/80 hover:border-[#00D9FF] transition-all duration-300"
              >
                Go to Dashboard
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

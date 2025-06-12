import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service like Sentry
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Implementation for error tracking service
    console.log('Logging error to monitoring service:', { error, errorInfo });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  handleContactSupport = () => {
    window.open('mailto:support@jobmate.com?subject=Error Report&body=Error details: ' + encodeURIComponent(this.state.error?.message || 'Unknown error'), '_blank');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              Don't worry - this happens sometimes. We've been notified and are working on a fix.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Technical Details (Development)
                </summary>
                <div className="bg-gray-100 p-4 rounded text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <motion.button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </motion.button>

              <motion.button
                onClick={this.handleContactSupport}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </motion.button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Error ID: {Date.now().toString(36)}
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

class OfflineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isOffline: !navigator.onLine
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isOffline: !navigator.onLine
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Offline Error Boundary caught an error:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
    // Auto-retry if error was network-related
    if (this.state.hasError && this.isNetworkError(this.state.error)) {
      this.handleRetry();
    }
  };

  handleOffline = () => {
    this.setState({ isOffline: true });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  isNetworkError = (error: Error | null): boolean => {
    if (!error) return false;
    const networkErrorMessages = [
      'fetch',
      'network',
      'offline',
      'connection',
      'timeout'
    ];
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.isNetworkError(this.state.error);
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full">
            <Alert className={`${isNetworkError && this.state.isOffline ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
              {this.state.isOffline ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              <AlertTitle>
                {isNetworkError && this.state.isOffline 
                  ? 'You\'re Offline' 
                  : 'Something went wrong'
                }
              </AlertTitle>
              <AlertDescription className="mt-2">
                {isNetworkError && this.state.isOffline ? (
                  <>
                    <p className="mb-3">
                      The app is working in offline mode. Some features may be limited until you reconnect.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your data is safely stored locally and will sync when you're back online.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-3">
                      An unexpected error occurred. This might be due to a network issue or a temporary problem.
                    </p>
                    <details className="text-sm text-muted-foreground">
                      <summary className="cursor-pointer">Error details</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {this.state.error?.message}
                      </pre>
                    </details>
                  </>
                )}
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button onClick={this.handleRetry} size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  Reload App
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OfflineErrorBoundary;
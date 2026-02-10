import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '24px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
                            Application Error
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', marginBottom: '24px' }}>
                            Something went wrong while rendering the application.
                        </p>

                        {this.state.error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '24px',
                                textAlign: 'left'
                            }}>
                                <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
                                    Error Details:
                                </div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                                    {this.state.error.toString()}
                                </div>
                                {this.state.errorInfo && (
                                    <details style={{ marginTop: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
                                        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Component Stack</summary>
                                        <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px' }}>
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px 28px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <RefreshCcw size={18} />
                            Reload Application
                        </button>

                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginTop: '24px' }}>
                            If the problem persists, please check the browser console for more details.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

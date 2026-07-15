import { Component } from 'react';

/**
 * App-level error boundary. Catches render/runtime errors in the tree below it
 * so a single component fault doesn't blank the whole app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            color: '#333',
          }}
        >
          <h2 style={{ margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#777', margin: 0 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reload view
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

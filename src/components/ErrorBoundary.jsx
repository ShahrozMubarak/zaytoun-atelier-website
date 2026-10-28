import React from 'react';

/**
 * ErrorBoundary - Prevents blank white screen crashes across the entire React tree
 * Provides a luxury fallback interface with a 1-click recovery button.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-onyx-950 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-white dark:bg-onyx-900 border-2 border-black dark:border-white p-8 shadow-2xl">
            <span className="text-3xl mb-4 block">🏛️</span>
            <h1 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white mb-2">
              Atelier Session Restored
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-light leading-relaxed mb-6">
              A temporary display glitch occurred while loading garments. Our atelier engine has prevented a blank screen.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs tracking-widest hover:bg-neutral-800 transition rounded-none"
            >
              Reload Atelier Catalog
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

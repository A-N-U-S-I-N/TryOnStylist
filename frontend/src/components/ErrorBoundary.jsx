import React from 'react';
import Button from './Button'; 

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-white">
          <i className="mb-6 text-6xl text-gray-300 fa-solid fa-triangle-exclamation"></i>
          <h1 className="mb-4 text-3xl font-extrabold tracking-widest text-black uppercase">Something Went Wrong</h1>
          <p className="max-w-md mb-8 text-gray-500">
            We encountered an unexpected error while trying to load this section. Please try refreshing the page or navigating back home.
          </p>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-2 text-sm font-bold tracking-wider text-white uppercase transition bg-black hover:bg-gray-800">
              Reload Page
            </button>
            <a href="/">
              <Button variant="secondary">Go Home</Button>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
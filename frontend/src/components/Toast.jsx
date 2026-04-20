import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

const DURATION = 3000; 

let addToastRef = null;

export const showToast = (message, variant = 'info') => {
  if (addToastRef) {
    addToastRef(message, variant);
  } else {
    console.warn('ToastContainer not mounted, message not shown:', message);
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const addToast = useCallback((message, variant) => {
    const newToast = { id: (toastId.current++).toString(), message, variant };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  useEffect(() => {
    addToastRef = addToast;
    return () => {
      addToastRef = null; 
    };
  }, [addToast]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => prevToasts.slice(1));
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'success':
        return 'bg-green-800';
      case 'error':
        return 'bg-red-700';
      case 'warning':
        return 'bg-yellow-700';
      case 'info':
      default:
        return 'bg-gray-900';
    }
  };

  if (typeof window === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="fixed top-6 right-6 z-[1000] flex flex-col items-end gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getVariantStyles(toast.variant)} text-white px-4 py-2 rounded-sm shadow-md max-w-sm transform transition duration-300`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
};
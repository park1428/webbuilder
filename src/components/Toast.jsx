import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Toast component wrapper
export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#1a202c',
          padding: '16px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
    />
  );
}

// Toast utility functions
export const showToast = {
  success: (message) => {
    toast.success(message, {
      icon: '✓',
    });
  },

  error: (message) => {
    toast.error(message, {
      icon: '✕',
    });
  },

  info: (message) => {
    toast(message, {
      icon: 'ℹ',
      style: {
        borderLeft: '4px solid #2C5F8D',
      },
    });
  },

  loading: (message) => {
    return toast.loading(message);
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    });
  },
};

export default ToastContainer;

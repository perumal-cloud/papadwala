'use client';

import { useEffect } from 'react';

export default function FedCMErrorSuppressor() {
  useEffect(() => {
    // Store the original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Override console.error to filter FedCM messages
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      // Filter out FedCM-related error messages
      if (
        message.includes('FedCM get() rejects with AbortError') ||
        message.includes('signal is aborted without reason') ||
        message.includes('GSI_LOGGER') ||
        message.includes('[GSI_LOGGER]') ||
        message.includes('FedCM')
      ) {
        // Silently ignore these errors
        return;
      }
      // Call original console.error for other messages
      originalConsoleError.apply(console, args);
    };

    // Override console.warn for FedCM warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      // Filter out FedCM-related warning messages
      if (
        message.includes('FedCM') ||
        message.includes('GSI_LOGGER') ||
        message.includes('[GSI_LOGGER]')
      ) {
        // Silently ignore these warnings
        return;
      }
      // Call original console.warn for other messages
      originalConsoleWarn.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  return null; // This component doesn't render anything
}
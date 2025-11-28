'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useEffect, useRef } from 'react';

interface GoogleSignInWrapperProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: string;
}

export default function GoogleSignInWrapper({
  onSuccess,
  onError,
  text = "signin_with",
  theme = "outline",
  size = "large",
  shape = "rectangular",
  width = "100%"
}: GoogleSignInWrapperProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up any existing timeouts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSuccess(credentialResponse);
  };

  const handleError = () => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Add a small delay to prevent immediate retry that might cause FedCM issues
    timeoutRef.current = setTimeout(() => {
      onError();
    }, 100);
  };

  // Suppress FedCM console errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Filter out FedCM AbortError messages
      const message = args.join(' ');
      if (
        message.includes('FedCM get() rejects with AbortError') ||
        message.includes('signal is aborted without reason') ||
        message.includes('GSI_LOGGER')
      ) {
        // Silently ignore these errors
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      theme={theme}
      size={size}
      text={text}
      shape={shape}
      width={width}
    />
  );
}
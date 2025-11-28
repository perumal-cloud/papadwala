'use client';

import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import FedCMErrorSuppressor from '@/components/utils/FedCMErrorSuppressor';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if current route is admin route
  const isAdminRoute = isClient && pathname?.startsWith('/admin');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '595901189886-j9agg8fmtsdv1reqntu3vak998rpc1qa.apps.googleusercontent.com';

  // Validate Google Client ID
  if (!googleClientId) {
    console.warn('Google Client ID is not configured properly');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <FedCMErrorSuppressor />
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? "min-h-screen" : "flex-grow"}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </GoogleOAuthProvider>
  );
}
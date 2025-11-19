'use client';

import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  return (
    <>
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? "min-h-screen" : "flex-grow"}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
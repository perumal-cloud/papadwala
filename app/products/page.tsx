'use client';

import { Suspense } from 'react';
import ProductsContent from './ProductsContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

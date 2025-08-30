'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelledPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-800 mb-2">Payment Cancelled</h1>
        <p className="text-red-600 mb-4">No charges were made to your account.</p>
        <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
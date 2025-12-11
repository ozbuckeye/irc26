'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';

export default function AdminSignInPage() {
  useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid password');
        setLoading(false);
      } else {
        // Password verified, redirect to admin page
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/Background%20Storm.PNG)' }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex items-center justify-center pt-24 pb-16 px-4">
        <Card className="max-w-md w-full bg-white/95 rounded-3xl shadow-xl px-6 py-8 space-y-6">
          <h1 className="font-lovely text-3xl text-center mb-2">Admin Login</h1>
          <p className="text-xs text-center text-black/60 font-arial-rounded">
            This login is for IRC26 organisers only.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 font-arial-rounded">
                Admin Password
              </label>
              <input
                type="password"
                className="w-full border border-black/20 rounded-xl px-3 py-2 text-sm font-arial-rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="text-xs text-red-600 font-arial-rounded">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-black/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-arial-rounded"
            >
              {loading ? 'Signing in...' : 'Sign in as admin'}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}







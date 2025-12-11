'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/Card';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Failed to send magic link. Please try again.');
        setLoading(false);
      } else {
        // Redirect to verify request page
        window.location.href = '/auth/verify-request';
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/IRC_background_1.jpeg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <div className="relative z-10 flex justify-center items-center py-16 px-4">
          <Card className="max-w-md">
            <div className="text-center space-y-4">
              <h1 className="font-lovely text-3xl sm:text-4xl text-gray-900">Sign In</h1>
              <p className="text-gray-600">
                Enter your email address and we&apos;ll send you a magic link to sign in.
              </p>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}




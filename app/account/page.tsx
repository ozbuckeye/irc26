'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import RequireAuth from '@/components/RequireAuth';
import Card from '@/components/Card';
import Link from 'next/link';

type Pledge = {
  id: string;
  title: string | null;
  cacheType: string;
  cacheSize: string;
  approxSuburb: string;
  approxState: string;
  status: string;
  createdAt: string;
  submission: {
    id: string;
    gcCode: string;
    cacheName: string;
  } | null;
};

type Submission = {
  id: string;
  gcCode: string;
  cacheName: string;
  suburb: string;
  state: string;
  createdAt: string;
  pledge: {
    id: string;
    title: string | null;
  };
};

type User = {
  email: string;
  gcUsername: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gcUsername, setGcUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/me').then((res) => res.json()),
      fetch('/api/pledges/me').then((res) => res.json()),
      fetch('/api/submissions/me').then((res) => res.json()),
    ])
      .then(([userData, pledgesData, submissionsData]) => {
        setUser(userData.user);
        setGcUsername(userData.user?.gcUsername || '');
        setPledges(pledgesData.pledges || []);
        setSubmissions(submissionsData.submissions || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateUsername = async () => {
    if (!gcUsername.trim()) {
      return;
    }
    setUpdatingUsername(true);
    try {
      const response = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcUsername: gcUsername.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch {
      console.error('Failed to update username');
    } finally {
      setUpdatingUsername(false);
    }
  };

  const cacheTypeLabels: Record<string, string> = {
    TRADITIONAL: 'Traditional',
    MULTI: 'Multi-cache',
    MYSTERY: 'Mystery',
    LETTERBOX: 'Letterbox',
    WHERIGO: 'Wherigo',
    VIRTUAL: 'Virtual',
  };

  const cacheSizeLabels: Record<string, string> = {
    NANO: 'Nano',
    MICRO: 'Micro',
    SMALL: 'Small',
    REGULAR: 'Regular',
    LARGE: 'Large',
    OTHER: 'Other',
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <main
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/IRC_background_1.jpeg')" }}
      >
        <div className="min-h-screen bg-black/60">
          <div className="relative z-10 flex justify-center items-start py-16 px-4">
            <div className="w-full max-w-4xl space-y-6">
              {/* Profile Card */}
              <Card>
                <div className="space-y-4">
                  <h1 className="font-lovely text-3xl font-bold text-gray-900">My Account</h1>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Email
                    </label>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Geocaching Username
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={gcUsername}
                        onChange={(e) => setGcUsername(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your geocaching.com username"
                      />
                      <button
                        onClick={handleUpdateUsername}
                        disabled={updatingUsername || gcUsername === user?.gcUsername}
                        className="bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {updatingUsername ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </Card>

              {/* My Pledges */}
              <Card>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-lovely text-2xl font-bold text-gray-900">My Pledges</h2>
                    <Link
                      href="/pledge"
                      className="bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 text-sm"
                    >
                      + New Pledge
                    </Link>
                  </div>

                  {pledges.length === 0 ? (
                    <p className="text-gray-600">No pledges yet. <Link href="/pledge" className="text-primary-600 hover:underline">Create your first pledge</Link>.</p>
                  ) : (
                    <div className="space-y-3">
                      {pledges.map((pledge) => (
                        <div key={pledge.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {pledge.title || `${cacheTypeLabels[pledge.cacheType] || pledge.cacheType} - ${pledge.approxSuburb}, ${pledge.approxState}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {cacheTypeLabels[pledge.cacheType] || pledge.cacheType} • {cacheSizeLabels[pledge.cacheSize] || pledge.cacheSize} • {pledge.status}
                              </p>
                              {pledge.submission && (
                                <p className="text-sm text-green-600 mt-1">✓ Confirmed</p>
                              )}
                            </div>
                            <Link
                              href={`/pledge/${pledge.id}/edit`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* My Submissions */}
              <Card>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-lovely text-2xl font-bold text-gray-900">My Submissions</h2>
                    <Link
                      href="/confirm"
                      className="bg-secondary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-secondary-700 text-sm"
                    >
                      + New Submission
                    </Link>
                  </div>

                  {submissions.length === 0 ? (
                    <p className="text-gray-600">No submissions yet. <Link href="/confirm" className="text-secondary-600 hover:underline">Submit your first cache</Link>.</p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {submission.gcCode} - {submission.cacheName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {submission.suburb}, {submission.state}
                              </p>
                            </div>
                            <Link
                              href={`/submission/${submission.id}/edit`}
                              className="text-secondary-600 hover:text-secondary-700 text-sm font-semibold"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}




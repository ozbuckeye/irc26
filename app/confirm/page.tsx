'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CACHE_TYPES, AU_STATES, DIFFICULTY_RATINGS, TERRAIN_RATINGS, SUBMISSION_DEADLINE } from '@/config/irc26';
import RequireAuth from '@/components/RequireAuth';
import Card from '@/components/Card';
import Link from 'next/link';

type Pledge = {
  id: string;
  title: string | null;
  cacheType: string;
  approxSuburb: string;
  approxState: string;
  submission: { id: string } | null;
};

export default function ConfirmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [selectedPledgeId, setSelectedPledgeId] = useState('');
  const [formData, setFormData] = useState({
    gcCode: '',
    cacheName: '',
    suburb: '',
    state: '' as '' | 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA',
    difficulty: 2.0,
    terrain: 2.0,
    type: '' as '' | 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL',
    hiddenDate: '',
    notes: '',
  });

  const isPastDeadline = new Date() > SUBMISSION_DEADLINE;

  // Load user's pledges without submissions
  useEffect(() => {
    fetch('/api/pledges/me')
      .then((res) => res.json())
      .then((data) => {
        const availablePledges = data.pledges.filter((p: Pledge) => !p.submission);
        setPledges(availablePledges);
        if (availablePledges.length === 0) {
          setError('no-pledges');
        }
      })
      .catch(() => {
        setError('Failed to load pledges');
      });
  }, []);

  // When pledge is selected, pre-fill some fields
  useEffect(() => {
    if (selectedPledgeId) {
      const pledge = pledges.find((p) => p.id === selectedPledgeId);
      if (pledge) {
        setFormData({
          ...formData,
          suburb: pledge.approxSuburb,
          state: pledge.approxState as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA',
          type: pledge.cacheType as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL',
        });
      }
    }
  }, [selectedPledgeId, pledges, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedPledgeId) {
      setError('Please select a pledge');
      setLoading(false);
      return;
    }

    if (!formData.gcCode || !formData.cacheName || !formData.suburb || !formData.state || !formData.type || !formData.hiddenDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgeId: selectedPledgeId,
          ...formData,
          hiddenDate: new Date(formData.hiddenDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create submission');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
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

  const stateLabels: Record<string, string> = {
    ACT: 'ACT',
    NSW: 'NSW',
    NT: 'NT',
    QLD: 'QLD',
    SA: 'SA',
    TAS: 'TAS',
    VIC: 'VIC',
    WA: 'WA',
  };

  const successContent = (
    <div className="text-center space-y-4">
      <h1 className="font-lovely text-3xl font-bold text-green-700">Submission Confirmed Successfully!</h1>
      <p className="text-gray-700">
        Thank you for confirming your cache! We&apos;ve sent a confirmation email to your address.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push('/account')}
          className="bg-primary-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary-700"
        >
          View My Submissions
        </button>
        <button
          onClick={() => router.push('/pledge')}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700"
        >
          Pledge Another
        </button>
      </div>
    </div>
  );

  const noPledgesContent = (
    <div className="text-center space-y-4">
      <h1 className="font-lovely text-3xl font-bold text-gray-900">No Pledges Found</h1>
      <p className="text-gray-700">
        You need to create a pledge before you can submit a confirmation.
      </p>
      <Link
        href="/pledge"
        className="inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700"
      >
        Pledge First
      </Link>
    </div>
  );

  const formContent = (
    <>
      <div className="text-center space-y-2">
        <h1 className="font-lovely text-3xl sm:text-4xl font-bold text-gray-900 uppercase">Confirm GC Code</h1>
        <p className="text-gray-600">
          Link your published cache to one of your pledges.
        </p>
      </div>

      {isPastDeadline && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          <p className="font-semibold">Heads up:</p>
          <p>Geocaching.com submissions have closed. You can still log your IRC confirmation here.</p>
        </div>
      )}

      {error && error !== 'no-pledges' && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {error === 'no-pledges' ? (
        noPledgesContent
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pledgeId" className="block text-sm font-medium text-gray-800 mb-1">
              Select Pledge *
            </label>
            <select
              id="pledgeId"
              required
              value={selectedPledgeId}
              onChange={(e) => setSelectedPledgeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            >
              <option value="">Select a pledge</option>
              {pledges.map((pledge) => (
                <option key={pledge.id} value={pledge.id}>
                  {pledge.title || `Pledge - ${pledge.approxSuburb}, ${pledge.approxState}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gcCode" className="block text-sm font-medium text-gray-800 mb-1">
              GC Code *
            </label>
            <input
              type="text"
              id="gcCode"
              required
              value={formData.gcCode}
              onChange={(e) => setFormData({ ...formData, gcCode: e.target.value.toUpperCase() })}
              placeholder="GCXXXXX"
              pattern="^GC[A-Z0-9]+$"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            />
          </div>

          <div>
            <label htmlFor="cacheName" className="block text-sm font-medium text-gray-800 mb-1">
              Cache Name *
            </label>
            <input
              type="text"
              id="cacheName"
              required
              value={formData.cacheName}
              onChange={(e) => setFormData({ ...formData, cacheName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-800 mb-1">
                Type *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                <option value="">Select type</option>
                {CACHE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {cacheTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hiddenDate" className="block text-sm font-medium text-gray-800 mb-1">
                Hidden Date *
              </label>
              <input
                type="date"
                id="hiddenDate"
                required
                value={formData.hiddenDate}
                onChange={(e) => setFormData({ ...formData, hiddenDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-800 mb-1">
                Difficulty (D) *
              </label>
              <select
                id="difficulty"
                required
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                {DIFFICULTY_RATINGS.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="terrain" className="block text-sm font-medium text-gray-800 mb-1">
                Terrain (T) *
              </label>
              <select
                id="terrain"
                required
                value={formData.terrain}
                onChange={(e) => setFormData({ ...formData, terrain: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                {TERRAIN_RATINGS.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="suburb" className="block text-sm font-medium text-gray-800 mb-1">
                Suburb / Region *
              </label>
              <input
                type="text"
                id="suburb"
                required
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-800 mb-1">
                State *
              </label>
              <select
                id="state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                <option value="">Select state</option>
                {AU_STATES.map((state) => (
                  <option key={state} value={state}>
                    {stateLabels[state]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-800 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              placeholder="Additional notes about your cache..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-secondary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Confirm Cache'}
            </button>
          </div>
        </form>
      )}
    </>
  );

  return (
    <RequireAuth>
      <main
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/pledge_page_1.jpeg')" }}
      >
        <div className="min-h-screen bg-black/60">
          <div className="relative z-10 flex justify-center items-start py-16 px-4">
            <Card className="w-full max-w-3xl">
              {success ? successContent : formContent}
            </Card>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}

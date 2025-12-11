'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CACHE_TYPES, CACHE_SIZES, AU_STATES, DIFFICULTY_RATINGS, TERRAIN_RATINGS } from '@/config/irc26';

interface Pledge {
  id: string;
  pledgedCount: number;
  cacheTypes: string[];
  cacheSizes: string[];
  states: string[];
  approxLocations: string[];
  ideaNotes: string | null;
  createdAt: string;
}

interface Confirmation {
  id: string;
  gcCode: string;
  cacheName: string;
  type: string;
  size: string;
  difficulty: number;
  terrain: number;
  suburb: string;
  state: string;
  notes: string | null;
  createdAt: string;
}

function ManageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; gcUsername?: string } | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [editingPledge, setEditingPledge] = useState<string | null>(null);
  const [editingConfirmation, setEditingConfirmation] = useState<string | null>(null);
  const [requestingLink, setRequestingLink] = useState(false);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError('No token provided');
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/manage?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setUser(data.user);
      setPledges(data.pledges);
      setConfirmations(data.confirmations);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRequestingLink(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('/api/edit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      alert('Magic link sent! Check your email.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRequestingLink(false);
    }
  };

  const handleDeletePledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pledge?')) return;

    try {
      const response = await fetch(`/api/manage/pledge/${id}?token=${token}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pledge');
      }

      setPledges(pledges.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteConfirmation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this confirmation?')) return;

    try {
      const response = await fetch(`/api/manage/confirmation/${id}?token=${token}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete confirmation');
      }

      setConfirmations(confirmations.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && error.includes('Invalid or expired')) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Invalid or Expired Token</h2>
          <p className="text-red-700 mb-6">
            Your magic link is invalid or has expired. Please request a new one.
          </p>
          <form onSubmit={handleRequestNewLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={requestingLink}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
            >
              {requestingLink ? 'Sending...' : 'Send New Magic Link'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Manage Your IRC26 Entries
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Welcome, {user?.gcUsername}! Manage your pledges and confirmed caches below.
      </p>

      {/* Pledges Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Pledges</h2>
        {pledges.length === 0 ? (
          <p className="text-gray-600">You haven&apos;t made any pledges yet.</p>
        ) : (
          <div className="space-y-4">
            {pledges.map((pledge) => (
              <div key={pledge.id} className="bg-white rounded-lg shadow-md p-6">
                {editingPledge === pledge.id ? (
                  <EditPledgeForm
                    pledge={pledge}
                    token={token!}
                    onSave={() => {
                      setEditingPledge(null);
                      fetchData();
                    }}
                    onCancel={() => setEditingPledge(null)}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {pledge.pledgedCount} cache(s) pledged
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(pledge.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPledge(pledge.id)}
                          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePledge(pledge.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Types:</strong> {pledge.cacheTypes.join(', ')}
                      </div>
                      <div>
                        <strong>Sizes:</strong> {pledge.cacheSizes.join(', ')}
                      </div>
                      <div>
                        <strong>States:</strong> {pledge.states.join(', ')}
                      </div>
                      {pledge.approxLocations.length > 0 && (
                        <div>
                          <strong>Locations:</strong> {pledge.approxLocations.join(', ')}
                        </div>
                      )}
                      {pledge.ideaNotes && (
                        <div className="md:col-span-2">
                          <strong>Notes:</strong> {pledge.ideaNotes}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmations Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Confirmed Caches</h2>
        {confirmations.length === 0 ? (
          <p className="text-gray-600">You haven&apos;t confirmed any caches yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GC Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">D/T</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {confirmations.map((confirmation) => (
                  <tr key={confirmation.id}>
                    {editingConfirmation === confirmation.id ? (
                      <td colSpan={7} className="px-6 py-4">
                        <EditConfirmationForm
                          confirmation={confirmation}
                          token={token!}
                          onSave={() => {
                            setEditingConfirmation(null);
                            fetchData();
                          }}
                          onCancel={() => setEditingConfirmation(null)}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{confirmation.gcCode}</td>
                        <td className="px-6 py-4 text-sm">{confirmation.cacheName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{confirmation.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{confirmation.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{confirmation.difficulty}/{confirmation.terrain}</td>
                        <td className="px-6 py-4 text-sm">{confirmation.suburb}, {confirmation.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setEditingConfirmation(confirmation.id)}
                            className="text-primary-600 hover:text-primary-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(confirmation.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function EditPledgeForm({ pledge, token, onSave, onCancel }: { pledge: Pledge; token: string; onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    ...pledge,
    approxLocations: pledge.approxLocations.length > 0 ? pledge.approxLocations : [''],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/manage/pledge/${pledge.id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgedCount: formData.pledgedCount,
          cacheTypes: formData.cacheTypes,
          cacheSizes: formData.cacheSizes,
          states: formData.states,
          approxLocations: formData.approxLocations.filter((loc) => loc.trim() !== ''),
          ideaNotes: formData.ideaNotes || null,
          photoUrls: [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pledge');
      }

      onSave();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded">
      <div>
        <label className="block text-sm font-medium mb-1">Pledged Count *</label>
        <input
          type="number"
          min="1"
          value={formData.pledgedCount}
          onChange={(e) => setFormData({ ...formData, pledgedCount: parseInt(e.target.value) || 1 })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Cache Types *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CACHE_TYPES.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cacheTypes.includes(type)}
                onChange={() => setFormData({ ...formData, cacheTypes: toggleArrayItem(formData.cacheTypes, type) })}
                className="mr-2"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Cache Sizes *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CACHE_SIZES.map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cacheSizes.includes(size)}
                onChange={() => setFormData({ ...formData, cacheSizes: toggleArrayItem(formData.cacheSizes, size) })}
                className="mr-2"
              />
              <span className="text-sm">{size}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">States *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AU_STATES.map((state) => (
            <label key={state} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.states.includes(state)}
                onChange={() => setFormData({ ...formData, states: toggleArrayItem(formData.states, state) })}
                className="mr-2"
              />
              <span className="text-sm">{state}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Approximate Locations</label>
        {formData.approxLocations.map((loc, index) => (
          <input
            key={index}
            type="text"
            value={loc}
            onChange={(e) => {
              const newLocs = [...formData.approxLocations];
              newLocs[index] = e.target.value;
              setFormData({ ...formData, approxLocations: newLocs });
            }}
            placeholder="e.g., Sydney CBD"
            className="w-full px-3 py-2 border rounded mb-2"
          />
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, approxLocations: [...formData.approxLocations, ''] })}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          + Add location
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Idea / Theme Notes</label>
        <textarea
          value={formData.ideaNotes || ''}
          onChange={(e) => setFormData({ ...formData, ideaNotes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving || formData.cacheTypes.length === 0 || formData.cacheSizes.length === 0 || formData.states.length === 0} className="bg-primary-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditConfirmationForm({ confirmation, token, onSave, onCancel }: { confirmation: Confirmation; token: string; onSave: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState(confirmation);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/manage/confirmation/${confirmation.id}?token=${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gcCode: formData.gcCode,
          cacheName: formData.cacheName,
          type: formData.type,
          size: formData.size,
          difficulty: formData.difficulty,
          terrain: formData.terrain,
          suburb: formData.suburb,
          state: formData.state,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update confirmation');
      }

      onSave();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">GC Code *</label>
          <input
            type="text"
            value={formData.gcCode}
            onChange={(e) => setFormData({ ...formData, gcCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border rounded"
            required
            pattern="^GC[A-Z0-9]+$"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cache Name *</label>
          <input
            type="text"
            value={formData.cacheName}
            onChange={(e) => setFormData({ ...formData, cacheName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {CACHE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Size *</label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {CACHE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty (D) *</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {DIFFICULTY_RATINGS.map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Terrain (T) *</label>
          <select
            value={formData.terrain}
            onChange={(e) => setFormData({ ...formData, terrain: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border rounded"
            required
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
          <label className="block text-sm font-medium mb-1">Suburb / Region *</label>
          <input
            type="text"
            value={formData.suburb}
            onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {AU_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <ManageContent />
    </Suspense>
  );
}


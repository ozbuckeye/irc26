'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CACHE_TYPES, AU_STATES, DIFFICULTY_RATINGS, TERRAIN_RATINGS } from '@/config/irc26';
import RequireAuth from '@/components/RequireAuth';
import Card from '@/components/Card';
import { UploadButton } from '@/app/api/uploadthing/components';

type ImageData = {
  url: string;
  key: string;
  width?: number;
  height?: number;
};

export default function EditSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    images: [] as ImageData[],
  });

  useEffect(() => {
    fetch(`/api/submissions/${submissionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submission) {
          const submission = data.submission;
          const hiddenDate = new Date(submission.hiddenDate);
          
          // Parse images - handle JSON string or array
          let images: ImageData[] = [];
          if (submission.images) {
            if (Array.isArray(submission.images)) {
              images = submission.images;
            } else if (typeof submission.images === 'string') {
              try {
                const parsed = JSON.parse(submission.images);
                images = Array.isArray(parsed) ? parsed : [];
              } catch {
                images = [];
              }
            }
          }
          
          setFormData({
            gcCode: submission.gcCode,
            cacheName: submission.cacheName,
            suburb: submission.suburb,
            state: submission.state,
            difficulty: submission.difficulty,
            terrain: submission.terrain,
            type: submission.type,
            hiddenDate: hiddenDate.toISOString().split('T')[0],
            notes: submission.notes || '',
            images: images,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load submission');
        setLoading(false);
      });
  }, [submissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hiddenDate: new Date(formData.hiddenDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update submission');
      }

      router.push('/account');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  const handleImageUpload = (res: { url: string; key: string; width?: number; height?: number }[]) => {
    setUploadingImage(false); // Image has appeared
    if (res && Array.isArray(res)) {
      const newImages = res.map((file) => ({
        url: file.url,
        key: file.key,
        width: file.width,
        height: file.height,
      }));
      setFormData({ ...formData, images: [...formData.images, ...newImages].slice(0, 3) });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
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
        style={{ backgroundImage: "url('/pledge_page_1.jpeg')" }}
      >
        <div className="min-h-screen bg-black/60">
          <div className="relative z-10 flex justify-center items-start py-16 px-4">
            <Card className="w-full max-w-3xl">
              <div className="text-center space-y-2 mb-6">
                <h1 className="font-lovely text-3xl sm:text-4xl font-bold text-gray-900">Edit Submission</h1>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Photos (Maximum 3)
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.images.length < 3 && (
                    <div>
                      <UploadButton
                        endpoint="submissionImages"
                        onUploadBegin={() => {
                          setUploadingImage(true);
                        }}
                        onClientUploadComplete={handleImageUpload}
                        onUploadError={(error: Error) => {
                          setUploadingImage(false);
                          setError(`Upload failed: ${error.message}`);
                        }}
                        className="ut-button:bg-secondary-600 ut-button:ut-readying:bg-secondary-400 ut-button:ut-uploading:bg-secondary-500"
                      />
                      {uploadingImage && (
                        <p className="text-sm text-blue-600 mt-2 italic">
                          ⏳ Please wait until the image appears on the page before submitting...
                        </p>
                      )}
                    </div>
                  )}
                  {formData.images.length >= 3 && (
                    <p className="text-sm text-gray-600 mt-2">Maximum 3 photos reached. Remove a photo to add another.</p>
                  )}
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-secondary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-secondary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/account')}
                    className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}




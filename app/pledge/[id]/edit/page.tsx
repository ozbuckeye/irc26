'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CACHE_TYPES, CACHE_SIZES, AU_STATES } from '@/config/irc26';
import RequireAuth from '@/components/RequireAuth';
import Card from '@/components/Card';
import { UploadButton } from '@/app/api/uploadthing/components';

type ImageData = {
  url: string;
  key: string;
  width?: number;
  height?: number;
};

export default function EditPledgePage() {
  const router = useRouter();
  const params = useParams();
  const pledgeId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    gcUsername: '',
    title: '',
    cacheType: '' as '' | 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL',
    cacheSize: '' as '' | 'NANO' | 'MICRO' | 'SMALL' | 'REGULAR' | 'LARGE' | 'OTHER',
    approxSuburb: '',
    approxState: '' as '' | 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA',
    conceptNotes: '',
    images: [] as ImageData[],
  });

  useEffect(() => {
    fetch(`/api/pledges/${pledgeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pledge) {
          const pledge = data.pledge;
          
          // Parse images - handle JSON string or array
          let images: ImageData[] = [];
          if (pledge.images) {
            if (Array.isArray(pledge.images)) {
              images = pledge.images;
            } else if (typeof pledge.images === 'string') {
              try {
                const parsed = JSON.parse(pledge.images);
                images = Array.isArray(parsed) ? parsed : [];
              } catch {
                images = [];
              }
            }
          }
          
          setFormData({
            gcUsername: pledge.gcUsername,
            title: pledge.title || '',
            cacheType: pledge.cacheType,
            cacheSize: pledge.cacheSize,
            approxSuburb: pledge.approxSuburb,
            approxState: pledge.approxState,
            conceptNotes: pledge.conceptNotes || '',
            images: images,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load pledge');
        setLoading(false);
      });
  }, [pledgeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/pledges/${pledgeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update pledge');
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleImageUpload = (res: any) => {
    setUploadingImage(false); // Image has appeared
    if (res && Array.isArray(res)) {
      const newImages = res.map((file: any) => ({
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

  const cacheSizeLabels: Record<string, string> = {
    NANO: 'Nano',
    MICRO: 'Micro',
    SMALL: 'Small',
    REGULAR: 'Regular',
    LARGE: 'Large',
    OTHER: 'Other',
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
        style={{ backgroundImage: "url('/IRC_background_1.jpeg')" }}
      >
        <div className="min-h-screen bg-black/60">
          <div className="relative z-10 flex justify-center items-start py-16 px-4">
            <Card className="w-full max-w-3xl">
              <div className="text-center space-y-2 mb-6">
                <h1 className="font-lovely text-3xl sm:text-4xl font-bold text-gray-900">Edit Pledge</h1>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="gcUsername" className="block text-sm font-medium text-gray-800 mb-1">
                    Geocaching Username *
                  </label>
                  <input
                    type="text"
                    id="gcUsername"
                    required
                    value={formData.gcUsername}
                    onChange={(e) => setFormData({ ...formData, gcUsername: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-1">
                    Cache Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cacheType" className="block text-sm font-medium text-gray-800 mb-1">
                      Cache Type *
                    </label>
                    <select
                      id="cacheType"
                      required
                      value={formData.cacheType}
                      onChange={(e) => setFormData({ ...formData, cacheType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    <label htmlFor="cacheSize" className="block text-sm font-medium text-gray-800 mb-1">
                      Cache Size *
                    </label>
                    <select
                      id="cacheSize"
                      required
                      value={formData.cacheSize}
                      onChange={(e) => setFormData({ ...formData, cacheSize: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select size</option>
                      {CACHE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {cacheSizeLabels[size]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="approxSuburb" className="block text-sm font-medium text-gray-800 mb-1">
                      Approximate Suburb *
                    </label>
                    <input
                      type="text"
                      id="approxSuburb"
                      required
                      value={formData.approxSuburb}
                      onChange={(e) => setFormData({ ...formData, approxSuburb: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="approxState" className="block text-sm font-medium text-gray-800 mb-1">
                      State *
                    </label>
                    <select
                      id="approxState"
                      required
                      value={formData.approxState}
                      onChange={(e) => setFormData({ ...formData, approxState: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  <label htmlFor="conceptNotes" className="block text-sm font-medium text-gray-800 mb-1">
                    Concept Notes (Optional)
                  </label>
                  <textarea
                    id="conceptNotes"
                    rows={4}
                    value={formData.conceptNotes}
                    onChange={(e) => setFormData({ ...formData, conceptNotes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Images (Optional, max 3)
                  </label>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative">
                          <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.images.length < 3 && (
                    <div>
                      <UploadButton
                        endpoint="pledgeImages"
                        onUploadBegin={() => {
                          setUploadingImage(true);
                        }}
                        onClientUploadComplete={handleImageUpload}
                        onUploadError={(error: Error) => {
                          setUploadingImage(false);
                          setError(`Upload failed: ${error.message}`);
                        }}
                      />
                      {uploadingImage && (
                        <p className="text-sm text-blue-600 mt-2 italic">
                          ⏳ Please wait until the image appears on the page before submitting...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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




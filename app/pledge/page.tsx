'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CACHE_TYPES, CACHE_SIZES, AU_STATES } from '@/config/irc26';
import RequireAuth from '@/components/RequireAuth';
import { UploadButton } from '@/app/api/uploadthing/components';
import Card from '@/components/Card';

type ImageData = {
  url: string;
  key: string;
  width?: number;
  height?: number;
};

export default function PledgePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [gcUsername, setGcUsername] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    cacheType: '' as '' | 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL',
    cacheSize: '' as '' | 'NANO' | 'MICRO' | 'SMALL' | 'REGULAR' | 'LARGE' | 'OTHER',
    approxSuburb: '',
    approxState: '' as '' | 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA',
    conceptNotes: '',
    images: [] as ImageData[],
  });

  // Load user's gcUsername if available
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.gcUsername) {
            setGcUsername(data.user.gcUsername);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!gcUsername.trim()) {
      setError('Geocaching username is required');
      setLoading(false);
      return;
    }

    if (!formData.cacheType || !formData.cacheSize || !formData.approxSuburb || !formData.approxState) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gcUsername: gcUsername.trim(),
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create pledge');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
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

  const successContent = (
    <div className="text-center space-y-4">
      <h1 className="font-lovely text-3xl font-bold text-green-700">Pledge Submitted Successfully!</h1>
      <p className="text-gray-700">
        Thank you for your pledge! We&apos;ve sent a confirmation email to your address.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({
              title: '',
              cacheType: '',
              cacheSize: '',
              approxSuburb: '',
              approxState: '',
              conceptNotes: '',
              images: [],
            });
          }}
          className="bg-primary-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary-700"
        >
          Pledge Another
        </button>
        <button
          onClick={() => router.push('/account')}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700"
        >
          View My Pledges
        </button>
      </div>
    </div>
  );

  const formContent = (
    <>
      <div className="text-center space-y-2">
        <h1 className="font-lovely text-3xl sm:text-4xl font-bold text-gray-900">Pledge Your Cache</h1>
        <p className="text-gray-600">
          Share your cache idea for IRC26. You can create multiple pledges.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
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
            value={gcUsername}
            onChange={(e) => setGcUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Your geocaching.com username"
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
            placeholder="e.g., My Amazing Cache"
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
              onChange={(e) => setFormData({ ...formData, cacheType: e.target.value as 'TRADITIONAL' | 'MULTI' | 'MYSTERY' | 'LETTERBOX' | 'WHERIGO' | 'VIRTUAL' })}
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
              onChange={(e) => setFormData({ ...formData, cacheSize: e.target.value as 'NANO' | 'MICRO' | 'SMALL' | 'REGULAR' | 'LARGE' | 'OTHER' })}
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
              placeholder="e.g., Sydney CBD"
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
              onChange={(e) => setFormData({ ...formData, approxState: e.target.value as 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' })}
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
            placeholder="Share your ideas, themes, or plans for this cache..."
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Save and Pledge Another'}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <RequireAuth>
      <main
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/IRC_background_1.jpeg')" }}
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

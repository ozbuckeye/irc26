'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDate } from '@/lib/date-utils';
import type { AdminImageItem } from '@/lib/admin-images';

type ImageGalleryProps = {
  images: AdminImageItem[];
};

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<AdminImageItem | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  if (images.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-lovely">Image Gallery</h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-sm text-gray-500">
            No images have been uploaded yet. Once Rainmakers start adding photos to pledges and submissions, they&apos;ll appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 font-lovely">Image Gallery</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, index) => (
            <button
              key={`${img.source}-${img.id}-${img.url}-${index}`}
              type="button"
              className="group relative overflow-hidden rounded-xl bg-black/10 hover:bg-black/20 transition"
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={img.url}
                  alt={`${img.label} by ${img.gcUsername}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>
              <div className="p-2 text-xs bg-black/60 text-white absolute bottom-0 left-0 right-0">
                <div className="font-semibold truncate">{img.label}</div>
                <div className="text-[11px] opacity-90 truncate">
                  @{img.gcUsername} • {img.source === "pledge" ? "Pledge" : "Submission"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full mx-4 overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="aspect-[4/3] relative bg-black">
                <Image
                  src={selectedImage.url}
                  alt={`${selectedImage.label} by ${selectedImage.gcUsername}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-3 py-1 text-xs hover:bg-black/80 transition"
              >
                Close
              </button>
            </div>
            <div className="p-4 text-sm">
              <div className="font-semibold text-base mb-1 font-lovely">
                {selectedImage.label}
              </div>
              <div className="text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold">Rainmaker:</span> @{selectedImage.gcUsername}
                </p>
                <p>
                  <span className="font-semibold">Attached to:</span> {selectedImage.source === "pledge" ? "Pledge" : "Submission"}
                </p>
                <p>
                  <span className="font-semibold">Created:</span> {formatDate(selectedImage.createdAt, 'hA DD MMM YYYY')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



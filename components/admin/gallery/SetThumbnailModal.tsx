'use client';

import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { GalleryAlbum, GalleryImage } from '@/lib/types/gallery';
import { galleryPosterUrl } from '@/lib/gallery-media';

interface SetThumbnailModalProps {
  album: GalleryAlbum;
  images: GalleryImage[];
  onClose: () => void;
}

export default function SetThumbnailModal({ album, images, onClose }: SetThumbnailModalProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(album.thumbnail_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!selectedImageUrl) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/gallery/albums/${album.id}/thumbnail`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: selectedImageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cover updated successfully!' });
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#3d2370] rounded-xl p-6 max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Set album cover</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-purple-200 mb-6">Select an image to use as the cover for "{album.name}"</p>

        {images.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            <p>No images available in this album</p>
            <p className="text-sm mt-2">Upload some images first</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-6">
              {images.map((image) => {
                const posterUrl = galleryPosterUrl(image.image_url);
                return (
                <div
                  key={image.id}
                  onClick={() => setSelectedImageUrl(posterUrl)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border transition-colors ${
                    selectedImageUrl === posterUrl
                      ? 'border-yellow-500 ring-2 ring-yellow-500'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img
                    src={posterUrl}
                    alt={image.caption || 'Image'}
                    className="w-full h-24 object-cover"
                  />
                  {selectedImageUrl === posterUrl && (
                    <div className="absolute inset-0 bg-yellow-500/30 flex items-center justify-center">
                      <Star size={32} className="text-yellow-300 fill-current" />
                    </div>
                  )}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-white text-xs truncate">
                      {image.caption}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* Preview */}
            {selectedImageUrl && (
              <div className="mb-6 p-4 bg-white/10 rounded-lg">
                <p className="text-white font-semibold mb-3">Selected cover preview:</p>
                <img
                  src={selectedImageUrl}
                  alt="Selected thumbnail"
                  className="w-48 h-48 object-cover rounded-lg border border-yellow-500 mx-auto"
                />
              </div>
            )}

            {message && (
              <div
                className={`mb-4 flex items-center gap-2 p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedImageUrl}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Star size={18} />
                    Set as cover
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

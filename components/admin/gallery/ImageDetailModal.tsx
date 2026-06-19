'use client';

import React, { useState } from 'react';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { GalleryImage } from '@/lib/types/gallery';
import { galleryPosterUrl } from '@/lib/gallery-media';

interface ImageDetailModalProps {
  image: GalleryImage;
  onClose: () => void;
}

export default function ImageDetailModal({ image, onClose }: ImageDetailModalProps) {
  const [formData, setFormData] = useState({
    caption: image.caption || '',
    display_order: image.display_order,
    is_active: image.is_active,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'display_order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/gallery/images/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Image updated successfully!' });
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
      <div className="bg-[#3d2370] rounded-xl p-6 max-w-2xl w-full border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Image</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Preview */}
        <div className="mb-6">
          <img
            src={galleryPosterUrl(image.image_url)}
            alt={image.caption || 'Image'}
            className="w-full h-64 object-cover rounded-lg border border-white/20"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Caption</label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              placeholder="Add a caption for this image..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Display Order</label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              />
              <p className="text-xs text-white/50 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Status</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 border border-white/30 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="text-white">Active</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-white/70 text-sm mb-1"><strong>Image URL:</strong></p>
            <p className="text-white/50 text-xs break-all">{image.image_url}</p>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

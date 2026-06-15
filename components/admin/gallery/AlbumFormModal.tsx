'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { GalleryAlbum } from '@/lib/types/gallery';

interface AlbumFormModalProps {
  mode: 'create' | 'edit';
  album?: GalleryAlbum;
  onClose: () => void;
}

export default function AlbumFormModal({ mode, album, onClose }: AlbumFormModalProps) {
  const [formData, setFormData] = useState({
    name: album?.name || '',
    slug: album?.slug || '',
    description: album?.description || '',
    drive_folder_id: album?.drive_folder_id || '',
    display_order: album?.display_order ?? 0,
    is_active: album?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

      // Auto-generate slug from name
      if (name === 'name' && mode === 'create') {
        const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = mode === 'create'
        ? '/api/admin/gallery/albums'
        : `/api/admin/gallery/albums/${album!.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: mode === 'create' ? 'Album created successfully!' : 'Album updated successfully!',
        });
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Operation failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${album?.name}"? This will also delete all images in this album.`)) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/gallery/albums/${album!.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Album deleted successfully!' });
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Delete failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create New Album' : `Edit Album: ${album?.name}`}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Album Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              placeholder="e.g., Group Photos"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Slug * (URL-friendly)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              placeholder="e.g., group-photos"
            />
            <p className="text-xs text-white/50 mt-1">Used in URLs. Only lowercase letters, numbers, and hyphens.</p>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              placeholder="Brief description of this album"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Google Drive Folder ID</label>
            <input
              type="text"
              name="drive_folder_id"
              value={formData.drive_folder_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none font-mono text-sm"
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            />
            <p className="text-xs text-white/50 mt-1">
              From the Drive folder URL: drive.google.com/drive/folders/<strong className="text-white/70">FOLDER_ID</strong>
            </p>
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
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} />
                  {mode === 'create' ? 'Create Album' : 'Save Changes'}
                </>
              )}
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

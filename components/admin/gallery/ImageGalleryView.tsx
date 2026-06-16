'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Edit2, Trash2, Star, RefreshCw, GripVertical, CheckSquare, Square, X, CloudDownload } from 'lucide-react';
import { GalleryAlbum, GalleryImage } from '@/lib/types/gallery';
import ImageDetailModal from './ImageDetailModal';
import SetThumbnailModal from './SetThumbnailModal';

interface ImageGalleryViewProps {
  album: GalleryAlbum;
  onUpdate: () => void;
}

export default function ImageGalleryView({ album, onUpdate }: ImageGalleryViewProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchImages();
  }, [album.id]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/gallery/images?album_id=${album.id}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
  };

  const handleDelete = async (image: GalleryImage) => {
    const caption = image.caption ? `"${image.caption}"` : 'this image';
    if (!confirm(`Delete ${caption}?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingImageId(image.id);

    try {
      const response = await fetch(`/api/admin/gallery/images/${image.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchImages();
        onUpdate();
      } else {
        const result = await response.json();
        alert(`Delete failed: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (error: any) {
      alert(`Error deleting image: ${error.message}`);
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    setReordering(true);

    // Update display_order for all images
    const updates = images.map((img, index) => ({
      id: img.id,
      display_order: index,
    }));

    try {
      const response = await fetch('/api/admin/gallery/images/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        fetchImages();
      } else {
        alert('Failed to save new order');
        fetchImages(); // Reload to reset order
      }
    } catch (error) {
      alert('Error saving order');
      fetchImages();
    } finally {
      setDraggedIndex(null);
      setReordering(false);
    }
  };

  // Selection mode handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedImages(new Set());
  };

  const toggleImageSelection = (imageId: number) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  const selectAllImages = () => {
    const allImageIds = new Set(images.map(img => img.id));
    setSelectedImages(allImageIds);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const handleBulkDelete = async () => {
    const count = selectedImages.size;
    if (count === 0) return;

    if (!confirm(`Delete ${count} selected image${count !== 1 ? 's' : ''}? This cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);

    try {
      const response = await fetch('/api/admin/gallery/images/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_ids: Array.from(selectedImages) }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || `Successfully deleted ${result.deleted_count} image(s)`);
        setSelectedImages(new Set());
        setSelectionMode(false);
        fetchImages();
        onUpdate();
      } else {
        const errorMsg = result.error || 'Failed to delete images';
        const details = result.errors ? `\n\nDetails:\n${result.errors.join('\n')}` : '';
        alert(`${errorMsg}${details}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSyncFromDrive = async () => {
    setSyncingDrive(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/gallery/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album_id: album.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult({ type: 'success', text: data.message });
        if (data.synced > 0) {
          fetchImages();
          onUpdate();
        }
      } else {
        setSyncResult({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch (err: any) {
      setSyncResult({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSyncingDrive(false);
    }
  };

  const isAllSelected = images.length > 0 && selectedImages.size === images.length;

  return (
    <div className="bg-neutral-50 rounded-lg p-6 border-2 border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-brand-green">
          Images ({images.length})
        </h3>
        <div className="flex items-center gap-2">
          {!selectionMode ? (
            <>
              {album.drive_folder_id && (
                <button
                  onClick={handleSyncFromDrive}
                  disabled={syncingDrive}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
                >
                  {syncingDrive ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <CloudDownload size={16} />
                  )}
                  {syncingDrive ? 'Syncing…' : 'Sync from Drive'}
                </button>
              )}
              <button
                onClick={toggleSelectionMode}
                disabled={images.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                <CheckSquare size={16} />
                Bulk Actions
              </button>
              <button
                onClick={() => setShowThumbnailModal(true)}
                disabled={images.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                <Star size={16} />
                Set Thumbnail
              </button>
              <button
                onClick={fetchImages}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </>
          ) : (
            <button
              onClick={toggleSelectionMode}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold transition-all"
            >
              <X size={16} />
              Cancel Selection
            </button>
          )}
        </div>
      </div>

      {/* Drive sync result banner */}
      {syncResult && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-between ${
          syncResult.type === 'success'
            ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          <span>{syncResult.text}</span>
          <button onClick={() => setSyncResult(null)} className="ml-3 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Selection mode toolbar */}
      {selectionMode && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={isAllSelected ? clearSelection : selectAllImages}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-neutral-50 text-brand-green border-2 border-neutral-200 text-sm font-semibold transition-all"
              >
                {isAllSelected ? <Square size={16} /> : <CheckSquare size={16} />}
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-brand-green text-sm font-medium">
                {selectedImages.size} of {images.length} selected
              </span>
            </div>

            {selectedImages.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-neutral-50 text-brand-green border-2 border-neutral-200 text-sm font-semibold transition-all"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
                >
                  {bulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Selected ({selectedImages.size})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-brand-green">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <p>Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>No images in this album yet</p>
          <p className="text-sm mt-1">Upload some images to get started</p>
        </div>
      ) : (
        <>
          {reordering && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border-2 border-blue-200">
              Saving new order...
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => {
              const isSelected = selectedImages.has(image.id);
              return (
                <div
                  key={image.id}
                  draggable={!selectionMode}
                  onDragStart={() => !selectionMode && handleDragStart(index)}
                  onDragOver={(e) => !selectionMode && handleDragOver(e, index)}
                  onDragEnd={() => !selectionMode && handleDragEnd()}
                  className={`relative group bg-white rounded-lg overflow-hidden border-2 transition-all ${
                    selectionMode
                      ? isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-blue-400 cursor-pointer'
                      : draggedIndex === index
                        ? 'border-brand-green opacity-50 cursor-move'
                        : 'border-neutral-200 hover:border-brand-green cursor-move'
                  }`}
                  onClick={() => selectionMode && toggleImageSelection(image.id)}
                >
                  {/* Selection Checkbox */}
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-20">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        isSelected ? 'bg-blue-600' : 'bg-white border-2 border-neutral-300'
                      }`}>
                        {isSelected && <CheckSquare size={16} className="text-white" />}
                      </div>
                    </div>
                  )}

                  {/* Drag Handle (only in normal mode) */}
                  {!selectionMode && (
                    <div className="absolute top-2 left-2 z-10 bg-black/50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-white" />
                    </div>
                  )}

                  {/* Order Badge */}
                  <div className="absolute top-2 right-2 z-10 bg-black/70 px-2 py-1 rounded text-white text-xs font-bold">
                    #{index + 1}
                  </div>

                  {/* Image or Video */}
                  {/\.(mp4|mov|webm|avi)$/i.test(image.image_url) ? (
                    <video
                      src={image.image_url}
                      muted
                      playsInline
                      className="w-full h-40 object-cover pointer-events-none"
                    />
                  ) : (
                    <img
                      src={image.image_url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-40 object-cover pointer-events-none"
                    />
                  )}

                  {/* Caption */}
                  {image.caption && (
                    <div className="px-2 py-1 text-white text-xs truncate bg-black/30">
                      {image.caption}
                    </div>
                  )}

                  {/* Actions Overlay (only in normal mode) */}
                  {!selectionMode && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(image);
                        }}
                        disabled={deletingImageId === image.id}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image);
                        }}
                        disabled={deletingImageId === image.id}
                        className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                        title="Delete"
                      >
                        {deletingImageId === image.id ? (
                          <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-white"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Selection Overlay */}
                  {selectionMode && isSelected && (
                    <div className="absolute inset-0 bg-blue-600/30 pointer-events-none" />
                  )}

                  {/* Active Status */}
                  {!image.is_active && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs text-center py-1">
                      Inactive
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!selectionMode && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-200 text-xs">
              <strong>Tip:</strong> Drag and drop images to reorder them. The order will be saved automatically.
            </div>
          )}

          {selectionMode && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-200 text-xs">
              <strong>Selection Mode:</strong> Click on images to select them, then use the "Delete Selected" button to remove multiple images at once.
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {editingImage && (
        <ImageDetailModal
          image={editingImage}
          onClose={() => {
            setEditingImage(null);
            fetchImages();
            onUpdate();
          }}
        />
      )}

      {showThumbnailModal && (
        <SetThumbnailModal
          album={album}
          images={images}
          onClose={() => {
            setShowThumbnailModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

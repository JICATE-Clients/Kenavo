'use client';

import React, { useState } from 'react';
import { FolderOpen, Plus, Image as ImageIcon } from 'lucide-react';
import { GalleryAlbum } from '@/lib/types/gallery';
import AlbumFormModal from './AlbumFormModal';

interface AlbumListProps {
  albums: GalleryAlbum[];
  selectedAlbum: GalleryAlbum | null;
  onSelectAlbum: (album: GalleryAlbum) => void;
  onAlbumUpdate: () => void;
}

export default function AlbumList({
  albums,
  selectedAlbum,
  onSelectAlbum,
  onAlbumUpdate,
}: AlbumListProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    onAlbumUpdate();
  };

  return (
    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4E2E8C]">Albums ({albums.length})</h3>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4E2E8C] hover:bg-[#3F2570] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          New
        </button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {albums.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <FolderOpen size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No albums yet</p>
            <p className="text-xs mt-1">Click "New" to create one</p>
          </div>
        ) : (
          albums.map((album) => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album)}
              className={`p-3 rounded-lg cursor-pointer transition-colors group text-[#4E2E8C] ${
                selectedAlbum?.id === album.id
                  ? 'bg-[#4E2E8C]/8 border border-[#4E2E8C]/20 border-l-2 border-l-[#4E2E8C]'
                  : 'bg-white hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {album.thumbnail_url ? (
                    <img
                      src={album.thumbnail_url}
                      alt={album.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0 border border-neutral-200"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 border ${
                      selectedAlbum?.id === album.id ? 'bg-[#4E2E8C]/10 border-[#4E2E8C]/20' : 'bg-neutral-100 border-neutral-200'
                    }`}>
                      <ImageIcon size={20} className={selectedAlbum?.id === album.id ? 'text-[#4E2E8C]' : 'text-neutral-400'} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{album.name}</p>
                    <p className="text-xs opacity-75 truncate text-neutral-600">
                      {album.description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs opacity-75">
                <span>Order: {album.display_order}</span>
                <span>•</span>
                <span className={album.is_active ? 'text-green-600' : 'text-red-600'}>
                  {album.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create album modal (editing lives on the selected-album header) */}
      {isCreating && (
        <AlbumFormModal
          mode="create"
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

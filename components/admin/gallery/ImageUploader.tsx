'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileArchive, Image as ImageIcon, CheckCircle, AlertCircle, X } from 'lucide-react';
import { GalleryAlbum } from '@/lib/types/gallery';

interface ImageUploaderProps {
  album: GalleryAlbum;
  onUploadComplete: () => void;
}

type UploadMode = 'zip' | 'files';

export default function ImageUploader({ album, onUploadComplete }: ImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<UploadMode>('files');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [progress, setProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setMessage({ type: 'error', text: 'Please select a ZIP file' });
        return;
      }
      setZipFile(file);
      setMessage(null);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
    ];
    const mediaFiles = files.filter(file => allowedTypes.includes(file.type));
    const skipped = files.length - mediaFiles.length;

    setSelectedFiles(mediaFiles);

    // Keep the user informed instead of silently dropping unsupported files.
    if (mediaFiles.length === 0 && files.length > 0) {
      setMessage({
        type: 'error',
        text: 'No supported files selected. Allowed: JPG, PNG, WebP, GIF, MP4, MOV, WebM, AVI.',
      });
    } else if (skipped > 0) {
      setMessage({
        type: 'info',
        text: `Added ${mediaFiles.length} file(s); skipped ${skipped} unsupported file(s).`,
      });
    } else {
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (uploadMode === 'zip' && !zipFile) {
      setMessage({ type: 'error', text: 'Please select a ZIP file' });
      return;
    }

    if (uploadMode === 'files' && selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file' });
      return;
    }

    setUploading(true);
    setMessage(null);
    setProgress('Preparing upload...');

    try {
      const formData = new FormData();
      formData.append('album_id', album.id.toString());
      formData.append('album_slug', album.slug);
      formData.append('upload_type', uploadMode);

      if (uploadMode === 'zip' && zipFile) {
        formData.append('zip_file', zipFile);
        setProgress('Uploading ZIP file...');
      } else if (uploadMode === 'files') {
        selectedFiles.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        setProgress(`Uploading ${selectedFiles.length} file(s)...`);
      }

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Successfully uploaded ${result.uploaded_count} file(s) to "${album.name}"!`,
        });

        // Reset
        setZipFile(null);
        setSelectedFiles([]);
        if (zipInputRef.current) zipInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Trigger refresh
        setTimeout(() => {
          onUploadComplete();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Network error during upload' });
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const clearSelection = () => {
    setZipFile(null);
    setSelectedFiles([]);
    if (zipInputRef.current) zipInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage(null);
  };

  return (
    <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
      <h3 className="text-lg font-bold text-[#4E2E8C] mb-4">Upload Media</h3>

      {/* Upload Mode Selector */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setUploadMode('files');
            clearSelection();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
            uploadMode === 'files'
              ? 'bg-[#4E2E8C] text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <ImageIcon size={18} />
          Multiple Files
        </button>
        <button
          onClick={() => {
            setUploadMode('zip');
            clearSelection();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
            uploadMode === 'zip'
              ? 'bg-[#4E2E8C] text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <FileArchive size={18} />
          ZIP File
        </button>
      </div>

      {/* Upload Interface */}
      {uploadMode === 'zip' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[#4E2E8C] font-semibold mb-2">Select ZIP File</label>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              onChange={handleZipChange}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-lg bg-white text-[#4E2E8C] border border-neutral-200 focus:border-[#4E2E8C] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#4E2E8C] file:text-white file:cursor-pointer hover:file:bg-[#3F2570] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {zipFile && (
              <p className="text-neutral-600 text-sm mt-2 flex items-center gap-2">
                <FileArchive size={16} />
                {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                <button onClick={clearSelection} className="text-red-600 hover:text-red-700 ml-2">
                  <X size={16} />
                </button>
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            ZIP file can contain images (JPG, PNG, WebP, GIF) and videos (MP4, MOV, WebM, AVI). All supported files will be extracted and uploaded to this album.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-[#4E2E8C] font-semibold mb-2">Select Images / Videos</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-msvideo"
              multiple
              onChange={handleFilesChange}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-lg bg-white text-[#4E2E8C] border border-neutral-200 focus:border-[#4E2E8C] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#4E2E8C] file:text-white file:cursor-pointer hover:file:bg-[#3F2570] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#4E2E8C] font-semibold">{selectedFiles.length} file(s) selected</p>
                  <button onClick={clearSelection} className="text-red-600 hover:text-red-700 text-sm">
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('video/') ? (
                        <video
                          src={URL.createObjectURL(file)}
                          muted
                          playsInline
                          className="w-full h-16 object-cover rounded border border-neutral-200"
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-16 object-cover rounded border border-neutral-200"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <p className="text-white text-xs truncate px-1">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-500">
            Select multiple files to upload. Images: JPG, PNG, WebP, GIF (max 5MB each). Videos: MP4, MOV, WebM, AVI (max 50MB each). For large videos, link a Drive folder and use Sync instead.
          </p>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
          {progress}
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={18} />
          ) : message.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || (uploadMode === 'zip' ? !zipFile : selectedFiles.length === 0)}
        className="w-full mt-4 bg-[#4E2E8C] hover:bg-[#3F2570] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Uploading...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload to {album.name}
          </>
        )}
      </button>
    </div>
  );
}

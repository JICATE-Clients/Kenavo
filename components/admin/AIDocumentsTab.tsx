'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Loader2, Sparkles, Tag, FolderOpen } from 'lucide-react';
import type { GeminiDocument, DocumentCategory } from '@/lib/types/database';

export default function AIDocumentsTab() {
  const [documents, setDocuments] = useState<GeminiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Upload form state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('knowledge_base');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [categoryFilter, statusFilter]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        limit: '50',
      });

      const response = await fetch(`/api/admin/gemini/documents?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents);
      } else {
        console.error('Error fetching documents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!displayName) {
        setDisplayName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a display name' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('displayName', displayName);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('description', description);

      const response = await fetch('/api/admin/gemini/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Document upload started!' });
        setUploadModalOpen(false);
        resetForm();
        fetchDocuments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSyncAlumni = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/gemini/sync-alumni', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Alumni sync started! ${data.profileCount} profiles will be uploaded.`,
        });
        fetchDocuments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/gemini/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Document deleted successfully' });
        fetchDocuments();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Delete failed. Please try again.' });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDisplayName('');
    setCategory('knowledge_base');
    setTags('');
    setDescription('');
    setMessage(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-300">
            <CheckCircle size={14} />
            Completed
          </span>
        );
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300">
            <Loader2 size={14} className="animate-spin" />
            Uploading
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-300">
            <XCircle size={14} />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300">
            <Clock size={14} />
            Pending
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      alumni_profiles: 'bg-purple-50 text-purple-700 border border-purple-300',
      knowledge_base: 'bg-blue-50 text-blue-700 border border-blue-300',
      events: 'bg-green-50 text-green-700 border border-green-300',
      newsletters: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
      resources: 'bg-pink-50 text-pink-700 border border-pink-300',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${colors[cat] || 'bg-neutral-100 text-neutral-700 border border-neutral-300'}`}>
        <FolderOpen size={14} />
        {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#4E2E8C] flex items-center gap-2">
          <Sparkles size={20} className="text-[#4E2E8C]" />
          AI Documents
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleSyncAlumni}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4E2E8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2370] disabled:opacity-50 transition-colors"
          >
            {syncing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Sync Alumni
              </>
            )}
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D95164] hover:bg-[#C94154] text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#4E2E8C] mb-1.5">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white text-[#4E2E8C] border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none text-sm cursor-pointer transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="alumni_profiles">Alumni Profiles</option>
            <option value="knowledge_base">Knowledge Base</option>
            <option value="events">Events</option>
            <option value="newsletters">Newsletters</option>
            <option value="resources">Resources</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#4E2E8C] mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white text-[#4E2E8C] border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none text-sm cursor-pointer transition-colors"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="uploading">Uploading</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => fetchDocuments()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#4E2E8C] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2370] transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <Loader2 size={32} className="mx-auto animate-spin text-[#4E2E8C]" />
          <p className="text-neutral-600 mt-4 text-sm font-medium">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <FileText size={40} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-[#4E2E8C] font-semibold text-lg">No documents found</p>
          <p className="text-neutral-600 text-sm mt-2">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#4E2E8C]/5 transition-colors">
                    <td className="px-4 py-3 text-neutral-700">
                      <div>
                        <div className="font-medium text-sm text-neutral-900">{doc.display_name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">{doc.file_name}</div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {doc.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 border border-neutral-300"
                              >
                                <Tag size={10} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{getCategoryBadge(doc.category)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(doc.upload_status)}</td>
                    <td className="px-4 py-3 text-neutral-600 text-xs">
                      {new Date(doc.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-white hover:bg-red-600 transition-colors p-1.5 rounded-lg"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full border border-slate-800 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Upload size={20} className="text-[#4E2E8C]" />
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 text-sm">File *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.doc,.docx,.csv"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-[#4E2E8C] focus:outline-none text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#4E2E8C] file:text-white hover:file:bg-[#5E3E9C] file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 text-sm">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-[#4E2E8C] focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm"
                  placeholder="My Document"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 text-sm">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 focus:border-[#4E2E8C] focus:outline-none text-sm cursor-pointer"
                >
                  <option value="knowledge_base">Knowledge Base</option>
                  <option value="events">Events</option>
                  <option value="newsletters">Newsletters</option>
                  <option value="resources">Resources</option>
                  <option value="alumni_profiles">Alumni Profiles</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 text-sm">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-[#4E2E8C] focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm"
                  placeholder="handbook, 2024, policies"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 text-sm">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-[#4E2E8C] focus:ring-1 focus:ring-purple-500 focus:outline-none text-sm resize-none"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-brand-yellow hover:bg-accent-400 disabled:opacity-50 text-[#4E2E8C] px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

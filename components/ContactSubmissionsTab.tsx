'use client';

import { useState, useEffect } from 'react';
import { ContactSubmission } from '@/lib/types/contact';
import { Mail, Search, Download, Eye, Trash2, Check, X } from 'lucide-react';

export default function ContactSubmissionsTab() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter, searchTerm]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
        _t: Date.now().toString(),
      });

      const response = await fetch(`/api/admin/contact/list?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: status as any });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-50 text-red-700 border border-red-300 font-semibold';
      case 'read': return 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold';
      case 'replied': return 'bg-green-50 text-green-700 border border-green-300 font-semibold';
      case 'archived': return 'bg-neutral-100 text-neutral-700 border border-neutral-300 font-semibold';
      default: return 'bg-neutral-100 text-neutral-700 border border-neutral-300 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#4E2E8C]/20">
        <h2 className="text-2xl font-bold text-[#4E2E8C]">
          Contact Form Submissions ({totalCount} Total)
        </h2>
        <p className="text-neutral-600 text-sm mt-1">Manage and respond to contact form submissions</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-lg text-[#4E2E8C] placeholder-neutral-400 focus:outline-none focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 transition-colors"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[#4E2E8C] focus:outline-none focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 transition-colors cursor-pointer hover:bg-neutral-50"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-200 border-t-[#4E2E8C] mb-4"></div>
          <p className="text-sm font-medium text-neutral-600">Loading...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-sm font-medium text-[#4E2E8C]">No submissions found</p>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Name</th>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Email</th>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Date</th>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Status</th>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Files</th>
                <th className="px-4 py-3 text-left text-[#4E2E8C] font-bold border-b border-purple-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-t border-neutral-200 hover:bg-[#4E2E8C]/5 transition-colors">
                  <td className="px-4 py-3 text-[#4E2E8C] font-medium">{submission.full_name}</td>
                  <td className="px-4 py-3 text-neutral-700">{submission.email}</td>
                  <td className="px-4 py-3 text-neutral-600 text-sm">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 font-medium">
                    {submission.files.length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-1.5 hover:bg-[#4E2E8C]/10 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} className="text-[#4E2E8C]" />
                      </button>
                      <button
                        onClick={() => deleteSubmission(submission.id)}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4E2E8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2370] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="px-5 py-2.5 rounded-lg bg-[#4E2E8C]/5 border border-[#4E2E8C]">
            <span className="text-[#4E2E8C] font-bold text-sm">{page}</span>
            <span className="text-neutral-500 text-sm mx-1.5">/</span>
            <span className="text-[#4E2E8C] text-sm font-semibold">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4E2E8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2370] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#4E2E8C]/20">
              <h3 className="text-2xl font-bold text-[#4E2E8C]">Submission Details</h3>
              <button onClick={() => setSelectedSubmission(null)} className="text-neutral-400 hover:text-[#4E2E8C] transition-all p-2 hover:bg-[#4E2E8C]/10 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[#4E2E8C] font-semibold text-sm mb-1 block">Name:</label>
                <p className="text-neutral-700 font-medium">{selectedSubmission.full_name}</p>
              </div>

              <div>
                <label className="text-[#4E2E8C] font-semibold text-sm mb-1 block">Email:</label>
                <p className="text-neutral-700">{selectedSubmission.email}</p>
              </div>

              <div>
                <label className="text-[#4E2E8C] font-semibold text-sm mb-1 block">Date:</label>
                <p className="text-neutral-600 text-sm">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-[#4E2E8C] font-semibold text-sm mb-2 block">Message:</label>
                <div className="bg-white p-6 rounded-lg border border-[#4E2E8C]">
                  <p className="text-black font-bold whitespace-pre-wrap leading-relaxed text-lg">{selectedSubmission.message}</p>
                </div>
              </div>

              {selectedSubmission.files.length > 0 && (
                <div>
                  <label className="text-[#4E2E8C] font-semibold text-sm mb-2 block">Attachments ({selectedSubmission.files.length}):</label>
                  <div className="space-y-2">
                    {selectedSubmission.files.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#4E2E8C]/20 hover:border-[#4E2E8C] transition-colors">
                        <span className="text-neutral-700 font-medium">{file.name}</span>
                        <a href={file.url} download className="text-[#4E2E8C] hover:text-[#5E3E9C] transition-colors">
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[#4E2E8C] font-semibold text-sm mb-2 block">Status:</label>
                <select
                  value={selectedSubmission.status}
                  onChange={(e) => updateStatus(selectedSubmission.id, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[#4E2E8C] focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none cursor-pointer"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#4E2E8C]/20">
                <button
                  onClick={() => updateStatus(selectedSubmission.id, 'replied')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#4E2E8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2370] transition-colors"
                >
                  Mark as Replied
                </button>
                <button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

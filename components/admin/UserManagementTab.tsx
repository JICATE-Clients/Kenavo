'use client';

import { useState, useEffect } from 'react';
import { AppUser } from '@/lib/types/database';
import { Users, Search, UserPlus, Edit, Trash2, CheckCircle, XCircle, RefreshCw, Shield, User } from 'lucide-react';
import UserFormModal from './UserFormModal';

export default function UserManagementTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        _t: Date.now().toString(),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(undefined);
    setModalOpen(true);
  };

  const handleEditUser = (user: AppUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(undefined);
    fetchUsers(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-300">
          <CheckCircle size={14} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-300">
        <XCircle size={14} />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300">
          <Shield size={14} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
        <User size={14} />
        User
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-200">
        <h2 className="text-2xl font-bold text-[#4E2E8C] flex items-center gap-2 tracking-tight">
          <Users size={28} />
          User Management
        </h2>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4E2E8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2370] transition-colors justify-center"
        >
          <UserPlus size={20} />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-[#4E2E8C] placeholder-neutral-400 border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-3 rounded-lg bg-white text-[#4E2E8C] border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none cursor-pointer transition-colors"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <div className="flex items-center justify-between">
          <p className="text-neutral-700 font-medium">
            Total Users: <span className="text-[#4E2E8C] font-bold text-lg">{totalCount}</span>
          </p>
          <button
            onClick={fetchUsers}
            className="text-[#4E2E8C] hover:text-white hover:bg-[#4E2E8C] transition-colors flex items-center gap-2 font-semibold px-3 py-1.5 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-200 border-t-[#4E2E8C] mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
          <Users size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-[#4E2E8C] text-lg font-semibold">No users found</p>
          <p className="text-neutral-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first user to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Directory Access</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#4E2E8C]/5 transition-colors">
                    <td className="px-6 py-4 text-neutral-900 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#4E2E8C]/10 flex items-center justify-center text-[#4E2E8C] font-semibold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {user.username || <span className="italic text-neutral-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.has_directory_access ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300">
                          <CheckCircle size={14} />
                          Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
                          <XCircle size={14} />
                          Denied
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-[#4E2E8C] hover:text-white hover:bg-[#4E2E8C] transition-colors p-2 rounded-lg"
                          title="Edit user"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 mt-6 border-t border-neutral-200">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-lg bg-white text-[#4E2E8C] text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#4E2E8C] hover:text-white transition-colors border border-neutral-200 hover:border-[#4E2E8C]"
          >
            Previous
          </button>
          <div className="px-5 py-2.5 rounded-lg bg-[#4E2E8C]/5 border border-[#4E2E8C]">
            <span className="text-[#4E2E8C] font-bold text-sm">{page}</span>
            <span className="text-neutral-500 text-sm mx-1.5">/</span>
            <span className="text-[#4E2E8C] text-sm">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2.5 rounded-lg bg-white text-[#4E2E8C] text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#4E2E8C] hover:text-white transition-colors border border-neutral-200 hover:border-[#4E2E8C]"
          >
            Next
          </button>
        </div>
      )}

      {/* User Form Modal */}
      {modalOpen && (
        <UserFormModal
          mode={modalMode}
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

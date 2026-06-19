'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AppUser } from '@/lib/types/database';

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user?: AppUser;
  onClose: () => void;
}

export default function UserFormModal({ mode, user, onClose }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'user',
    has_directory_access: user?.has_directory_access ?? true,
    status: user?.status || 'active',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validation
      if (mode === 'create' && !formData.password) {
        setMessage({ type: 'error', text: 'Password is required for new users' });
        setLoading(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
        setLoading(false);
        return;
      }

      const url = mode === 'create'
        ? '/api/admin/users'
        : `/api/admin/users/${user!.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      // Prepare payload (don't send empty password on edit)
      const payload = { ...formData };
      if (mode === 'edit' && !payload.password) {
        delete (payload as any).password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: mode === 'create' ? 'User created successfully!' : 'User updated successfully!',
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
    if (!confirm(`Are you sure you want to delete user "${user?.email}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${user!.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
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
      <div className="bg-[#3d2370] rounded-xl p-6 max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create New User' : `Edit User: ${user?.email}`}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={mode === 'edit'}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="user@example.com"
            />
            {mode === 'edit' && (
              <p className="text-xs text-white/50 mt-1">Email cannot be changed after creation</p>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Username (Optional)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Password {mode === 'create' ? '*' : '(Leave empty to keep current)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={mode === 'create'}
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white focus:outline-none"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-white focus:outline-none"
            >
              <option value="user" className="bg-purple-900">User (Directory Access Only)</option>
              <option value="admin" className="bg-purple-900">Admin (Full System Access)</option>
            </select>
            <p className="text-xs text-white/50 mt-1">
              {formData.role === 'admin'
                ? 'Admin: Access to admin panel and all features'
                : 'User: Access to directory based on permission'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Directory Access</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 border border-white/30 cursor-pointer">
                <input
                  type="checkbox"
                  name="has_directory_access"
                  checked={formData.has_directory_access}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="text-white">Enabled</span>
              </label>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-white focus:outline-none"
              >
                <option value="active" className="bg-purple-900">Active</option>
                <option value="inactive" className="bg-purple-900">Inactive</option>
              </select>
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
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} />
                  {mode === 'create' ? 'Create User' : 'Save Changes'}
                </>
              )}
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold transition-colors flex items-center gap-2"
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

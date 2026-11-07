import React, { useEffect, useState } from 'react';
import { usersApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Search, Shield, UserCheck, UserX } from 'lucide-react';
import type { User } from '@/types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    usersApi.listAll().then((res) => {
      setUsers(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      await usersApi.toggleActive(userId);
      toast.success(`User account ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch {
      toast.error('Failed to change user status');
    }
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, 'blue' | 'green' | 'purple' | 'yellow'> = {
    student: 'blue',
    teacher: 'green',
    admin: 'purple',
    organizer: 'yellow',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">User Account Directory</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Role assignments and authentication state for all platform users
          </p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                <th className="pb-3">User</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3 text-center">Role</th>
                <th className="pb-3 text-center">Account Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-primary-50/50">
                  <td className="py-3.5 font-bold text-navy-900">{u.full_name}</td>
                  <td className="py-3.5 font-mono text-xs text-gray-500">{u.email}</td>
                  <td className="py-3.5 text-center">
                    <Badge variant={roleColors[u.role] || 'blue'}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-center">
                    <Badge variant={u.is_active ? 'green' : 'red'}>
                      {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id, u.is_active)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        u.is_active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaTrash, FaDownload, FaSearch } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import { getRegisteredUsers } from '@/lib/auth';
import { User } from '@/types/user';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getRegisteredUsers();
    setUsers(allUsers);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ users }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: users.length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-4">
            <FaUsers /> Kullanıcılar
          </h1>
          <p className="text-gray-400 text-lg">Kayıtlı kullanıcıları yönetin</p>
        </div>
        
        <AnimatedButton
          onClick={handleExportJSON}
          className="px-6 py-3"
        >
          <div className="flex items-center gap-2">
            <FaDownload /> JSON İndir
          </div>
        </AnimatedButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-blue-500/20 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Toplam Kullanıcı</div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-green-500/20 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Toplam Sipariş</div>
          <div className="text-4xl font-bold text-green-400">
            {users.reduce((sum, u) => sum + (u.totalOrders || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Kullanıcı ara..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Kullanıcı</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{user.username}</div>
                          {user.totalOrders !== undefined && (
                            <div className="text-xs text-gray-500">
                              {user.totalOrders} sipariş
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-gray-300">{user.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <AnimatedButton
                        onClick={() => handleDelete(user.id)}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700"
                      >
                        <FaTrash />
                      </AnimatedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FaWallet, FaPlus, FaUser } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import { getRegisteredUsers } from '@/lib/auth';
import { addBalance, getUserBalance } from '@/lib/balance';
import { sendNotificationToUser } from '@/lib/automation';

export default function AdminBalancePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setUsers(getRegisteredUsers()); }, []);

  const handleAdd = async () => {
    if (!selectedUser || !amount || Number(amount) <= 0) return;
    await addBalance(selectedUser, Number(amount));

    const user = users.find(u => u.id === selectedUser);
    sendNotificationToUser(selectedUser, {
      type: 'success',
      title: '💰 Bakiye Yüklendi!',
      message: `Hesabınıza $${amount} bakiye yüklendi.`,
    });

    setSuccess(`${user?.username} kullanıcısına $${amount} bakiye yüklendi!`);
    setAmount('');
    setUsers(getRegisteredUsers());
    setTimeout(() => setSuccess(''), 3000);
  };

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";
  const cardCls = "animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-4">
          <FaWallet /> Bakiye Yönetimi
        </h1>
        <p className="text-gray-400 text-lg">Kullanıcılara bakiye yükle</p>
      </div>

      {/* Bakiye Yükle */}
      <div className={cardCls}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaPlus className="text-blue-400" /> Bakiye Yükle
        </h2>

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-semibold">
            ✅ {success}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 mb-2 block">Kullanıcı Seç</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className={inputCls}>
              <option value="">Kullanıcı seçin...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email}) — Bakiye: ${(u.balance ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Miktar ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="100" min={1} className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {[10, 50, 100, 250, 500].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${amount === String(v) ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-zinc-700 text-gray-400 hover:border-zinc-500'}`}>
              ${v}
            </button>
          ))}
        </div>

        <AnimatedButton onClick={handleAdd} className="mt-6 px-8 py-3">
          <div className="flex items-center gap-2"><FaPlus /> Bakiye Yükle</div>
        </AnimatedButton>
      </div>

      {/* Kullanıcı Bakiyeleri */}
      <div className={cardCls}>
        <h2 className="text-xl font-bold mb-6">Kullanıcı Bakiyeleri</h2>
        {users.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Kayıtlı kullanıcı yok</p>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">${(u.balance ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{u.totalOrders ?? 0} sipariş</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

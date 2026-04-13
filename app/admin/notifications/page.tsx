'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBell,
  FaUsers,
  FaUser,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaGift,
  FaShoppingCart,
  FaArrowLeft
} from 'react-icons/fa';
import { isAdminAuthenticated } from '@/lib/auth';
import { getRegisteredUsers } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';

interface NotificationForm {
  type: 'success' | 'warning' | 'info' | 'promo' | 'order';
  title: string;
  message: string;
  target: 'all' | 'specific';
  userId?: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState<NotificationForm>({
    type: 'info',
    title: '',
    message: '',
    target: 'all'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      router.push('/admin/login');
      return;
    }

    const registeredUsers = getRegisteredUsers();
    setUsers(registeredUsers);
    setLoading(false);
  }, [router]);

  const sendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.message) {
      setError('Başlık ve mesaj alanları zorunludur');
      return;
    }

    const notification = {
      id: Date.now().toString(),
      type: form.type,
      title: form.title,
      message: form.message,
      date: new Date().toISOString(),
      read: false
    };

    if (form.target === 'all') {
      // Tüm kullanıcılara gönder
      users.forEach(user => {
        const userNotifications = JSON.parse(
          localStorage.getItem(`notifications_${user.id}`) || '[]'
        );
        userNotifications.unshift(notification);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(userNotifications));
      });
      setSuccess(`Bildirim ${users.length} kullanıcıya başarıyla gönderildi!`);
    } else if (form.userId) {
      // Belirli kullanıcıya gönder
      const userNotifications = JSON.parse(
        localStorage.getItem(`notifications_${form.userId}`) || '[]'
      );
      userNotifications.unshift(notification);
      localStorage.setItem(`notifications_${form.userId}`, JSON.stringify(userNotifications));
      
      const targetUser = users.find(u => u.id === form.userId);
      setSuccess(`Bildirim ${targetUser?.username} kullanıcısına başarıyla gönderildi!`);
    }

    // Formu temizle
    setForm({
      type: 'info',
      title: '',
      message: '',
      target: 'all'
    });

    setTimeout(() => setSuccess(''), 5000);
  };

  const notificationTypes = [
    { value: 'success', label: 'Başarı', icon: FaCheckCircle, color: 'text-green-400' },
    { value: 'warning', label: 'Uyarı', icon: FaExclamationCircle, color: 'text-yellow-400' },
    { value: 'info', label: 'Bilgi', icon: FaInfoCircle, color: 'text-blue-400' },
    { value: 'promo', label: 'Promosyon', icon: FaGift, color: 'text-purple-400' },
    { value: 'order', label: 'Sipariş', icon: FaShoppingCart, color: 'text-cyan-400' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                  <FaArrowLeft className="text-xl" />
                </button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Bildirim Gönder
              </h1>
            </div>
            <Link href="/admin">
              <AnimatedButton className="px-4 py-2 text-sm">
                Admin Panel
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-xl">
                <FaUsers className="text-4xl text-blue-400" />
              </div>
              <div>
                <div className="text-3xl font-bold">{users.length}</div>
                <div className="text-gray-400">Toplam Kullanıcı</div>
              </div>
            </div>
          </div>

          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 rounded-xl">
                <FaBell className="text-4xl text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-bold">Aktif</div>
                <div className="text-gray-400">Bildirim Sistemi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 mb-6 flex items-center gap-3">
            <FaCheckCircle />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 mb-6 flex items-center gap-3">
            <FaExclamationCircle />
            {error}
          </div>
        )}

        {/* Notification Form */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FaPaperPlane className="text-blue-400" />
            Yeni Bildirim Oluştur
          </h2>

          <form onSubmit={sendNotification} className="space-y-6">
            {/* Notification Type */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Bildirim Tipi
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {notificationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        form.type === type.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <IconComponent className={`text-2xl ${type.color} mx-auto mb-2`} />
                      <div className="text-sm font-semibold">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Alıcı
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, target: 'all', userId: undefined })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    form.target === 'all'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                  }`}
                >
                  <FaUsers className="text-2xl text-blue-400" />
                  <div className="text-left">
                    <div className="font-semibold">Tüm Kullanıcılar</div>
                    <div className="text-sm text-gray-400">{users.length} kullanıcı</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, target: 'specific' })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    form.target === 'specific'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                  }`}
                >
                  <FaUser className="text-2xl text-purple-400" />
                  <div className="text-left">
                    <div className="font-semibold">Belirli Kullanıcı</div>
                    <div className="text-sm text-gray-400">Tek kullanıcı seç</div>
                  </div>
                </button>
              </div>
            </div>

            {/* User Selection */}
            {form.target === 'specific' && (
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Kullanıcı Seç
                </label>
                <select
                  value={form.userId || ''}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required={form.target === 'specific'}
                >
                  <option value="">Kullanıcı seçin...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Başlık
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Bildirim başlığı..."
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Mesaj
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
                placeholder="Bildirim mesajı..."
                required
              />
            </div>

            {/* Submit Button */}
            <AnimatedButton type="submit" className="w-full py-4 text-lg font-bold">
              <div className="flex items-center justify-center gap-3">
                <FaPaperPlane />
                Bildirimi Gönder
              </div>
            </AnimatedButton>
          </form>
        </div>

        {/* Quick Templates */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">Hızlı Şablonlar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setForm({
                ...form,
                type: 'promo',
                title: 'Özel İndirim!',
                message: 'Bugün tüm ürünlerde %20 indirim! Fırsatı kaçırmayın.'
              })}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold mb-1">İndirim Bildirimi</div>
              <div className="text-sm text-gray-400">Promosyon duyurusu</div>
            </button>

            <button
              onClick={() => setForm({
                ...form,
                type: 'info',
                title: 'Yeni Ürünler Eklendi',
                message: 'Mağazamıza yeni ürünler eklendi. Hemen inceleyin!'
              })}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold mb-1">Yeni Ürün Bildirimi</div>
              <div className="text-sm text-gray-400">Ürün duyurusu</div>
            </button>

            <button
              onClick={() => setForm({
                ...form,
                type: 'success',
                title: 'Siparişiniz Tamamlandı',
                message: 'Siparişiniz başarıyla teslim edildi. İyi oyunlar!'
              })}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold mb-1">Sipariş Tamamlandı</div>
              <div className="text-sm text-gray-400">Başarı mesajı</div>
            </button>

            <button
              onClick={() => setForm({
                ...form,
                type: 'warning',
                title: 'Bakiye Uyarısı',
                message: 'Bakiyeniz düşük. Alışverişe devam etmek için bakiye yükleyin.'
              })}
              className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-left transition-colors"
            >
              <div className="font-semibold mb-1">Bakiye Uyarısı</div>
              <div className="text-sm text-gray-400">Uyarı mesajı</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

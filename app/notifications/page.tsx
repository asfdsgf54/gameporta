'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaGift,
  FaShoppingCart,
  FaTrash,
  FaEnvelope,
  FaEnvelopeOpen
} from 'react-icons/fa';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';
import SettingsMenu from '@/components/SettingsMenu';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'promo' | 'order';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const init = async () => {
      const authenticated = isUserAuthenticated();
      if (!authenticated) { router.push('/login'); return; }
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (currentUser?.id) await loadNotifications(currentUser.id);
      setLoading(false);
    };
    init();
    // Her 5 saniyede yenile (admin teslimat bildirimi için)
    const interval = setInterval(() => {
      const u = getCurrentUser();
      if (u?.id) loadNotifications(u.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const loadNotifications = async (userId: string) => {
    // Önce API'den çek
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const text = await res.text();
      if (text) {
        const data = JSON.parse(text);
        const apiNotifs = data.notifications || [];
        if (apiNotifs.length > 0) {
          // API'deki bildirimleri localStorage ile merge et
          const local = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]');
          const localIds = new Set(local.map((n: any) => n.id));
          const merged = [...apiNotifs.filter((n: any) => !localIds.has(n.id)), ...local];
          // Okundu durumlarını koru
          const readIds = new Set(local.filter((n: any) => n.read).map((n: any) => n.id));
          const final = merged.map((n: any) => ({ ...n, read: readIds.has(n.id) ? true : n.read }));
          setNotifications(final);
          localStorage.setItem(`notifications_${userId}`, JSON.stringify(final));
          return;
        }
      }
    } catch {}

    // Fallback: localStorage
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      try { setNotifications(JSON.parse(stored)); } catch {}
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-400" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-400" />;
      case 'info':
        return <FaInfoCircle className="text-blue-400" />;
      case 'promo':
        return <FaGift className="text-purple-400" />;
      case 'order':
        return <FaShoppingCart className="text-cyan-400" />;
      default:
        return <FaBell className="text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'promo':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'order':
        return 'border-cyan-500/30 bg-cyan-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SettingsMenu />
            <Link href="/">
              <AnimatedButton className="px-8 py-3 text-sm min-w-[140px]">
                Ana Sayfa
              </AnimatedButton>
            </Link>
          </div>
          
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Game Shop
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 pt-32">
        {/* Header */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-xl">
                <FaBell className="text-4xl text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Bildirimler</h1>
                <p className="text-gray-400 mt-2">
                  {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <AnimatedButton 
                onClick={markAllAsRead}
                className="px-6 py-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FaEnvelopeOpen />
                  Tümünü Okundu İşaretle
                </div>
              </AnimatedButton>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              Tümü ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              Okunmamış ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-2xl font-bold mb-2">Bildirim Yok</h3>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? 'Tüm bildirimlerinizi okudunuz!'
                : 'Henüz bildiriminiz bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border ${
                  notification.read ? 'border-white/10' : 'border-blue-500/50'
                } rounded-2xl p-6 hover:border-blue-500/50 transition-all group`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${getTypeColor(notification.type)}`}>
                    <div className="text-2xl">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                        )}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{notification.message}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <FaEnvelopeOpen />
                          Okundu İşaretle
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <FaTrash />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

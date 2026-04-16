'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeadset, FaPaperPlane, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { saveSupportMessage, getUserMessages } from '@/lib/support';
import { SupportMessage } from '@/types/support';
import Link from 'next/link';

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [userMessages, setUserMessages] = useState<SupportMessage[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    loadUserMessages();
    
    // Her 5 saniyede bir mesajları yenile (admin yanıtlarını görmek için)
    const interval = setInterval(() => {
      loadUserMessages();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUserMessages = async () => {
    const user = getCurrentUser();
    if (user) {
      const messages = await getUserMessages(user.id);
      setUserMessages(messages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    setLoading(true);

    const newMessage: SupportMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      userEmail: user.email,
      message: `${subject}\n\n${message}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority,
    };

    console.log('Mesaj gönderiliyor:', newMessage);
    await saveSupportMessage(newMessage);
    console.log('Mesaj kaydedildi');
    
    setSubject('');
    setMessage('');
    setPriority('medium');
    setShowSuccess(true);
    loadUserMessages();
    
    setTimeout(() => {
      setShowSuccess(false);
      setLoading(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
            <FaClock /> Beklemede
          </span>
        );
      case 'answered':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
            <FaCheckCircle /> Yanıtlandı
          </span>
        );
      case 'closed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
            Kapatıldı
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Yüksek</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Orta</span>;
      case 'low':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Düşük</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Game Shop
            </Link>
            <Link href="/profile">
              <AnimatedButton className="px-4 py-2 text-sm">
                Profilim
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6">
            <FaHeadset className="text-4xl text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Canlı Destek
          </h1>
          <p className="text-gray-400 text-lg">
            Sorularınız için bize ulaşın, en kısa sürede yanıt verelim
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaPaperPlane className="text-blue-400" />
              Yeni Destek Talebi
            </h2>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400">
                <FaCheckCircle className="text-2xl" />
                <span>Mesajınız başarıyla gönderildi!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Konu
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mesajınızın konusu"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Öncelik
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Mesajınız
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detaylı açıklama yazın..."
                  rows={6}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  required
                />
              </div>

              <AnimatedButton
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-semibold"
              >
                {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </AnimatedButton>
            </form>
          </div>

          {/* Mesaj Geçmişi */}
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Mesaj Geçmişi</h2>

            {userMessages.length === 0 ? (
              <div className="text-center py-12">
                <FaExclamationCircle className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Henüz mesajınız bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(msg.status)}
                          {getPriorityBadge(msg.priority)}
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(msg.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    {msg.response && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FaHeadset className="text-blue-400" />
                          <span className="text-xs font-semibold text-blue-400">
                            Destek Ekibi Yanıtı
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {msg.response}
                        </p>
                        {msg.answeredAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(msg.answeredAt).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

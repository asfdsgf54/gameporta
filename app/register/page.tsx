'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { registerUser } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = registerUser(formData);
    
    if (result.success) {
      alert(result.message);
      router.push('/login');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/50">
            <FaUserPlus className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Kayıt Ol
          </h1>
          <p className="text-gray-400 text-lg">Yeni hesap oluştur</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Kullanıcı Adı</label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="relative w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-zinc-800 transition-all disabled:opacity-50"
                  placeholder="Kullanıcı adınız"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="relative w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-zinc-800 transition-all disabled:opacity-50"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Şifre</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="relative w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-zinc-800 transition-all disabled:opacity-50"
                  placeholder="En az 6 karakter"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Şifre Tekrar</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors z-10" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="relative w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-zinc-800 transition-all disabled:opacity-50"
                  placeholder="Şifrenizi tekrar girin"
                  minLength={6}
                />
              </div>
            </div>

            <AnimatedButton
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </AnimatedButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Zaten hesabın var mı?{' '}
              <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Giriş Yap
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}

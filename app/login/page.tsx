'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaLock, 
  FaSignInAlt,
  FaInfoCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { userLogin } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = userLogin(credentials.username, credentials.password);
    
    if (result.success) {
      setTimeout(() => {
        if (result.isAdmin) {
          // Admin ise dashboard'a yönlendir
          router.push('/admin');
        } else {
          // Normal kullanıcı ise ana sayfaya yönlendir
          router.push('/');
        }
        router.refresh();
      }, 100);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/50 animate-float">
            <FaSignInAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Hoş Geldiniz
          </h1>
          <p className="text-gray-400 text-lg">Devam etmek için giriş yapın</p>
        </div>

        {/* Login Card */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3 animate-shake">
                <FaExclamationCircle className="text-xl" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="relative w-full bg-zinc-900/50 border border-zinc-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all disabled:opacity-50"
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 ml-1">
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="relative w-full bg-zinc-900/50 border border-zinc-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all disabled:opacity-50"
                  placeholder="Şifrenizi girin"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl py-4 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Giriş yapılıyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaSignInAlt />
                  Giriş Yap
                </span>
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center justify-center gap-2">
                <FaInfoCircle className="text-blue-400" />
                Demo Bilgileri
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-400">Admin:</span>
                  <code className="px-3 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-blue-400 font-mono">
                    admin
                  </code>
                  <span className="text-gray-500">/</span>
                  <code className="px-3 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-blue-400 font-mono">
                    admin123
                  </code>
                </div>
                <p className="text-xs text-gray-500">
                  Veya kayıtlı kullanıcı hesabınızla giriş yapın
                </p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Hesabınız yok mu?{' '}
              <a 
                href="/register" 
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center gap-1 group"
              >
                Kayıt Ol
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaEdit,
  FaShieldAlt,
  FaBox,
  FaStar,
  FaChartLine,
  FaCamera
} from 'react-icons/fa';
import { isUserAuthenticated, getCurrentUser, userLogout, updateUserProfile, changePassword } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';
import SettingsMenu from '@/components/SettingsMenu';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const authenticated = isUserAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);
    setEditForm({ username: currentUser?.username || '', email: currentUser?.email || '' });
    setSelectedImage(currentUser?.profileImage || '');
    setLoading(false);
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    setError('');
    setSuccess('');

    const result = await updateUserProfile(user.id, { profileImage: selectedImage });
    if (result.success) {
      setSuccess('Profil fotoğrafı güncellendi!');
      setUser(getCurrentUser());
      setTimeout(() => {
        setShowImageModal(false);
        setSuccess('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await updateUserProfile(user.id, editForm);
    if (result.success) {
      setSuccess(result.message);
      setUser(getCurrentUser());
      setTimeout(() => {
        setShowEditModal(false);
        setSuccess('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    const result = await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setSuccess(result.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    { label: 'Bakiye', value: '₺0.00', icon: FaChartLine, color: 'text-green-400' },
    { label: 'Toplam Alışveriş', value: '0', icon: FaBox, color: 'text-blue-400' },
    { label: 'Aktif Siparişler', value: '0', icon: FaStar, color: 'text-yellow-400' },
    { label: 'Tamamlanan', value: '0', icon: FaShieldAlt, color: 'text-purple-400' },
  ];

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
      <div className="max-w-7xl mx-auto px-4 py-8 pt-32">
        {/* Profile Header */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-5xl text-white" />
                  )}
                </div>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-lg p-2 transition-colors"
                >
                  <FaCamera className="text-white text-sm" />
                </button>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaEnvelope />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 mt-2">
                  <FaCalendarAlt />
                  <span>Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </div>
            
            <AnimatedButton 
              onClick={() => setShowEditModal(true)}
              className="px-6 py-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <FaEdit />
                Profili Düzenle
              </div>
            </AnimatedButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-800">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
                  <IconComponent className={`text-4xl mb-3 ${stat.color} group-hover:scale-110 transition-transform mx-auto`} />
                  <div className="text-3xl font-bold text-white mb-2 text-center">{stat.value}</div>
                  <div className="text-sm text-gray-400 text-center">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <AnimatedButton className="py-3 text-sm">
              Bakiye Yükle
            </AnimatedButton>
            <Link href="/products">
              <AnimatedButton className="w-full py-3 text-sm">
                Ürünleri Görüntüle
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* My Orders */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FaBox className="text-blue-400" />
            Siparişlerim
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-400 text-lg mb-4">Henüz siparişiniz bulunmuyor</p>
            <Link href="/products">
              <AnimatedButton className="px-8 py-3 text-sm">
                Alışverişe Başla
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaUser className="text-blue-400" />
              Kişisel Bilgiler
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Kullanıcı Adı</label>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                  {user.username}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Email</label>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Üyelik Tarihi</label>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaShieldAlt className="text-blue-400" />
              Hesap Durumu
            </h2>
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-400">Hesap Aktif</span>
                </div>
                <p className="text-sm text-gray-400">
                  Hesabınız doğrulanmış ve alışveriş yapabilirsiniz
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-400">Bakiye</span>
                  <span className="text-2xl font-bold text-white">₺0.00</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Alışveriş yapmak için bakiye yükleyin
                </p>
                <AnimatedButton className="w-full py-2 text-sm">
                  Bakiye Yükle
                </AnimatedButton>
              </div>

              <AnimatedButton 
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 text-sm"
              >
                Şifre Değiştir
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FaChartLine className="text-blue-400" />
            Satın Alma Geçmişi
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-400 text-lg">Henüz satın alma geçmişiniz bulunmuyor</p>
            <p className="text-gray-500 text-sm mt-2">İlk alışverişinizi yaparak başlayın</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Profili Düzenle</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <AnimatedButton type="submit" className="flex-1 px-6 py-3">
                  Kaydet
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Şifre Değiştir</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mevcut Şifre</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError('');
                    setSuccess('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <AnimatedButton type="submit" className="flex-1 px-6 py-3">
                  Değiştir
                </AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Profile Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Profil Fotoğrafı Değiştir</h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm mb-4">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-6xl text-white" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Fotoğraf Seç</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">PNG, JPG veya GIF (Max. 5MB)</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(false);
                    setError('');
                    setSuccess('');
                    setSelectedImage(user.profileImage || '');
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
                >
                  İptal
                </button>
                <AnimatedButton 
                  onClick={handleSaveImage}
                  className="flex-1 px-6 py-3"
                >
                  Kaydet
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

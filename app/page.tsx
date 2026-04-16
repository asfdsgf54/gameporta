'use client';

import { useState, useEffect } from 'react';
import { 
  FaGamepad, 
  FaShoppingCart, 
  FaUsers, 
  FaStar, 
  FaCalendarAlt,
  FaChartLine,
  FaShieldAlt,
  FaBolt,
  FaGem,
  FaArrowRight,
  FaTrophy,
  FaFire,
  FaCog,
  FaUser,
  FaBox,
  FaBell,
  FaSignOutAlt
} from 'react-icons/fa';

import { 
  GiCrossedSwords, 
  GiTwoCoins,
  GiDiamondTrophy 
} from 'react-icons/gi';
import AnimatedButton from '@/components/AnimatedButton';
import Link from 'next/link';
import Image from 'next/image';
import { isUserAuthenticated, getCurrentUser, userLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import SettingsMenu from '@/components/SettingsMenu';

// Platform linklerinizi buraya ekleyin
const platforms = [
  {
    id: 1,
    name: 'PlayerAuctions',
    url: 'https://www.playerauctions.com/your-profile',
    description: 'Uluslararası güvenilir platform',
    rating: '4.8/5',
    sales: '2500+',
    icon: FaTrophy
  },
  {
    id: 2,
    name: 'G2G Marketplace',
    url: 'https://www.g2g.com/your-profile',
    description: 'Asya\'nın en büyük pazarı',
    rating: '4.9/5',
    sales: '3200+',
    icon: GiTwoCoins
  },
  {
    id: 3,
    name: 'EpicNPC',
    url: 'https://www.epicnpc.com/your-profile',
    description: 'Forum tabanlı güvenli ticaret',
    rating: '4.7/5',
    sales: '1800+',
    icon: GiCrossedSwords
  },
  {
    id: 4,
    name: 'IGVault',
    url: 'https://www.igvault.com/your-profile',
    description: 'Hızlı teslimat garantisi',
    rating: '4.8/5',
    sales: '2100+',
    icon: FaShieldAlt
  },
  {
    id: 5,
    name: 'PlayerUp',
    url: 'https://www.playerup.com/your-profile',
    description: 'Middleman korumalı işlemler',
    rating: '4.6/5',
    sales: '1500+',
    icon: GiDiamondTrophy
  },
];

const stats = [
  { label: 'Toplam Satış', value: '11.000+', icon: FaChartLine },
  { label: 'Mutlu Müşteri', value: '8.500+', icon: FaUsers },
  { label: 'Aktif Yıl', value: '5+', icon: FaCalendarAlt },
  { label: 'Ortalama Puan', value: '4.8/5', icon: FaStar },
];

const games = [
  'League of Legends', 'Valorant', 'CS:GO', 'Dota 2', 'PUBG',
  'Fortnite', 'Apex Legends', 'Genshin Impact', 'Lost Ark', 'WoW'
];

export default function Home() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const authenticated = isUserAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const user = getCurrentUser();
      setUsername(user?.username || '');
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Game Shop
          </div>
          
          <div className="flex items-center gap-4">
            {/* Settings Menu */}
            <SettingsMenu />

            {/* User Menu or Login */}
            {isAuthenticated ? (
              <Link href="/profile">
                <AnimatedButton className="px-8 py-3 text-sm min-w-[140px]">
                  {username}
                </AnimatedButton>
              </Link>
            ) : (
              <Link href="/login">
                <AnimatedButton className="px-8 py-3 text-sm min-w-[140px]">
                  Giriş Yap
                </AnimatedButton>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-black to-black"></div>
        
        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64 md:w-96 md:h-96 animate-float">
              <Image
                src="/logo.png"
                alt="Game Shop Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-4">
            <FaGamepad className="text-lg" />
            Profesyonel Oyun Hesap & Item Satışı
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Güvenilir Oyun Ticareti
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            5 yılı aşkın tecrübemiz ve binlerce başarılı işlemle, oyun hesapları ve item satışında 
            sektörün en güvenilir isimlerinden biriyiz.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all group">
                  <IconComponent className="text-4xl mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 px-4 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Aktif Olduğumuz <span className="text-blue-400">Platformlar</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Tüm büyük platformlarda doğrulanmış satıcı hesaplarımız bulunmaktadır
            </p>
          </div>

          {/* Scrolling Platform Cards */}
          <div className="relative overflow-hidden py-8">
            <div className="flex gap-6 animate-scroll hover:pause">
              {/* İlk set */}
              {platforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <a
                    key={`first-${platform.id}`}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId(platform.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex-shrink-0 w-96 animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <IconComponent className="text-3xl text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                              {platform.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                        <FaArrowRight className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-yellow-400" />
                          <div>
                            <div className="text-yellow-400 text-sm font-semibold">{platform.rating}</div>
                            <div className="text-gray-500 text-xs">Değerlendirme</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaShoppingCart className="text-green-400" />
                          <div>
                            <div className="text-green-400 text-sm font-semibold">{platform.sales}</div>
                            <div className="text-gray-500 text-xs">Satış</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
              {/* İkinci set (seamless loop) */}
              {platforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <a
                    key={`second-${platform.id}`}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId(platform.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex-shrink-0 w-96 animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <IconComponent className="text-3xl text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                              {platform.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                        <FaArrowRight className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-yellow-400" />
                          <div>
                            <div className="text-yellow-400 text-sm font-semibold">{platform.rating}</div>
                            <div className="text-gray-500 text-xs">Değerlendirme</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaShoppingCart className="text-green-400" />
                          <div>
                            <div className="text-green-400 text-sm font-semibold">{platform.sales}</div>
                            <div className="text-gray-500 text-xs">Satış</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Desteklediğimiz <span className="text-blue-400">Oyunlar</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {games.map((game, index) => (
              <AnimatedButton
                key={index}
                className="px-6 py-3"
              >
                {game}
              </AnimatedButton>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 px-4 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Neden <span className="text-blue-400">Bizi Seçmelisiniz?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
              <div className="p-4 bg-blue-500/10 rounded-xl inline-block mb-6 group-hover:bg-blue-500/20 transition-colors">
                <FaShieldAlt className="text-5xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Güvenli İşlem</h3>
              <p className="text-gray-400 leading-relaxed">
                Tüm işlemlerimiz platform güvencesi altında gerçekleşir. Middleman sistemi ile %100 güvenli alışveriş.
              </p>
            </div>

            <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
              <div className="p-4 bg-blue-500/10 rounded-xl inline-block mb-6 group-hover:bg-blue-500/20 transition-colors">
                <FaBolt className="text-5xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Hızlı Teslimat</h3>
              <p className="text-gray-400 leading-relaxed">
                Ödeme sonrası ortalama 15 dakika içinde teslimat. 7/24 aktif destek ekibimiz her zaman yanınızda.
              </p>
            </div>

            <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
              <div className="p-4 bg-blue-500/10 rounded-xl inline-block mb-6 group-hover:bg-blue-500/20 transition-colors">
                <FaGem className="text-5xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Kaliteli Ürünler</h3>
              <p className="text-gray-400 leading-relaxed">
                Tüm hesaplar ve itemler detaylı kontrol edilir. Sorun yaşamanız durumunda tam destek garantisi.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link href="/products">
              <AnimatedButton className="px-10 py-5 text-xl font-bold">
                Tüm Ürünleri Görüntüle →
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © 2024 Game Shop. Tüm hakları saklıdır. | Profesyonel oyun ticareti hizmetleri
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Güvenli alışveriş için sadece yukarıdaki resmi platformlarımızı kullanın.
          </p>
        </div>
      </footer>
    </main>
  );
}

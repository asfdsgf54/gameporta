'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaBox, FaPlus, FaChartBar, FaSignOutAlt, FaUser, FaHeadset, FaBell, FaUsers, FaRobot, FaWallet } from 'react-icons/fa';
import { isAdminAuthenticated, getAdminUser, adminLogout } from '@/lib/auth';
import AnimatedButton from '@/components/AnimatedButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  useEffect(() => {
    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setAdminUser(getAdminUser());
    }
  }, [pathname, router]);

  const handleLogout = () => {
    adminLogout();
    router.push('/login');
  };

  // Auth kontrolü yapılana kadar loading göster
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col shadow-2xl">
        <div className="p-6 flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2"></div>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/') 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaHome className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Ana Sayfa</span>
            </Link>
            
            <Link 
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin') 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaChartBar className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              href="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                pathname?.startsWith('/admin/products') && pathname !== '/admin/products/new'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaBox className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Ürünler</span>
            </Link>

            <Link 
              href="/admin/notifications"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin/notifications')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaBell className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Bildirimler</span>
            </Link>

            <Link 
              href="/admin/support"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin/support')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaHeadset className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Canlı Destek</span>
            </Link>

            <Link 
              href="/admin/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin/users')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaUsers className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Kullanıcılar</span>
            </Link>

            <Link 
              href="/admin/automation"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin/automation')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaRobot className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Otomasyon</span>
            </Link>

            <Link 
              href="/admin/balance"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive('/admin/balance')
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FaWallet className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Bakiye</span>
            </Link>
            
            <div className="pt-4">
              <Link 
                href="/admin/products/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-[1.02] group"
              >
                <FaPlus className="group-hover:rotate-90 transition-transform" />
                <span className="font-bold">Yeni Ürün</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-6 border-t border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-zinc-800/50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <FaUser className="text-sm" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400">Hoşgeldin</div>
              <div className="text-sm font-semibold text-white">{adminUser}</div>
            </div>
          </div>
          <AnimatedButton
            onClick={handleLogout}
            className="w-full px-4 py-3 shadow-[0_1000px_0_0_hsl(0_84%_60%_/_0.1)_inset] hover:shadow-[0_1000px_0_0_hsl(0_84%_60%_/_0.2)_inset]"
          >
            <div className="flex items-center justify-center gap-2 text-red-400">
              <FaSignOutAlt />
              <span className="font-semibold">Çıkış Yap</span>
            </div>
          </AnimatedButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}

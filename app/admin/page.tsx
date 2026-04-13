'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/products';
import { FaBox, FaDollarSign, FaChartLine, FaStar, FaTrophy, FaFire, FaBell } from 'react-icons/fa';
import Link from 'next/link';
import AnimatedButton from '@/components/AnimatedButton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    inStock: 0,
    featured: 0,
  });

  useEffect(() => {
    const products = getProducts();
    setStats({
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      inStock: products.filter(p => p.stock > 0).length,
      featured: products.filter(p => p.featured).length,
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-400 text-lg">Ürün yönetimi ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <FaBox className="text-3xl text-blue-400" />
            </div>
            <span className="text-sm text-blue-400 font-semibold">Toplam</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{stats.totalProducts}</div>
          <div className="text-sm text-gray-400">Ürün</div>
        </div>

        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <FaDollarSign className="text-3xl text-green-400" />
            </div>
            <span className="text-sm text-green-400 font-semibold">Değer</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">${stats.totalValue.toFixed(2)}</div>
          <div className="text-sm text-gray-400">Toplam Değer</div>
        </div>

        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <FaChartLine className="text-3xl text-yellow-400" />
            </div>
            <span className="text-sm text-yellow-400 font-semibold">Stok</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{stats.inStock}</div>
          <div className="text-sm text-gray-400">Stokta Var</div>
        </div>

        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <FaStar className="text-3xl text-purple-400" />
            </div>
            <span className="text-sm text-purple-400 font-semibold">Öne Çıkan</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{stats.featured}</div>
          <div className="text-sm text-gray-400">Featured</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaFire className="text-2xl text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Hızlı İşlemler</h2>
          </div>
          <div className="space-y-3">
            <Link href="/admin/products/new">
              <AnimatedButton className="w-full p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Yeni Ürün Ekle</span>
                  <span>→</span>
                </div>
              </AnimatedButton>
            </Link>
            <Link href="/admin/products">
              <AnimatedButton className="w-full p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ürünleri Yönet</span>
                  <span>→</span>
                </div>
              </AnimatedButton>
            </Link>
            <Link href="/admin/notifications">
              <AnimatedButton className="w-full p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-2">
                    <FaBell />
                    Bildirim Gönder
                  </span>
                  <span>→</span>
                </div>
              </AnimatedButton>
            </Link>
          </div>
        </div>

        <div className="animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FaTrophy className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">Sistem Durumu</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <span className="text-sm text-gray-400">Veritabanı</span>
              <span className="text-sm text-green-400 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <span className="text-sm text-gray-400">Depolama</span>
              <span className="text-sm text-blue-400 font-semibold">LocalStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/products';
import { Product } from '@/types/product';
import { FaTrash, FaPlus, FaClock, FaCheckCircle, FaExclamationCircle, FaWallet } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function MyAdsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ads, setAds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
    } else {
      const user = getCurrentUser();
      setCurrentUser(user);
      loadAds(user?.id);
    }
  }, [router]);

  const loadAds = (userId?: string) => {
    if (!userId) return;
    const allProducts = getProducts();
    const userAds = allProducts.filter(p => p.sellerId === userId);
    setAds(userAds);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      await deleteProduct(id);
      loadAds(currentUser?.id);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1.5"><FaCheckCircle /> Yayında</span>;
      case 'sold':
        return <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-1.5"><FaCheckCircle /> Satıldı</span>;
      case 'expired':
        return <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-1.5"><FaClock /> Süresi Doldu</span>;
      default:
        return <span className="bg-zinc-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 flex items-center gap-1.5"><FaExclamationCircle /> İnceleniyor</span>;
    }
  };

  if (loading) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Üst Kısım / Profil Özeti */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">İlanlarım</h1>
            <p className="text-gray-400">Aktif ilanlarınızı ve satış istatistiklerinizi buradan yönetin.</p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                <FaWallet className="text-blue-400" /> Bakiye
              </div>
              <div className="text-2xl font-black text-white">$ {currentUser?.balance?.toFixed(2) || '0.00'}</div>
            </div>
            <Link href="/sell">
              <AnimatedButton className="px-6 py-4 font-bold flex items-center gap-2">
                <FaPlus /> Yeni İlan
              </AnimatedButton>
            </Link>
          </div>
        </div>

        {/* İlan Listesi */}
        <div className="grid gap-6">
          {ads.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-gray-500 mb-6">Henüz bir ilan oluşturmamışsınız.</p>
              <Link href="/sell">
                <button className="text-blue-400 hover:text-blue-300 font-bold transition-colors underline">Hemen ilk ilanını ver →</button>
              </Link>
            </div>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 aspect-video md:aspect-square bg-zinc-800 rounded-xl overflow-hidden shadow-inner">
                  {ad.images?.[0] ? (
                    <img src={ad.images[0]} alt={ad.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">Görsel Yok</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{ad.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                          <span>{ad.game}</span>
                          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                          <span>{ad.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-blue-400">$ {ad.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Komisyon sonrası: $ {(ad.price * 0.9).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ad.status)}
                      {ad.status === 'active' && ad.expiryDate && (
                        <span className="text-xs text-gray-500 font-medium">Bitiş: {new Date(ad.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-500/60 hover:text-red-500 p-2 transition-colors"
                      title="İlanı Sil"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

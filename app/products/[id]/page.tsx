'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/products';
import { Product } from '@/types/product';
import { FaArrowLeft, FaShoppingCart, FaStar, FaCheckCircle, FaBox, FaWallet, FaLock } from 'react-icons/fa';
import SettingsMenu from '@/components/SettingsMenu';
import AnimatedButton from '@/components/AnimatedButton';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { getUserBalance, deductBalance } from '@/lib/balance';
import { createOrder } from '@/lib/automation';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [isAuth, setIsAuth] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string; deliveryInfo?: string } | null>(null);

  useEffect(() => {
    const id = params.id as string;
    const foundProduct = getProductById(id);
    if (foundProduct) setProduct(foundProduct);
    setLoading(false);

    const auth = isUserAuthenticated();
    setIsAuth(auth);
    if (auth) {
      const user = getCurrentUser();
      if (user) {
        // localStorage'dan direkt oku
        setBalance(getUserBalance(user.id));
        // Arka planda API'den de kontrol et
        fetch('/api/users')
          .then(res => res.text())
          .then(text => {
            if (!text) return;
            const data = JSON.parse(text);
            const fresh = data.users?.find((u: any) => u.id === user.id);
            if (fresh) {
              setBalance(fresh.balance ?? 0);
              localStorage.setItem('currentUser', JSON.stringify(fresh));
            }
          })
          .catch(() => {});
      }
    }
  }, [params.id]);

  const handlePurchase = async () => {
    if (!product) return;

    if (!isAuth) {
      router.push('/login');
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    if (balance < product.price) {
      setPurchaseResult({ success: false, message: `Yetersiz bakiye! Bakiyeniz: $${balance.toFixed(2)}, Ürün fiyatı: $${product.price}` });
      return;
    }

    setPurchasing(true);

    // Bakiyeyi düş
    const result = await deductBalance(user.id, product.price);
    if (!result.success) {
      setPurchaseResult({ success: false, message: result.message });
      setPurchasing(false);
      return;
    }

    // Sipariş oluştur (stok düşer, bildirim gider)
    const order = await createOrder(user.id, user.username, product);

    // Bakiyeyi güncelle
    setBalance(getUserBalance(user.id));

    // Ürünü yenile (stok düştü)
    const updated = getProductById(product.id);
    if (updated) setProduct(updated);

    setPurchaseResult({
      success: true,
      message: 'Satın alma başarılı! Teslimat bilgileri admin tarafından gönderilecek.',
      deliveryInfo: order.deliveryInfo,
    });

    setPurchasing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold mb-4">Ürün Bulunamadı</h1>
          <Link href="/products" className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Game Shop
            </Link>
            <div className="flex items-center gap-4">
              {isAuth && (
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <FaWallet className="text-green-400" />
                  <span className="text-green-400 font-bold">${balance.toFixed(2)}</span>
                </div>
              )}
              <SettingsMenu />
              <Link href="/products">
                <AnimatedButton className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2"><FaArrowLeft /> Ürünler</div>
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              {product.images.length > 0 ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <FaShoppingCart className="text-9xl" />
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-yellow-500 rounded-full flex items-center gap-2 font-bold">
                  <FaStar /> Öne Çıkan
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-500 scale-105' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">{product.game}</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">{product.category}</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-end gap-4 mb-6">
                <div className="text-5xl font-bold text-blue-400">${product.price}</div>
                <div className={`text-lg font-semibold mb-2 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? <span className="flex items-center gap-2"><FaCheckCircle /> {product.stock} Stokta</span> : 'Stokta Yok'}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Ürün Açıklaması</h2>
              <p className="text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {product.features.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Özellikler</h2>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Satın Alma Sonucu */}
            {purchaseResult && (
              <div className={`p-4 rounded-xl border ${purchaseResult.success ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                <p className={`font-semibold ${purchaseResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {purchaseResult.success ? '✅' : '❌'} {purchaseResult.message}
                </p>
                {purchaseResult.deliveryInfo && (
                  <div className="mt-3 p-3 bg-zinc-900 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1 font-semibold">Teslimat Bilgisi:</p>
                    <p className="text-white font-mono">{purchaseResult.deliveryInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bakiye Bilgisi */}
            {isAuth && !purchaseResult?.success && (
              <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 text-gray-400">
                  <FaWallet className="text-green-400" />
                  <span>Bakiyeniz</span>
                </div>
                <span className={`font-bold text-lg ${balance >= product.price ? 'text-green-400' : 'text-red-400'}`}>
                  ${balance.toFixed(2)}
                </span>
              </div>
            )}

            {/* Satın Al Butonu */}
            {!purchaseResult?.success && (
              <div className="space-y-3">
                <AnimatedButton
                  onClick={handlePurchase}
                  disabled={product.stock === 0 || purchasing}
                  className="w-full py-4 text-lg font-bold"
                >
                  <div className="flex items-center justify-center gap-3">
                    {purchasing ? (
                      <span>İşleniyor...</span>
                    ) : !isAuth ? (
                      <><FaLock /> Giriş Yap & Satın Al</>
                    ) : product.stock === 0 ? (
                      'Stokta Yok'
                    ) : (
                      <><FaShoppingCart /> Satın Al — ${product.price}</>
                    )}
                  </div>
                </AnimatedButton>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-gray-400">Güvenli</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-gray-400">Hızlı</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="text-2xl mb-1">💯</div>
                    <div className="text-gray-400">7/24</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-gray-400">
              <div className="flex items-center gap-2 mb-2">
                <FaBox className="text-blue-400" />
                <span className="font-semibold text-white">Ürün Bilgileri</span>
              </div>
              <div className="space-y-1">
                <div>Ürün ID: <span className="text-gray-500">#{product.id}</span></div>
                <div>Eklenme: <span className="text-gray-500">{new Date(product.createdAt).toLocaleDateString('tr-TR')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

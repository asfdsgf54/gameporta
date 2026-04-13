'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/lib/products';
import { Product } from '@/types/product';
import { FaArrowLeft, FaShoppingCart, FaStar, FaCheckCircle, FaBox } from 'react-icons/fa';
import SettingsMenu from '@/components/SettingsMenu';
import AnimatedButton from '@/components/AnimatedButton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const foundProduct = getProductById(id);
    
    if (foundProduct) {
      setProduct(foundProduct);
    }
    setLoading(false);
  }, [params.id]);

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
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
          >
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
              <SettingsMenu />
              <Link href="/products">
                <AnimatedButton className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FaArrowLeft /> Ürünler
                  </div>
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
            {/* Main Image */}
            <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
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

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500 scale-105'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                  {product.game}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-end gap-4 mb-6">
                <div className="text-5xl font-bold text-blue-400">
                  ${product.price}
                </div>
                <div className={`text-lg font-semibold mb-2 ${
                  product.stock > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {product.stock > 0 ? (
                    <span className="flex items-center gap-2">
                      <FaCheckCircle /> {product.stock} Stokta
                    </span>
                  ) : (
                    'Stokta Yok'
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">Ürün Açıklaması</h2>
              <p className="text-gray-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <AnimatedButton
                disabled={product.stock === 0}
                className="w-full py-4 text-lg font-bold"
              >
                <div className="flex items-center justify-center gap-3">
                  <FaShoppingCart />
                  {product.stock > 0 ? 'Satın Al' : 'Stokta Yok'}
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

            {/* Product Info */}
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

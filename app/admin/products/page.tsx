'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct } from '@/lib/products';
import { Product } from '@/types/product';
import { FaEdit, FaTrash, FaPlus, FaStar } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      deleteProduct(id);
      loadProducts();
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'featured') return p.featured;
    if (filter === 'in-stock') return p.stock > 0;
    if (filter === 'out-of-stock') return p.stock === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Ürünler</h1>
          <p className="text-gray-400">{products.length} toplam ürün</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Yeni Ürün
        </Link>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2">
        <AnimatedButton
          onClick={() => setFilter('all')}
          className={`px-4 py-2 ${
            filter === 'all' ? 'shadow-[0_1000px_0_0_hsl(217_91%_60%)_inset]' : ''
          }`}
        >
          Tümü ({products.length})
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setFilter('featured')}
          className={`px-4 py-2 ${
            filter === 'featured' ? 'shadow-[0_1000px_0_0_hsl(217_91%_60%)_inset]' : ''
          }`}
        >
          Öne Çıkan ({products.filter((p) => p.featured).length})
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setFilter('in-stock')}
          className={`px-4 py-2 ${
            filter === 'in-stock' ? 'shadow-[0_1000px_0_0_hsl(217_91%_60%)_inset]' : ''
          }`}
        >
          Stokta ({products.filter((p) => p.stock > 0).length})
        </AnimatedButton>
        <AnimatedButton
          onClick={() => setFilter('out-of-stock')}
          className={`px-4 py-2 ${
            filter === 'out-of-stock' ? 'shadow-[0_1000px_0_0_hsl(217_91%_60%)_inset]' : ''
          }`}
        >
          Tükendi ({products.filter((p) => p.stock === 0).length})
        </AnimatedButton>
      </div>

      {/* Ürün Listesi */}
      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">Henüz ürün eklenmemiş</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <FaPlus /> İlk Ürünü Ekle
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex gap-6">
                {/* Görsel */}
                <div className="flex-shrink-0">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        {product.featured && (
                          <FaStar className="text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{product.game}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        ${product.price}
                      </div>
                      <div
                        className={`text-sm ${
                          product.stock > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} stokta`
                          : 'Stokta yok'}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Özellikler */}
                  {product.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 3 && (
                        <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-400">
                          +{product.features.length - 3} daha
                        </span>
                      )}
                    </div>
                  )}

                  {/* Aksiyonlar */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      <FaEdit /> Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      <FaTrash /> Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { Product } from '@/types/product';
import { FaSearch, FaFilter } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard';
import SettingsMenu from '@/components/SettingsMenu';
import AnimatedButton from '@/components/AnimatedButton';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Oyun filtresi
    if (selectedGame !== 'all') {
      filtered = filtered.filter(p => p.game === selectedGame);
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sıralama
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedGame, selectedCategory, sortBy, products]);

  const games = Array.from(new Set(products.map(p => p.game)));
  const categories = Array.from(new Set(products.map(p => p.category)));

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
              <Link href="/admin/login">
                <AnimatedButton className="px-4 py-2 text-sm">
                  Admin
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Ürünlerimiz
          </h1>
          <p className="text-gray-400 text-lg">
            {filteredProducts.length} ürün bulundu
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Tüm Oyunlar</option>
              {games.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="newest">En Yeni</option>
              <option value="price-low">Fiyat (Düşük)</option>
              <option value="price-high">Fiyat (Yüksek)</option>
              <option value="name">İsim (A-Z)</option>
            </select>

            <AnimatedButton
              onClick={() => {
                setSearchTerm('');
                setSelectedGame('all');
                setSelectedCategory('all');
                setSortBy('newest');
              }}
              className="px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <FaFilter /> Filtreleri Temizle
              </div>
            </AnimatedButton>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-400 mb-6">Arama kriterlerinize uygun ürün bulunamadı</p>
            <AnimatedButton
              onClick={() => {
                setSearchTerm('');
                setSelectedGame('all');
                setSelectedCategory('all');
              }}
              className="px-6 py-3"
            >
              Filtreleri Temizle
            </AnimatedButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

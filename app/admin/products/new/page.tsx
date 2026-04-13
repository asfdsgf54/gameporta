'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProduct } from '@/lib/products';
import { Product, ProductFormData } from '@/types/product';
import { FaImage, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';

const games = [
  'League of Legends',
  'Valorant',
  'CS:GO',
  'Dota 2',
  'PUBG',
  'Fortnite',
  'Apex Legends',
  'Genshin Impact',
  'Lost Ark',
  'World of Warcraft',
];

const categories = [
  'Hesap',
  'Skin',
  'Item',
  'Currency',
  'Boost',
  'Diğer',
];

export default function NewProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    game: '',
    category: '',
    price: '',
    description: '',
    features: '',
    images: [],
    stock: '1',
    featured: false,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const product: Product = {
      id: Date.now().toString(),
      name: formData.name,
      game: formData.game,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description,
      features: formData.features.split('\n').filter(f => f.trim()),
      images: formData.images,
      stock: parseInt(formData.stock),
      featured: formData.featured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProduct(product);
    router.push('/admin/products');
  };

  const addImage = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()],
      });
      setImageUrl('');
    }
  };

  const handleImageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Dosya boyutu kontrolü (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} çok büyük! Maksimum 2MB olmalı.`);
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} bir resim dosyası değil!`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({
          ...formData,
          images: [...formData.images, base64],
        });
      };
      reader.readAsDataURL(file);
    });

    // Input'u temizle
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Yeni Ürün Ekle</h1>
        <p className="text-gray-400">Satışa sunmak için yeni bir ürün oluşturun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Temel Bilgiler</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Ürün Adı *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Örn: Elmas Hesap - 50.000 BE"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Oyun *</label>
              <select
                required
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">Seçiniz</option>
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">Seçiniz</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fiyat ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stok Adedi *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Açıklama */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Açıklama ve Özellikler</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Ürün Açıklaması *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Ürün hakkında detaylı açıklama yazın..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Özellikler (Her satıra bir özellik)</label>
            <textarea
              rows={6}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="50.000 Blue Essence&#10;150+ Champion&#10;Tüm Runlar Açık&#10;Email Değiştirilebilir"
            />
            <p className="text-sm text-gray-500 mt-2">Her satıra bir özellik yazın</p>
          </div>
        </div>

        {/* Görseller */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Ürün Görselleri</h2>

          {/* Upload Method Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              URL ile Ekle
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              Dosya Yükle
            </button>
          </div>

          {/* URL Upload */}
          {uploadMethod === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={handleImageKeyPress}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Görsel URL'si girin (örn: https://example.com/image.jpg)"
                />
                <AnimatedButton
                  type="button"
                  onClick={(e) => addImage(e)}
                  className="px-6 py-3 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <FaPlus /> Ekle
                  </div>
                </AnimatedButton>
              </div>
              <p className="text-xs text-gray-500">Enter tuşuna basarak veya Ekle butonuna tıklayarak görsel ekleyebilirsiniz</p>
            </div>
          )}

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="space-y-2">
              <label className="block">
                <div className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-lg p-8 text-center cursor-pointer transition-colors bg-zinc-800/30 hover:bg-zinc-800/50">
                  <FaImage className="text-4xl mx-auto mb-3 text-gray-500" />
                  <p className="text-white font-medium mb-1">Dosya seçmek için tıklayın</p>
                  <p className="text-sm text-gray-500">veya sürükleyip bırakın</p>
                  <p className="text-xs text-gray-600 mt-2">PNG, JPG, GIF (Max 2MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Hata';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.images.length === 0 && (
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center text-gray-500">
              <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
              <p>Henüz görsel eklenmedi</p>
            </div>
          )}
        </div>

        {/* Diğer Ayarlar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Diğer Ayarlar</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm">Öne çıkan ürün olarak işaretle</span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-4">
          <AnimatedButton
            type="submit"
            className="flex-1 px-6 py-4 font-semibold"
          >
            <div className="flex items-center justify-center gap-2">
              <FaSave /> Ürünü Kaydet
            </div>
          </AnimatedButton>
          <AnimatedButton
            type="button"
            onClick={() => router.back()}
            className="px-6 py-4 font-semibold"
          >
            İptal
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}

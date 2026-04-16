'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveProduct } from '@/lib/products';
import { Product, ProductFormData } from '@/types/product';
import { FaImage, FaPlus, FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';

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

export default function SellPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login?redirect=/sell');
    } else {
      setIsAuthenticated(true);
      setCurrentUser(getCurrentUser());
    }
    setLoading(false);
  }, [router]);

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
    digitalStock: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // 7 günlük bitiş tarihi hesapla
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const product: Product = {
      id: Date.now().toString(),
      name: formData.name,
      game: formData.game,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description,
      features: formData.features.split('\n').filter(f => f.trim()),
      images: formData.images,
      stock: 1, // Kullanıcı ilanları şimdilik tekli stok
      featured: false, // Kullanıcılar öne çıkan yapamaz (admin yetkisi)
      digitalStock: formData.digitalStock ? formData.digitalStock.split('\n').filter(s => s.trim()) : [],
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      isUserListing: true,
      status: 'active',
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (product.digitalStock!.length === 0) {
      alert('Lütfen en az bir adet hesap bilgisi (giriş bilgileri) giriniz!');
      return;
    }

    await saveProduct(product);
    router.push('/profile/ads?success=true');
  };

  const addImage = (e?: any) => {
    if (e) e.preventDefault();
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()],
      });
      setImageUrl('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) return;
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
  };

  if (loading) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">İlan Oluştur</h1>
          <p className="text-gray-400">Ürününüzü binlerce oyun severle buluşturun. (Platform Komisyonu: %10)</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8 flex items-start gap-4">
          <FaExclamationTriangle className="text-blue-400 text-xl mt-1 shrink-0" />
          <div className="text-sm text-blue-200">
            <strong>Önemli:</strong> İlanınız 7 gün boyunca yayında kalacaktır. Satış gerçekleştiğinde kazancınızın %90'ı hesabınıza aktarılır.
            Girdiğiniz hesap bilgileri (login credentials) sadece ürün satıldığında alıcıyla paylaşılacaktır.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Genel Bilgiler</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">İlan Başlığı *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="Örn: 50 Skinli Bronz Hesap / Valorant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Oyun *</label>
                <select
                  required
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Oyun Seçiniz</option>
                  {games.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Kategori Seçiniz</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Satış Fiyatı ($) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Detaylar</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">İlan Açıklaması *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Ürününüzün tüm detaylarını buraya yazın..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-400 font-bold">⚠️ Hesap Giriş Bilgileri (Login Info) *</label>
              <textarea
                required
                rows={3}
                value={formData.digitalStock}
                onChange={(e) => setFormData({ ...formData, digitalStock: e.target.value })}
                className="w-full bg-zinc-800 border border-blue-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
                placeholder="Örn: kullanıcı_adi:sifre123"
              />
              <p className="text-xs text-gray-500 mt-2">Bu bilgi alıcı ödeme yaptıktan sonra otomatik olarak ona teslim edilir. Gizli tutulur.</p>
            </div>
          </div>

          {/* Görseller */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Görseller</h2>
            
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'url' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-gray-400'
                }`}
              >URL</button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-gray-400'
                }`}
              >Dosya Yükle</button>
            </div>

            {uploadMethod === 'url' ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                  placeholder="https://..."
                />
                <button type="button" onClick={addImage} className="px-6 py-3 bg-blue-500 rounded-xl font-bold">Ekle</button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <FaImage className="text-3xl mx-auto mb-2 text-gray-600" />
                <p className="text-sm">Görsel seçmek için tıklayın</p>
                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
              </label>
            )}

            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group aspect-video">
                  <img src={img} className="w-full h-full object-cover rounded-lg border border-zinc-800" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, images: formData.images.filter((_, idx)=>idx!==i)})}
                    className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full text-xs"
                  ><FaTimes /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <AnimatedButton type="submit" className="flex-1 py-4 text-lg font-bold">
              <div className="flex items-center justify-center gap-2">
                <FaPlus /> İlanı Yayınla
              </div>
            </AnimatedButton>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-zinc-800 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
            >İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

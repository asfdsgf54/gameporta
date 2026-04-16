// Bu dosya ilk yüklemede örnek verileri localStorage'a yükler

export const initializeData = async () => {
  if (typeof window === 'undefined') return;

  // Ürünleri serverdan çek
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      localStorage.setItem('products', JSON.stringify(data.products));
      console.log('✅ Ürünler sunucudan senkronize edildi');
    }
  } catch (error) {
    console.log('Ürünler sunucudan çekilemedi');
  }

  // Kullanıcıları serverdan çek (bakiyeleri koru)
  try {
    const response = await fetch('/api/users');
    const text = await response.text();
    if (text) {
      const data = JSON.parse(text);
      if (data.users) {
        const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const merged = data.users.map((serverUser: any) => {
          const local = localUsers.find((u: any) => u.id === serverUser.id);
          return {
            ...serverUser,
            balance: serverUser.balance ?? local?.balance ?? 0,
            totalOrders: serverUser.totalOrders ?? local?.totalOrders ?? 0,
            totalSpent: serverUser.totalSpent ?? local?.totalSpent ?? 0,
          };
        });
        localStorage.setItem('registeredUsers', JSON.stringify(merged));
        console.log('✅ Kullanıcılar sunucudan senkronize edildi');
      }
    }
  } catch (error) {
    console.log('Kullanıcılar sunucudan çekilemedi');
  }

  // Destek mesajlarını serverdan çek
  try {
    const response = await fetch('/api/support');
    const data = await response.json();
    if (data.messages) {
      localStorage.setItem('supportMessages', JSON.stringify(data.messages));
      console.log('✅ Destek mesajları sunucudan senkronize edildi');
    }
  } catch (error) {
    console.log('Destek mesajları sunucudan çekilemedi');
  }

  // Test ürünü — otomasyon testi için
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const testExists = products.find((p: any) => p.id === 'test-001');
  if (!testExists) {
    products.unshift({
      id: 'test-001',
      name: '🧪 Test Ürünü — Otomasyon',
      game: 'Test',
      category: 'Test',
      price: 10,
      description: 'Bu ürün otomasyon sistemini test etmek için oluşturulmuştur.',
      features: ['Otomasyon Testi', 'Anlık Sipariş', 'Bildirim Sistemi'],
      images: [],
      stock: 99,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem('products', JSON.stringify(products));
    console.log('✅ Test ürünü oluşturuldu (ID: test-001, Fiyat: $10)');
  }
};

// Verileri sıfırla (geliştirme için)
export const resetData = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('registeredUsers');
  localStorage.removeItem('products');
  localStorage.removeItem('supportMessages');

  console.log('🔄 Tüm veriler sıfırlandı');
  initializeData();
};

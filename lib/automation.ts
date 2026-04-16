// Merkezi Otomasyon Sistemi
// Tüm otomatik işlemler buradan yönetilir

import { getProducts, saveProduct } from './products';
import { getRegisteredUsers, updateUserBalance } from './auth';
import { Product } from '@/types/product';

// ─── Bildirim Gönderme Yardımcısı ───────────────────────────────────────────

export const sendNotificationToUser = async (
  userId: string,
  notification: { type: string; title: string; message: string }
) => {
  const notif = {
    id: Date.now().toString() + Math.random(),
    ...notification,
    date: new Date().toISOString(),
    read: false,
  };

  // API'ye yaz (kalıcı ve cross-session)
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notification: notif }),
    });
  } catch {}

  // localStorage'a da yaz (fallback)
  if (typeof window !== 'undefined') {
    try {
      const key = `notifications_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(notif);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
  }
};

export const sendNotificationToAll = async (notification: {
  type: string;
  title: string;
  message: string;
}) => {
  const users = getRegisteredUsers();
  for (const u of users) {
    await sendNotificationToUser(u.id, notification);
  }
};

// ─── 1. Otomatik Sipariş Teslimi ────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  price: number;
  status: 'pending' | 'delivered' | 'cancelled';
  deliveryInfo?: string; // hesap bilgisi, şifre vb.
  createdAt: string;
  deliveredAt?: string;
  sellerId?: string; // Boşsa sistemindir
  commission?: number; // %10 komisyon tutarı
}

const ORDERS_KEY = 'orders';

export const getOrders = async (): Promise<Order[]> => {
  try {
    const res = await fetch('/api/orders');
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    return data.orders || [];
  } catch {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch { return []; }
  }
};

export const saveOrder = async (order: Order): Promise<void> => {
  // localStorage
  if (typeof window !== 'undefined') {
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      const idx = orders.findIndex((o: Order) => o.id === order.id);
      if (idx >= 0) orders[idx] = order; else orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {}
  }
  // API
  try {
    const all = await getOrders();
    const idx = all.findIndex(o => o.id === order.id);
    if (idx >= 0) all[idx] = order; else all.unshift(order);
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: all }),
    });
  } catch {}
};

export const createOrder = async (
  userId: string,
  username: string,
  product: Product
): Promise<Order> => {
  const order: Order = {
    id: Date.now().toString(),
    userId,
    username,
    productId: product.id,
    productName: product.name,
    price: product.price,
    status: 'pending',
    createdAt: new Date().toISOString(),
    sellerId: product.sellerId, // Satıcının ID'si
    commission: product.isUserListing ? Number((product.price * 0.10).toFixed(2)) : 0, // %10 Komisyon
  };

  let updatedProduct = { ...product, updatedAt: new Date().toISOString() };
  let autoDelivered = false;

  // 1. Dijital Stok Kontrolü ve Otomatik Teslimat
  if (product.digitalStock && product.digitalStock.length > 0) {
    const deliveryInfo = product.digitalStock[0]; // İlk hesabı al
    const remainingDigitalStock = product.digitalStock.slice(1); // Geri kalanı tut
    
    order.status = 'delivered';
    order.deliveryInfo = deliveryInfo;
    order.deliveredAt = new Date().toISOString();
    
    updatedProduct.digitalStock = remainingDigitalStock;
    updatedProduct.stock = remainingDigitalStock.length;
    autoDelivered = true;
  } else {
    // Manuel teslimat için stok düş
    updatedProduct.stock = Math.max(0, product.stock - 1);
  }

  // Siparişi ve Ürünü Kaydet
  await saveOrder(order);
  await saveProduct(updatedProduct);

  // Kullanıcıya bildirim
  if (autoDelivered) {
    // Otomatik teslimat yapıldıysa mail gönder
    await deliverOrder(order.id, order.deliveryInfo!);
  } else {
    // Manuel teslimat ise bildirim gönder
    sendNotificationToUser(userId, {
      type: 'order',
      title: '🛒 Siparişiniz Alındı',
      message: `${product.name} siparişiniz alındı. Teslimat bilgileri hazırlanıyor.`,
    });
  }

  checkStockAlert(updatedProduct);
  return order;
};

export const deliverOrder = async (orderId: string, deliveryInfo: string): Promise<void> => {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.status = 'delivered';
  order.deliveryInfo = deliveryInfo;
  order.deliveredAt = new Date().toISOString();
  await saveOrder(order);

  // Kullanıcıya bildirim
  await sendNotificationToUser(order.userId, {
    type: 'success',
    title: '✅ Siparişiniz Teslim Edildi!',
    message: `${order.productName} ürününüz teslim edildi. Bilgiler: ${deliveryInfo}`,
  });

  // 1. Satıcıya parayı aktar (Komisyon düşüldükten sonra)
  if (order.sellerId) {
    const sellerEarning = order.price - (order.commission || 0);
    await updateUserBalance(order.sellerId, sellerEarning);
    
    // Satıcıya bildirim
    await sendNotificationToUser(order.sellerId, {
      type: 'success',
      title: '💰 Ürününüz Satıldı!',
      message: `${order.productName} başarıyla satıldı. Kazancınız: $${sellerEarning.toFixed(2)} bakiyenize eklendi.`,
    });
  }

  // Kullanıcıya mail gönder
  try {
    const users = getRegisteredUsers();
    const user = users.find(u => u.id === order.userId);
    if (user?.email) {
      await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'delivery',
          to: user.email,
          data: {
            username: order.username,
            productName: order.productName,
            deliveryInfo,
            price: order.price,
          },
        }),
      });
    }
  } catch (e) {
    console.error('Mail gönderilemedi:', e);
  }
};

// ─── 2. Stok Uyarı Otomasyonu ────────────────────────────────────────────────

const STOCK_ALERT_THRESHOLD = 3; // 3 ve altı stok uyarısı

export const checkStockAlert = (product: Product) => {
  if (typeof window === 'undefined') return;

  if (product.stock === 0) {
    // Stok tükendi - ürünü işaretle
    const alert: StockAlert = {
      id: `stock_${product.id}_${Date.now()}`,
      type: 'out_of_stock',
      productId: product.id,
      productName: product.name,
      stock: 0,
      createdAt: new Date().toISOString(),
      read: false,
    };
    saveStockAlert(alert);
  } else if (product.stock <= STOCK_ALERT_THRESHOLD) {
    const alert: StockAlert = {
      id: `stock_${product.id}_${Date.now()}`,
      type: 'low_stock',
      productId: product.id,
      productName: product.name,
      stock: product.stock,
      createdAt: new Date().toISOString(),
      read: false,
    };
    saveStockAlert(alert);
  }
};

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock';
  productId: string;
  productName: string;
  stock: number;
  createdAt: string;
  read: boolean;
}

const STOCK_ALERTS_KEY = 'stockAlerts';

export const getStockAlerts = (): StockAlert[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STOCK_ALERTS_KEY) || '[]');
};

export const saveStockAlert = (alert: StockAlert) => {
  const alerts = getStockAlerts();
  alerts.unshift(alert);
  localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(alerts));
};

export const markStockAlertRead = (id: string) => {
  const alerts = getStockAlerts().map((a) =>
    a.id === id ? { ...a, read: true } : a
  );
  localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(alerts));
};

export const clearStockAlerts = () => {
  localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify([]));
};

export const checkAllStocks = () => {
  const products = getProducts();
  products.forEach(checkStockAlert);
};

// ─── 3. Otomatik Destek Yanıtları ────────────────────────────────────────────

export interface AutoReply {
  id: string;
  keywords: string[];
  response: string;
  active: boolean;
}

const AUTO_REPLIES_KEY = 'autoReplies';

const DEFAULT_AUTO_REPLIES: AutoReply[] = [
  {
    id: '1',
    keywords: ['fiyat', 'ücret', 'kaç para', 'ne kadar'],
    response: 'Ürün fiyatlarımızı /products sayfasından inceleyebilirsiniz. Tüm fiyatlarımız güncel ve rekabetçidir.',
    active: true,
  },
  {
    id: '2',
    keywords: ['teslimat', 'ne zaman', 'kaç dakika', 'süre'],
    response: 'Teslimatlarımız ödeme onayından sonra ortalama 15 dakika içinde gerçekleşmektedir. 7/24 aktif destek ekibimiz her zaman yanınızdadır.',
    active: true,
  },
  {
    id: '3',
    keywords: ['güvenli', 'güvenilir', 'dolandırıcı', 'sahte'],
    response: 'Tüm işlemlerimiz platform güvencesi altında gerçekleşir. 5 yılı aşkın tecrübemiz ve binlerce başarılı işlemimiz bulunmaktadır.',
    active: true,
  },
  {
    id: '4',
    keywords: ['iade', 'geri', 'iptal'],
    response: 'İade ve iptal talepleriniz için destek ekibimiz 7/24 hizmetinizdedir. Sorunuz için en kısa sürede yanıt vereceğiz.',
    active: true,
  },
  {
    id: '5',
    keywords: ['şifre', 'giriş yapamıyorum', 'hesabıma giremiyorum'],
    response: 'Şifre sorunları için /login sayfasındaki "Şifremi Unuttum" seçeneğini kullanabilir veya destek ekibimizle iletişime geçebilirsiniz.',
    active: true,
  },
];

export const getAutoReplies = (): AutoReply[] => {
  if (typeof window === 'undefined') return DEFAULT_AUTO_REPLIES;
  const stored = localStorage.getItem(AUTO_REPLIES_KEY);
  if (!stored) {
    localStorage.setItem(AUTO_REPLIES_KEY, JSON.stringify(DEFAULT_AUTO_REPLIES));
    return DEFAULT_AUTO_REPLIES;
  }
  return JSON.parse(stored);
};

export const saveAutoReplies = (replies: AutoReply[]) => {
  localStorage.setItem(AUTO_REPLIES_KEY, JSON.stringify(replies));
};

export const findAutoReply = (message: string): string | null => {
  const replies = getAutoReplies().filter((r) => r.active);
  const lower = message.toLowerCase();
  for (const reply of replies) {
    if (reply.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return reply.response;
    }
  }
  return null;
};

// ─── 4. Fiyat Güncelleme Otomasyonu ─────────────────────────────────────────

export interface PriceRule {
  id: string;
  name: string;
  type: 'discount' | 'increase';
  value: number; // yüzde
  targetGame?: string; // boşsa tüm ürünler
  targetCategory?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  applied: boolean;
}

const PRICE_RULES_KEY = 'priceRules';

export const getPriceRules = (): PriceRule[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(PRICE_RULES_KEY) || '[]');
};

export const savePriceRule = (rule: PriceRule) => {
  const rules = getPriceRules();
  const idx = rules.findIndex((r) => r.id === rule.id);
  if (idx >= 0) rules[idx] = rule;
  else rules.unshift(rule);
  localStorage.setItem(PRICE_RULES_KEY, JSON.stringify(rules));
};

export const deletePriceRule = (id: string) => {
  const rules = getPriceRules().filter((r) => r.id !== id);
  localStorage.setItem(PRICE_RULES_KEY, JSON.stringify(rules));
};

export const applyPriceRules = async () => {
  const rules = getPriceRules();
  const products = getProducts();
  const now = new Date();
  let changed = false;

  for (const rule of rules) {
    if (!rule.active) continue;
    const start = new Date(rule.startDate);
    const end = new Date(rule.endDate);

    if (now >= start && now <= end && !rule.applied) {
      // Kuralı uygula
      for (const product of products) {
        const matchGame = !rule.targetGame || product.game === rule.targetGame;
        const matchCat = !rule.targetCategory || product.category === rule.targetCategory;
        if (matchGame && matchCat) {
          const multiplier = rule.type === 'discount'
            ? 1 - rule.value / 100
            : 1 + rule.value / 100;
          product.price = Math.round(product.price * multiplier * 100) / 100;
          product.updatedAt = new Date().toISOString();
          await saveProduct(product);
          changed = true;
        }
      }
      rule.applied = true;
      savePriceRule(rule);

      // Admin bildirimi
      sendNotificationToAll({
        type: 'promo',
        title: `🎉 ${rule.name} Başladı!`,
        message: `${rule.type === 'discount' ? '%' + rule.value + ' indirim' : '%' + rule.value + ' fiyat güncellemesi'} uygulandı.`,
      });
    }

    // Süre bittiyse deaktif et
    if (now > end && rule.applied) {
      rule.active = false;
      savePriceRule(rule);
    }
  }

  return changed;
};

// ─── 5. Kullanıcı Aktivite Otomasyonu ────────────────────────────────────────

export const checkInactiveUsers = () => {
  const users = getRegisteredUsers();
  const now = new Date();
  const INACTIVE_DAYS = 7;

  users.forEach((user) => {
    const lastLogin = localStorage.getItem(`lastLogin_${user.id}`);
    if (!lastLogin) return;

    const daysSince = (now.getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= INACTIVE_DAYS) {
      const alreadySent = localStorage.getItem(`inactiveNotif_${user.id}`);
      if (!alreadySent) {
        sendNotificationToUser(user.id, {
          type: 'info',
          title: '👋 Sizi Özledik!',
          message: `${INACTIVE_DAYS} gündür giriş yapmadınız. Yeni ürünlerimizi incelemeye ne dersiniz?`,
        });
        localStorage.setItem(`inactiveNotif_${user.id}`, 'true');
      }
    } else {
      localStorage.removeItem(`inactiveNotif_${user.id}`);
    }
  });
};

export const sendWelcomeNotification = (userId: string, username: string) => {
  sendNotificationToUser(userId, {
    type: 'success',
    title: `🎮 Hoş Geldin, ${username}!`,
    message: 'Game Shop ailesine katıldığın için teşekkürler! İlk alışverişinde %10 indirim için HOSGELDIN kodunu kullan.',
  });
};

export const updateLastLogin = (userId: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`lastLogin_${userId}`, new Date().toISOString());
};

// ─── 6. İlan Süresi Kontrolü ────────────────────────────────────────────────

export const checkExpiredListings = async () => {
  const products = getProducts();
  const now = new Date();
  let changed = false;

  for (const product of products) {
    // Sadece aktif kullanıcı ilanlarını kontrol et
    if (product.isUserListing && product.status === 'active' && product.expiryDate) {
      const expiry = new Date(product.expiryDate);
      if (now > expiry) {
        product.status = 'expired';
        product.updatedAt = now.toISOString();
        await saveProduct(product);
        changed = true;

        // Satıcıya bildir
        if (product.sellerId) {
          sendNotificationToUser(product.sellerId, {
            type: 'warning',
            title: '⏰ İlanınızın Süresi Doldu',
            message: `"${product.name}" ilanınızın 7 günlük süresi dolduğu için yayından kaldırıldı. Tekrar listeleyebilirsiniz.`,
          });
        }
      }
    }
  }
  return changed;
};

// ─── Otomasyon Motoru (Periyodik Kontrol) ────────────────────────────────────

export const runAutomationEngine = () => {
  if (typeof window === 'undefined') return;

  // Stok kontrolü
  checkAllStocks();

  // Fiyat kuralları
  applyPriceRules();

  // İnaktif kullanıcı kontrolü
  checkInactiveUsers();

  // Süresi dolan ilanları kontrol et (7 gün kuralı)
  checkExpiredListings();
};

'use client';

import { useState, useEffect } from 'react';
import {
  FaRobot, FaShoppingCart, FaBoxOpen, FaCommentDots,
  FaTags, FaUserClock, FaPlay, FaTrash, FaPlus, FaCheck,
  FaBell, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import AnimatedButton from '@/components/AnimatedButton';
import {
  getOrders, deliverOrder, Order,
  getStockAlerts, markStockAlertRead, clearStockAlerts, StockAlert,
  getAutoReplies, saveAutoReplies, AutoReply,
  getPriceRules, savePriceRule, deletePriceRule, applyPriceRules, PriceRule,
  runAutomationEngine, sendNotificationToAll,
} from '@/lib/automation';
import { getProducts } from '@/lib/products';

type Tab = 'orders' | 'stock' | 'autoreplies' | 'pricing' | 'activity';

export default function AutomationPage() {
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<Record<string, string>>({});
  const [newReply, setNewReply] = useState({ keywords: '', response: '' });
  const [newRule, setNewRule] = useState<Partial<PriceRule>>({
    type: 'discount', value: 10, active: true, applied: false,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
  });
  const [games, setGames] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const load = async () => {
    setOrders(await getOrders());
    setStockAlerts(getStockAlerts());
    setAutoReplies(getAutoReplies());
    setPriceRules(getPriceRules());
  };

  useEffect(() => {
    load();
    const products = getProducts();
    setGames(Array.from(new Set(products.map(p => p.game))));
    setCategories(Array.from(new Set(products.map(p => p.category))));
    // Her 5 saniyede yenile
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeliver = async (orderId: string) => {
    const info = deliveryInfo[orderId];
    if (!info?.trim()) { alert('Teslimat bilgisi girin!'); return; }
    await deliverOrder(orderId, info);
    await load();
  };

  // ── Stok Uyarıları ──────────────────────────────────────────────────────────
  const handleMarkRead = (id: string) => { markStockAlertRead(id); load(); };
  const handleClearAlerts = () => { clearStockAlerts(); load(); };

  // ── Otomatik Yanıtlar ───────────────────────────────────────────────────────
  const handleAddReply = () => {
    if (!newReply.keywords || !newReply.response) return;
    const reply: AutoReply = {
      id: Date.now().toString(),
      keywords: newReply.keywords.split(',').map(k => k.trim()),
      response: newReply.response,
      active: true,
    };
    const updated = [...autoReplies, reply];
    saveAutoReplies(updated);
    setAutoReplies(updated);
    setNewReply({ keywords: '', response: '' });
  };

  const handleToggleReply = (id: string) => {
    const updated = autoReplies.map(r => r.id === id ? { ...r, active: !r.active } : r);
    saveAutoReplies(updated);
    setAutoReplies(updated);
  };

  const handleDeleteReply = (id: string) => {
    const updated = autoReplies.filter(r => r.id !== id);
    saveAutoReplies(updated);
    setAutoReplies(updated);
  };

  // ── Fiyat Kuralları ─────────────────────────────────────────────────────────
  const handleAddRule = () => {
    if (!newRule.name || !newRule.value) return;
    const rule: PriceRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      type: newRule.type as 'discount' | 'increase',
      value: Number(newRule.value),
      targetGame: newRule.targetGame || undefined,
      targetCategory: newRule.targetCategory || undefined,
      startDate: newRule.startDate!,
      endDate: newRule.endDate!,
      active: true,
      applied: false,
    };
    savePriceRule(rule);
    load();
    setNewRule({
      type: 'discount', value: 10, active: true, applied: false,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    });
  };

  const handleApplyNow = async () => {
    await applyPriceRules();
    load();
    alert('Fiyat kuralları uygulandı!');
  };

  const handleDeleteRule = (id: string) => { deletePriceRule(id); load(); };

  // ── Aktivite ────────────────────────────────────────────────────────────────
  const handleRunEngine = () => {
    runAutomationEngine();
    alert('Otomasyon motoru çalıştırıldı!');
  };

  const handleSendWelcomeAll = () => {
    sendNotificationToAll({
      type: 'promo',
      title: '🎮 Özel Kampanya!',
      message: 'Tüm ürünlerde özel fırsatlar sizi bekliyor. Hemen inceleyin!',
    });
    alert('Tüm kullanıcılara bildirim gönderildi!');
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: 'orders', label: 'Siparişler', icon: FaShoppingCart, badge: orders.filter(o => o.status === 'pending').length },
    { key: 'stock', label: 'Stok Uyarıları', icon: FaBoxOpen, badge: stockAlerts.filter(a => !a.read).length },
    { key: 'autoreplies', label: 'Otomatik Yanıtlar', icon: FaCommentDots },
    { key: 'pricing', label: 'Fiyat Kuralları', icon: FaTags },
    { key: 'activity', label: 'Aktivite', icon: FaUserClock },
  ];

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";
  const cardCls = "animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] border border-white/10 rounded-2xl p-6";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-4">
            <FaRobot /> Otomasyon
          </h1>
          <p className="text-gray-400 text-lg">Tüm otomatik işlemleri buradan yönetin</p>
        </div>
        <AnimatedButton onClick={handleRunEngine} className="px-6 py-3">
          <div className="flex items-center gap-2"><FaPlay /> Motoru Çalıştır</div>
        </AnimatedButton>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all relative ${
              tab === t.key
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            <t.icon />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Siparişler ── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className={`${cardCls} text-center py-12`}>
              <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Henüz sipariş yok</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className={cardCls}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-white text-lg">{order.productName}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status === 'pending' ? 'Bekliyor' : order.status === 'delivered' ? 'Teslim Edildi' : 'İptal'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Kullanıcı: <span className="text-white">{order.username}</span></p>
                  <p className="text-gray-400 text-sm">Fiyat: <span className="text-blue-400 font-bold">${order.price}</span></p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                  {order.deliveryInfo && (
                    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-xs text-green-400 font-semibold mb-1">Teslimat Bilgisi:</p>
                      <p className="text-sm text-gray-300">{order.deliveryInfo}</p>
                    </div>
                  )}
                </div>
                {order.status === 'pending' && (
                  <div className="flex flex-col gap-2 min-w-[220px]">
                    <input
                      value={deliveryInfo[order.id] || ''}
                      onChange={e => setDeliveryInfo(prev => ({ ...prev, [order.id]: e.target.value }))}
                      placeholder="Hesap bilgisi, şifre vb."
                      className={inputCls}
                    />
                    <AnimatedButton onClick={() => handleDeliver(order.id)} className="py-2">
                      <div className="flex items-center justify-center gap-2"><FaCheck /> Teslim Et</div>
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Stok Uyarıları ── */}
      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <AnimatedButton onClick={handleClearAlerts} className="px-4 py-2 text-sm">
              <div className="flex items-center gap-2"><FaTrash /> Tümünü Temizle</div>
            </AnimatedButton>
          </div>
          {stockAlerts.length === 0 ? (
            <div className={`${cardCls} text-center py-12`}>
              <FaBoxOpen className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Stok uyarısı yok</p>
            </div>
          ) : stockAlerts.map(alert => (
            <div key={alert.id} className={`${cardCls} ${alert.read ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${alert.type === 'out_of_stock' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                    <FaBoxOpen className={`text-2xl ${alert.type === 'out_of_stock' ? 'text-red-400' : 'text-yellow-400'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{alert.productName}</p>
                    <p className={`text-sm font-semibold ${alert.type === 'out_of_stock' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {alert.type === 'out_of_stock' ? '🔴 Stok Tükendi' : `⚠️ Düşük Stok: ${alert.stock} adet kaldı`}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
                {!alert.read && (
                  <AnimatedButton onClick={() => handleMarkRead(alert.id)} className="px-4 py-2 text-sm">
                    <FaCheck />
                  </AnimatedButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Otomatik Yanıtlar ── */}
      {tab === 'autoreplies' && (
        <div className="space-y-6">
          {/* Yeni ekle */}
          <div className={cardCls}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPlus className="text-blue-400" /> Yeni Otomatik Yanıt</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Anahtar Kelimeler (virgülle ayır)</label>
                <input value={newReply.keywords} onChange={e => setNewReply(p => ({ ...p, keywords: e.target.value }))}
                  placeholder="fiyat, ücret, kaç para" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Otomatik Yanıt</label>
                <input value={newReply.response} onChange={e => setNewReply(p => ({ ...p, response: e.target.value }))}
                  placeholder="Yanıt metni..." className={inputCls} />
              </div>
            </div>
            <AnimatedButton onClick={handleAddReply} className="mt-4 px-6 py-3">
              <div className="flex items-center gap-2"><FaPlus /> Ekle</div>
            </AnimatedButton>
          </div>

          {/* Liste */}
          {autoReplies.map(reply => (
            <div key={reply.id} className={`${cardCls} ${!reply.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {reply.keywords.map(kw => (
                      <span key={kw} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{kw}</span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm">{reply.response}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleReply(reply.id)} className="text-2xl">
                    {reply.active ? <FaToggleOn className="text-green-400" /> : <FaToggleOff className="text-gray-500" />}
                  </button>
                  <AnimatedButton onClick={() => handleDeleteReply(reply.id)} className="px-3 py-2 text-sm">
                    <FaTrash />
                  </AnimatedButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fiyat Kuralları ── */}
      {tab === 'pricing' && (
        <div className="space-y-6">
          <div className={cardCls}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPlus className="text-blue-400" /> Yeni Fiyat Kuralı</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Kural Adı</label>
                <input value={newRule.name || ''} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
                  placeholder="Yaz İndirimi" className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tür</label>
                <select value={newRule.type} onChange={e => setNewRule(p => ({ ...p, type: e.target.value as any }))} className={inputCls}>
                  <option value="discount">İndirim (%)</option>
                  <option value="increase">Artış (%)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Yüzde</label>
                <input type="number" value={newRule.value} onChange={e => setNewRule(p => ({ ...p, value: Number(e.target.value) }))}
                  min={1} max={99} className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Oyun (boşsa tümü)</label>
                <select value={newRule.targetGame || ''} onChange={e => setNewRule(p => ({ ...p, targetGame: e.target.value }))} className={inputCls}>
                  <option value="">Tüm Oyunlar</option>
                  {games.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Başlangıç</label>
                <input type="datetime-local" value={newRule.startDate} onChange={e => setNewRule(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bitiş</label>
                <input type="datetime-local" value={newRule.endDate} onChange={e => setNewRule(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <AnimatedButton onClick={handleAddRule} className="px-6 py-3">
                <div className="flex items-center gap-2"><FaPlus /> Kural Ekle</div>
              </AnimatedButton>
              <AnimatedButton onClick={handleApplyNow} className="px-6 py-3">
                <div className="flex items-center gap-2"><FaPlay /> Şimdi Uygula</div>
              </AnimatedButton>
            </div>
          </div>

          {priceRules.length === 0 ? (
            <div className={`${cardCls} text-center py-12`}>
              <FaTags className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Henüz fiyat kuralı yok</p>
            </div>
          ) : priceRules.map(rule => (
            <div key={rule.id} className={`${cardCls} ${!rule.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white text-lg">{rule.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${rule.type === 'discount' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {rule.type === 'discount' ? `-%${rule.value}` : `+%${rule.value}`}
                    </span>
                    {rule.applied && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Uygulandı</span>}
                    {!rule.active && <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Pasif</span>}
                  </div>
                  <p className="text-sm text-gray-400">
                    {rule.targetGame || 'Tüm oyunlar'} • {new Date(rule.startDate).toLocaleDateString('tr-TR')} - {new Date(rule.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <AnimatedButton onClick={() => handleDeleteRule(rule.id)} className="px-4 py-2 text-sm">
                  <FaTrash />
                </AnimatedButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Aktivite ── */}
      {tab === 'activity' && (
        <div className="space-y-4">
          <div className={cardCls}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaUserClock className="text-blue-400" /> Kullanıcı Aktivite Otomasyonu</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FaBell className="text-yellow-400 text-2xl" />
                  <div>
                    <p className="font-semibold text-white">İnaktif Kullanıcı Bildirimi</p>
                    <p className="text-xs text-gray-400">7 gün giriş yapmayan kullanıcılara otomatik bildirim</p>
                  </div>
                </div>
                <AnimatedButton onClick={() => { runAutomationEngine(); alert('İnaktif kullanıcı kontrolü yapıldı!'); }} className="w-full py-3">
                  <div className="flex items-center justify-center gap-2"><FaPlay /> Kontrol Et</div>
                </AnimatedButton>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FaBell className="text-blue-400 text-2xl" />
                  <div>
                    <p className="font-semibold text-white">Toplu Kampanya Bildirimi</p>
                    <p className="text-xs text-gray-400">Tüm kullanıcılara kampanya bildirimi gönder</p>
                  </div>
                </div>
                <AnimatedButton onClick={handleSendWelcomeAll} className="w-full py-3">
                  <div className="flex items-center justify-center gap-2"><FaBell /> Gönder</div>
                </AnimatedButton>
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h2 className="text-xl font-bold mb-4">Otomasyon Motoru</h2>
            <p className="text-gray-400 mb-4 text-sm">
              Tüm otomasyon kurallarını tek seferde çalıştırır: stok kontrolü, fiyat kuralları, inaktif kullanıcı bildirimleri.
            </p>
            <AnimatedButton onClick={handleRunEngine} className="px-8 py-4 text-lg">
              <div className="flex items-center gap-3"><FaRobot /> Tüm Otomasyonu Çalıştır</div>
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  );
}

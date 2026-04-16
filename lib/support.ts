import { SupportMessage } from '@/types/support';

const SUPPORT_STORAGE_KEY = 'supportMessages';

export const getSupportMessages = async (): Promise<SupportMessage[]> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const response = await fetch('/api/support');
    if (!response.ok) throw new Error('API hatası');
    const data = await response.json();
    const messages = data.messages || [];
    
    // Sync with localStorage as a backup
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(messages));
    return messages;
  } catch (error) {
    console.error('Destek mesajları sunucudan alınamadı, yerel depo kullanılıyor:', error);
    const messages = localStorage.getItem(SUPPORT_STORAGE_KEY);
    return messages ? JSON.parse(messages) : [];
  }
};

export const saveSupportMessage = async (message: SupportMessage): Promise<void> => {
  // 1. Önce sunucuya gönder
  try {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) throw new Error('Mesaj gönderilemedi');
    
    // 2. Başarılıysa yerel depoyu da güncelle
    const messages = await getSupportMessages();
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Mesaj gönderilirken hata oluştu:', error);
    // Hata olsa bile kullanıcı kendi mesajını görsün diye geçici olarak ekleyebiliriz
    const local = localStorage.getItem(SUPPORT_STORAGE_KEY);
    const messages = local ? JSON.parse(local) : [];
    messages.unshift(message);
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(messages));
  }
};

export const updateSupportMessage = async (id: string, updates: Partial<SupportMessage>): Promise<void> => {
  // Sunucudaki tüm mesajları al
  const messages = await getSupportMessages();
  const index = messages.findIndex(m => m.id === id);
  
  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    
    try {
      const response = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      
      if (response.ok) {
        localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Mesaj güncellenirken hata:', error);
    }
  }
};

export const deleteSupportMessage = async (id: string): Promise<void> => {
  const currentMessages = await getSupportMessages();
  const messages = currentMessages.filter(m => m.id !== id);

  try {
    const response = await fetch('/api/support', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (response.ok) {
      localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
  }
};

export const getUserMessages = async (userId: string): Promise<SupportMessage[]> => {
  const allMessages = await getSupportMessages();
  return allMessages.filter(m => m.userId === userId);
};

export const getPendingMessagesCount = async (): Promise<number> => {
  const allMessages = await getSupportMessages();
  return allMessages.filter(m => m.status === 'pending').length;
};

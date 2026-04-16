// Bakiye yönetimi

const USERS_KEY = 'registeredUsers';

const getLocalUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
};

const saveLocalUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const pushUsersToAPI = async (users: any[]) => {
  try {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    });
  } catch (e) {
    console.error('API yazma hatası:', e);
  }
};

export const getUserBalance = (userId: string): number => {
  const users = getLocalUsers();
  const user = users.find((u: any) => u.id === userId);
  return user?.balance ?? 0;
};

export const addBalance = async (userId: string, amount: number): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // Direkt localStorage'dan çalış, API'den çekme
  const users = getLocalUsers();
  const idx = users.findIndex((u: any) => u.id === userId);
  if (idx === -1) return false;

  users[idx].balance = (users[idx].balance ?? 0) + amount;

  // localStorage güncelle
  saveLocalUsers(users);

  // currentUser güncelle
  try {
    const currentStr = localStorage.getItem('currentUser');
    if (currentStr) {
      const current = JSON.parse(currentStr);
      if (current?.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(users[idx]));
      }
    }
  } catch {}

  // API'ye yaz
  await pushUsersToAPI(users);

  return true;
};

export const deductBalance = async (userId: string, amount: number): Promise<{ success: boolean; message: string }> => {
  if (typeof window === 'undefined') return { success: false, message: 'Sunucu tarafında işlem yapılamaz' };

  const users = getLocalUsers();
  const idx = users.findIndex((u: any) => u.id === userId);
  if (idx === -1) return { success: false, message: 'Kullanıcı bulunamadı' };

  const balance = users[idx].balance ?? 0;
  if (balance < amount) return { success: false, message: `Yetersiz bakiye! Bakiyeniz: $${balance.toFixed(2)}` };

  users[idx].balance = balance - amount;
  users[idx].totalOrders = (users[idx].totalOrders ?? 0) + 1;
  users[idx].totalSpent = (users[idx].totalSpent ?? 0) + amount;

  saveLocalUsers(users);

  try {
    const currentStr = localStorage.getItem('currentUser');
    if (currentStr) {
      const current = JSON.parse(currentStr);
      if (current?.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(users[idx]));
      }
    }
  } catch {}

  await pushUsersToAPI(users);

  return { success: true, message: 'Bakiye düşüldü' };
};

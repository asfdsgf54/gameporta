import { User, RegisterData } from '@/types/user';

// Admin authentication helper functions

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuth') === 'true';
};

export const getAdminUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminUser');
};

export const adminLogin = (username: string, password: string): boolean => {
  // Şimdilik basit kontrol, sonra backend'e bağlanabilir
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminUser', username);
    
    // Cookie set et (middleware için) - SameSite ve Secure ekle
    document.cookie = `adminAuth=true; path=/; max-age=86400; SameSite=Lax`;
    return true;
  }
  return false;
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('adminUser');
  
  // Cookie sil
  document.cookie = 'adminAuth=; path=/; max-age=0; SameSite=Lax';
};

// User registration and authentication functions

const USERS_STORAGE_KEY = 'registeredUsers';

export const getRegisteredUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

export const registerUser = (data: RegisterData): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Sunucu tarafında kayıt yapılamaz' };
  }

  const users = getRegisteredUsers();

  // Kullanıcı adı kontrolü
  if (users.some(user => user.username === data.username)) {
    return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' };
  }

  // Email kontrolü
  if (users.some(user => user.email === data.email)) {
    return { success: false, message: 'Bu email adresi zaten kayıtlı' };
  }

  // Şifre eşleşme kontrolü
  if (data.password !== data.confirmPassword) {
    return { success: false, message: 'Şifreler eşleşmiyor' };
  }

  // Yeni kullanıcı oluştur
  const newUser: User = {
    id: Date.now().toString(),
    username: data.username,
    email: data.email,
    password: data.password, // Gerçek uygulamada hash'lenmeli
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Kayıt başarılı!' };
};

export const userLogin = (username: string, password: string): { success: boolean; message: string; user?: User; isAdmin?: boolean } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Sunucu tarafında giriş yapılamaz' };
  }

  // Admin kontrolü
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminUser', username);
    document.cookie = `adminAuth=true; path=/; max-age=86400; SameSite=Lax`;
    
    return { success: true, message: 'Admin girişi başarılı!', isAdmin: true };
  }

  // Normal kullanıcı kontrolü
  const users = getRegisteredUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem('userAuth', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    document.cookie = `userAuth=true; path=/; max-age=86400; SameSite=Lax`;
    
    return { success: true, message: 'Giriş başarılı!', user, isAdmin: false };
  }

  return { success: false, message: 'Kullanıcı adı veya şifre hatalı!' };
};

export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('userAuth') === 'true';
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const userLogout = (): void => {
  localStorage.removeItem('userAuth');
  localStorage.removeItem('currentUser');
  document.cookie = 'userAuth=; path=/; max-age=0; SameSite=Lax';
};

// Profile update functions

export const updateUserProfile = (userId: string, updates: Partial<User>): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Sunucu tarafında güncelleme yapılamaz' };
  }

  const users = getRegisteredUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: 'Kullanıcı bulunamadı' };
  }

  // Email değişikliği kontrolü
  if (updates.email && updates.email !== users[userIndex].email) {
    const emailExists = users.some((u, idx) => idx !== userIndex && u.email === updates.email);
    if (emailExists) {
      return { success: false, message: 'Bu email adresi zaten kullanılıyor' };
    }
  }

  // Kullanıcı adı değişikliği kontrolü
  if (updates.username && updates.username !== users[userIndex].username) {
    const usernameExists = users.some((u, idx) => idx !== userIndex && u.username === updates.username);
    if (usernameExists) {
      return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' };
    }
  }

  // Kullanıcıyı güncelle
  users[userIndex] = { ...users[userIndex], ...updates };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Mevcut kullanıcı bilgisini güncelle
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
  }

  return { success: true, message: 'Profil başarıyla güncellendi!' };
};

export const changePassword = (userId: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Sunucu tarafında işlem yapılamaz' };
  }

  const users = getRegisteredUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, message: 'Kullanıcı bulunamadı' };
  }

  // Mevcut şifre kontrolü
  if (user.password !== currentPassword) {
    return { success: false, message: 'Mevcut şifre hatalı' };
  }

  // Yeni şifre uzunluk kontrolü
  if (newPassword.length < 6) {
    return { success: false, message: 'Yeni şifre en az 6 karakter olmalı' };
  }

  // Şifreyi güncelle
  user.password = newPassword;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Mevcut kullanıcı bilgisini güncelle
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  return { success: true, message: 'Şifre başarıyla değiştirildi!' };
};

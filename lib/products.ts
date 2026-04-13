import { Product } from '@/types/product';

// Şimdilik localStorage kullanıyoruz, sonra backend'e geçeriz
export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem('products', JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(products));
};

export const getProductById = (id: string): Product | undefined => {
  return getProducts().find(p => p.id === id);
};

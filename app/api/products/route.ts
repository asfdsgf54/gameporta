import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';

// GET - Ürünleri oku
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: { products: Product[] } = JSON.parse(fileContents);
    
    // Güvenlik: digitalStock bilgisini client'a göndermiyoruz
    const maskedProducts = data.products.map(p => {
      const { digitalStock, ...rest } = p;
      return rest;
    });

    return NextResponse.json({ products: maskedProducts });
  } catch (error) {
    return NextResponse.json({ products: [] });
  }
}

// POST - Yeni ürün ekle
export async function POST(request: Request) {
  try {
    const newProduct: Product = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    // Mevcut ürünleri oku
    let data: { products: Product[] } = { products: [] };
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(fileContents) as { products: Product[] };
    } catch (error) {
      // Dosya yoksa boş array
    }
    
    // Yeni ürünü ekle
    data.products.push(newProduct);
    
    // Dosyaya yaz
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ürün kaydedilemedi' }, { status: 500 });
  }
}

// PUT - Ürünleri güncelle (toplu)
export async function PUT(request: Request) {
  try {
    const { products } = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    await fs.writeFile(filePath, JSON.stringify({ products }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ürünler güncellenemedi' }, { status: 500 });
  }
}

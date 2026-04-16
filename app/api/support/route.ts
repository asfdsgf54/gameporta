import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SupportMessage } from '@/types/support';

// GET - Destek mesajlarını oku
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'support.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}

// POST - Yeni destek mesajı ekle
export async function POST(request: Request) {
  try {
    const newMessage: SupportMessage = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'support.json');
    
    // Mevcut mesajları oku
    let data: { messages: SupportMessage[] } = { messages: [] };
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(fileContents) as { messages: SupportMessage[] };
    } catch (error) {
      // Dosya yoksa boş array
    }
    
    // Yeni mesajı başa ekle
    data.messages.unshift(newMessage);
    
    // Dosyaya yaz
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Mesaj kaydedilemedi' }, { status: 500 });
  }
}

// PUT - Mesajları güncelle (toplu)
export async function PUT(request: Request) {
  try {
    const { messages } = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'support.json');
    
    await fs.writeFile(filePath, JSON.stringify({ messages }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Mesajlar güncellenemedi' }, { status: 500 });
  }
}

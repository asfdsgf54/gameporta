import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types/user';

// GET - Kullanıcıları oku
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ users: [] });
  }
}

// POST - Yeni kullanıcı ekle
export async function POST(request: Request) {
  try {
    const newUser: User = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    
    // Mevcut kullanıcıları oku
    let data: { users: User[] } = { users: [] };
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(fileContents) as { users: User[] };
    } catch (error) {
      // Dosya yoksa boş array
    }
    
    // Yeni kullanıcıyı ekle
    data.users.push(newUser);
    
    // Dosyaya yaz
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Kullanıcı kaydedilemedi' }, { status: 500 });
  }
}

// PUT - Kullanıcıları güncelle (toplu)
export async function PUT(request: Request) {
  try {
    const { users } = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    
    await fs.writeFile(filePath, JSON.stringify({ users }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Kullanıcılar güncellenemedi' }, { status: 500 });
  }
}

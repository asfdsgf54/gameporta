import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types/user';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: { users: User[] } = JSON.parse(fileContents);

    const userIndex = data.users.findIndex(u => u.email === email && u.verificationToken === token);

    if (userIndex === -1) {
      return NextResponse.redirect(`${new URL(request.url).origin}/login?error=invalid_token`);
    }

    // Kullanıcıyı doğrula
    data.users[userIndex].isVerified = true;
    delete data.users[userIndex].verificationToken;

    // Dosyaya kaydet
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    // Giriş sayfasına yönlendir
    return NextResponse.redirect(`${new URL(request.url).origin}/login?verified=true`);
  } catch (error) {
    console.error('Doğrulama hatası:', error);
    return NextResponse.json({ error: 'Sistem hatası' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'notifications.json');

const readData = async () => {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch {
    return { notifications: {} }; // { userId: [...] }
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const data = await readData();
  if (userId) {
    return NextResponse.json({ notifications: data.notifications[userId] || [] });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { userId, notification } = await request.json();
    const data = await readData();
    if (!data.notifications[userId]) data.notifications[userId] = [];
    data.notifications[userId].unshift(notification);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, notifications } = await request.json();
    const data = await readData();
    data.notifications[userId] = notifications;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

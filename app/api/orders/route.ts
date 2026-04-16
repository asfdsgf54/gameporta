import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'orders.json');

const readOrders = async () => {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch {
    return { orders: [] };
  }
};

export async function GET() {
  const data = await readOrders();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const data = await readOrders();
    data.orders.unshift(newOrder);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { orders } = await request.json();
    await fs.writeFile(filePath, JSON.stringify({ orders }, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

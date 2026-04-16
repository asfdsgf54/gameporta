import { NextResponse } from 'next/server';
import { sendMail, deliveryMailTemplate, welcomeMailTemplate, verificationMailTemplate } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    let html = '';
    let subject = '';

    if (type === 'delivery') {
      subject = `✅ Siparişiniz Teslim Edildi — ${data.productName}`;
      html = deliveryMailTemplate(data.username, data.productName, data.deliveryInfo, data.price);
    } else if (type === 'welcome') {
      subject = `🎮 Game Shop'a Hoş Geldin, ${data.username}!`;
      html = welcomeMailTemplate(data.username);
    } else if (type === 'verify') {
      subject = `📧 Hesabınızı Doğrulayın — Game Shop`;
      html = verificationMailTemplate(data.username, data.link);
    } else {
      return NextResponse.json({ success: false, message: 'Geçersiz mail tipi' }, { status: 400 });
    }

    const result = await sendMail({ to, subject, html });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

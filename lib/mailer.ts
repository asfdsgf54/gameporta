import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Gmail için SSL (465) kullanımı önerilir
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    // Local development ortamında sertifika hatalarını görmezden gelmek için
    rejectUnauthorized: false
  }
});

// Bağlantıyı doğrula (Başlangıçta log verelim)
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((error: any, success: any) => {
    if (error) {
      console.error('❌ SMTP Bağlantı Hatası:', error.message);
    } else {
      console.log('✅ SMTP Sunucusu hazır!');
    }
  });
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions): Promise<{ success: boolean; message: string }> => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error('GMAIL_USER veya GMAIL_APP_PASSWORD tanımlı değil!');
    }

    console.log(`📧 Mail gönderiliyor: ${options.to} - Konu: ${options.subject}`);
    
    const info = await transporter.sendMail({
      from: `"Game Shop" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('✅ Mail başarıyla gönderildi:', info.messageId);
    return { success: true, message: 'Mail gönderildi' };
  } catch (error: any) {
    console.error('❌ Mail gönderme hatası detayı:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return { success: false, message: error.message };
  }
};

// ── Mail Şablonları ──────────────────────────────────────────────────────────

export const deliveryMailTemplate = (
  username: string,
  productName: string,
  deliveryInfo: string,
  price: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #050505; color: #ffffff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: 900; background: linear-gradient(to right, #60a5fa, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
    .card { background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to right, #3b82f6, #06b6d4); }
    .badge { display: inline-block; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
    .title { font-size: 28px; font-weight: 800; color: #ffffff; margin-bottom: 12px; line-height: 1.2; }
    .subtitle { color: #9ca3af; font-size: 16px; margin-bottom: 32px; line-height: 1.5; }
    .product-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; border-top: 1px solid #222222; border-bottom: 1px solid #222222; margin-bottom: 32px; }
    .product-name { font-weight: 700; color: #fff; }
    .product-price { font-weight: 700; color: #60a5fa; }
    .info-box { background: #0a0a0a; border: 1px solid #333333; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: left; }
    .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-weight: 700; }
    .info-value { font-size: 20px; font-weight: 800; color: #22d3ee; font-family: 'Courier New', Courier, monospace; word-break: break-all; background: rgba(34, 211, 238, 0.05); padding: 12px; border-radius: 8px; border: 1px dashed rgba(34, 211, 238, 0.3); }
    .warning-box { font-size: 13px; color: #f87171; background: rgba(248, 113, 113, 0.05); border-radius: 12px; padding: 16px; margin-top: 24px; display: flex; align-items: center; gap: 10px; }
    .footer { text-align: center; color: #4b5563; font-size: 12px; margin-top: 40px; }
    .button { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 20px; transition: background 0.2s; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GAMEPORTA</div>
    </div>

    <div class="card">
      <div class="badge">Sipariş Teslim Edildi</div>
      <div class="title">Tebrikler ${username}!</div>
      <p class="subtitle">Yeni oyun hesabın hazır! Onu senin için aşağıya bıraktık. İyi oyunlar dileriz.</p>

      <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color: #9ca3af; font-size: 14px;">Ürün:</td>
            <td align="right" style="color: #ffffff; font-weight: 700;">${productName}</td>
          </tr>
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding-top: 8px;">Tutar:</td>
            <td align="right" style="color: #60a5fa; font-weight: 700; padding-top: 8px;">$${price}</td>
          </tr>
        </table>
      </div>

      <div class="info-box">
        <div class="info-label">🔑 Hesap Bilgileri</div>
        <div class="info-value">${deliveryInfo}</div>
      </div>

      <div class="warning-box">
        <span>⚠️</span>
        <span>Lütfen güvenlik için giriş yaptıktan sonra şifrenizi güncellemeyi unutmayın.</span>
      </div>
      
      <div style="text-align: center; margin-top: 32px; border-top: 1px solid #222222; pt: 32px;">
        <p style="color: #6b7280; font-size: 14px;">Bir sorun mu var? Biz buradayız.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" class="button">Destek Al →</a>
      </div>
    </div>

    <div class="footer">
      <p>© 2024 GamePorta. Profesyonel Dijital Oyun Servisleri.</p>
      <p style="margin-top: 8px;">Bu e-posta güvenli sunucularımız tarafından otomatik olarak oluşturulmuştur.</p>
    </div>
  </div>
</body>
</html>
`;

export const welcomeMailTemplate = (username: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 32px; font-weight: bold; text-align: center; color: #60a5fa; }
    .card { background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 16px; padding: 32px; margin: 24px 0; }
    .footer { text-align: center; color: #4b5563; font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎮 Game Shop</div>
    <div class="card">
      <h2 style="color: #60a5fa;">Hoş Geldin, ${username}! 🎉</h2>
      <p style="color: #9ca3af;">Game Shop ailesine katıldığın için teşekkürler!</p>
      <p style="color: #9ca3af;">İlk alışverişinde <strong style="color: #22d3ee;">%10 indirim</strong> için <strong style="color: #22d3ee;">HOSGELDIN</strong> kodunu kullan.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products" style="display: inline-block; margin-top: 20px; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Ürünleri İncele →</a>
    </div>
    <div class="footer"><p>© 2024 Game Shop</p></div>
  </div>
</body>
</html>
`;

export const verificationMailTemplate = (username: string, verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .icon { font-size: 48px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; color: #fff; margin-bottom: 16px; }
    .text { color: #9ca3af; line-height: 1.6; margin-bottom: 32px; }
    .button { display: inline-block; background: linear-gradient(to right, #3b82f6, #2563eb); color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; transition: transform 0.2s; }
    .footer { text-align: center; color: #4b5563; font-size: 12px; margin-top: 40px; }
    .link-alt { margin-top: 24px; font-size: 11px; color: #374151; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎮 Game Shop</div>
    </div>
    <div class="card">
      <div class="icon">📧</div>
      <div class="title">E-posta Adresini Doğrula</div>
      <p class="text">
        Merhaba <strong>${username}</strong>,<br>
        Game Shop'a hoş geldin! Hesabını aktifleştirmek ve güvenli alışverişe başlamak için lütfen aşağıdaki butona tıklayarak e-posta adresini doğrula.
      </p>
      <a href="${verificationLink}" class="button">E-postayı Doğrula</a>
      <div class="link-alt">
        Buton çalışmıyorsa bu linki tarayıcına yapıştırabilirsin:<br>
        ${verificationLink}
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Game Shop. Tüm hakları saklıdır.</p>
      <p>Bu maili siz talep etmediyseniz lütfen dikkate almayın.</p>
    </div>
  </div>
</body>
</html>
`;

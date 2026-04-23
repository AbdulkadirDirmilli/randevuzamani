import { Resend } from "resend";

// Lazy initialization to avoid build errors when API key is not set
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "bildirim@fiyattakip.com";
const SITE_NAME = "Fiyat Takip";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fiyattakip.com";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const client = getResendClient();

    if (!client) {
      console.warn("Email service not configured - RESEND_API_KEY is missing");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await client.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Email templates
export function getPriceDropEmailHtml(
  userName: string,
  productName: string,
  oldPrice: number,
  newPrice: number,
  productSlug: string
) {
  const percentDrop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  const productUrl = `${BASE_URL}/urunler/${productSlug}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiyat Düştü!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #22c55e; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Fiyat Düştü!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Merhaba ${userName || "Değerli Müşterimiz"},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Favori listenizde bulunan <strong>${productName}</strong> ürününün fiyatı düştü!
              </p>
              <!-- Price Box -->
              <table role="presentation" style="width: 100%; background-color: #f0fdf4; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-decoration: line-through;">
                      Eski Fiyat: ${oldPrice.toLocaleString("tr-TR")} TL
                    </p>
                    <p style="margin: 0 0 10px; color: #16a34a; font-size: 28px; font-weight: bold;">
                      ${newPrice.toLocaleString("tr-TR")} TL
                    </p>
                    <p style="margin: 0; background-color: #22c55e; color: #ffffff; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                      %${percentDrop} İndirim
                    </p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${productUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600;">
                      Ürüne Git
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                Bu e-posta ${SITE_NAME} tarafından gönderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                E-posta bildirimlerini kapatmak için hesap ayarlarınızı ziyaret edin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function getPriceAlertEmailHtml(
  userName: string,
  productName: string,
  targetPrice: number,
  currentPrice: number,
  productSlug: string
) {
  const productUrl = `${BASE_URL}/urunler/${productSlug}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiyat Alarmı Tetiklendi!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Fiyat Alarmı Tetiklendi!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Merhaba ${userName || "Değerli Müşterimiz"},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                <strong>${productName}</strong> ürünü için belirlediğiniz hedef fiyata ulaşıldı!
              </p>
              <!-- Price Box -->
              <table role="presentation" style="width: 100%; background-color: #eff6ff; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                      Hedef Fiyat: ${targetPrice.toLocaleString("tr-TR")} TL
                    </p>
                    <p style="margin: 0 0 10px; color: #2563eb; font-size: 28px; font-weight: bold;">
                      ${currentPrice.toLocaleString("tr-TR")} TL
                    </p>
                    <p style="margin: 0; color: #16a34a; font-size: 14px; font-weight: bold;">
                      Hedef fiyatın altında!
                    </p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${productUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600;">
                      Ürüne Git
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                Bu e-posta ${SITE_NAME} tarafından gönderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                E-posta bildirimlerini kapatmak için hesap ayarlarınızı ziyaret edin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function getCampaignEmailHtml(
  userName: string,
  campaignName: string,
  discountText: string,
  campaignSlug: string
) {
  const campaignUrl = `${BASE_URL}/kampanyalar/${campaignSlug}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Kampanya!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #f97316; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Yeni Kampanya!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Merhaba ${userName || "Değerli Müşterimiz"},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                <strong>${campaignName}</strong> kampanyası başladı!
              </p>
              <!-- Discount Box -->
              <table role="presentation" style="width: 100%; background-color: #fff7ed; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="margin: 0; color: #ea580c; font-size: 32px; font-weight: bold;">
                      ${discountText}
                    </p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${campaignUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600;">
                      Kampanyayı İncele
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                Bu e-posta ${SITE_NAME} tarafından gönderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                E-posta bildirimlerini kapatmak için hesap ayarlarınızı ziyaret edin.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function getWelcomeEmailHtml(userName: string) {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hoş Geldiniz!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${SITE_NAME}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px;">
                Hoş Geldiniz, ${userName || "Değerli Müşterimiz"}!
              </h2>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                ${SITE_NAME}'a kayıt olduğunuz için teşekkür ederiz. Artık şunları yapabilirsiniz:
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #374151; font-size: 16px;">
                <li style="margin-bottom: 10px;">Ürünleri favorilerinize ekleyin</li>
                <li style="margin-bottom: 10px;">Fiyat alarmları oluşturun</li>
                <li style="margin-bottom: 10px;">Fiyat düşüşlerinden haberdar olun</li>
                <li style="margin-bottom: 10px;">Kampanyalardan ilk siz haberdar olun</li>
              </ul>
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${BASE_URL}/urunler" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600;">
                      Ürünleri Keşfet
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Bu e-posta ${SITE_NAME} tarafından gönderilmiştir.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

#!/bin/bash

# Fiyat Takip Platformu - Cron Jobs Setup
# Bu script sunucuda çalıştırılmalıdır

set -e

# Değişkenler - bunları güncelleyin
APP_URL="https://fiyattakip.com"
CRON_SECRET="your-cron-secret-here"  # .env.production'daki CRON_SECRET ile aynı olmalı

echo "Cron jobları ayarlanıyor..."

# Mevcut cron'ları temizle (fiyattakip ile ilgili)
crontab -l 2>/dev/null | grep -v "fiyattakip" > /tmp/crontab.tmp || true

# Yeni cron'ları ekle
cat >> /tmp/crontab.tmp << EOF

# ==================== Fiyat Takip Cron Jobs ====================

# Her saat başı - Fiyat istatistiklerini güncelle
0 * * * * curl -s -X POST "$APP_URL/api/cron?task=price-stats" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Her saat başı - İndirimli fiyatları hesapla
5 * * * * curl -s -X POST "$APP_URL/api/cron?task=discounted-prices" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Her 30 dakikada bir - Fiyat alarmlarını kontrol et
*/30 * * * * curl -s -X POST "$APP_URL/api/cron?task=price-alerts" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Her 30 dakikada bir - Fiyat düşüşlerini kontrol et
15,45 * * * * curl -s -X POST "$APP_URL/api/cron?task=price-drops" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Gece yarısı - Eski bildirimleri temizle
0 0 * * * curl -s -X POST "$APP_URL/api/cron?task=cleanup-notifications" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Her saat başı - Yeni kampanyaları bildir
10 * * * * curl -s -X POST "$APP_URL/api/cron?task=new-campaigns" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# Her saat başı - Süresi dolan kampanyaları pasife al
15 * * * * curl -s -X POST "$APP_URL/api/cron?task=expire-campaigns" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/fiyattakip/cron.log 2>&1

# ==================== End Fiyat Takip Cron Jobs ====================
EOF

# Crontab'ı yükle
crontab /tmp/crontab.tmp
rm /tmp/crontab.tmp

echo "Cron jobları başarıyla ayarlandı!"
echo "Mevcut cron'ları görmek için: crontab -l"

#!/bin/bash

# Randevuzamani - Otomatik Kurulum Script
# Kullanım: curl -sL https://raw.githubusercontent.com/AbdulkadirDirmilli/randevuzamani/main/scripts/deploy.sh | bash

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Randevuzamani Kurulum Başlıyor${NC}"
echo -e "${GREEN}========================================${NC}"

APP_DIR="/var/www/randevuzamani"

# 1. Proje klasörü
echo -e "\n${YELLOW}[1/7] Proje klasörü hazırlanıyor...${NC}"
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
    echo "Mevcut klasör siliniyor..."
    rm -rf $APP_DIR
fi

# 2. GitHub'dan çek
echo -e "\n${YELLOW}[2/7] GitHub'dan kod çekiliyor...${NC}"
git clone https://github.com/AbdulkadirDirmilli/randevuzamani.git
cd randevuzamani

# 3. Bağımlılıkları yükle
echo -e "\n${YELLOW}[3/7] npm paketleri yükleniyor...${NC}"
npm install

# 4. Environment dosyası
echo -e "\n${YELLOW}[4/7] Environment dosyası oluşturuluyor...${NC}"
cat > .env << 'EOF'
DATABASE_URL="file:./prod.db"
AUTH_SECRET="randevuzamani-secret-key-2024-production"
AUTH_URL="https://randevuzamani.com"
NEXTAUTH_URL="https://randevuzamani.com"
NODE_ENV="production"
EOF

# 5. Veritabanı ve Build
echo -e "\n${YELLOW}[5/7] Veritabanı ve Build hazırlanıyor...${NC}"
npx prisma generate
npx prisma db push
npm run build

# 6. Nginx ayarları
echo -e "\n${YELLOW}[6/7] Nginx ayarlanıyor...${NC}"
cat > /etc/nginx/sites-available/randevuzamani << 'EOF'
server {
    listen 80;
    server_name randevuzamani.com www.randevuzamani.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/randevuzamani /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

# 7. PM2 ile başlat
echo -e "\n${YELLOW}[7/7] PM2 ile başlatılıyor...${NC}"
cd $APP_DIR
pm2 delete randevuzamani 2>/dev/null || true
pm2 start npm --name "randevuzamani" -- start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Kurulum Tamamlandı!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Site şu an http://randevuzamani.com adresinde çalışıyor${NC}"
echo -e "\n${YELLOW}SSL için şunu çalıştırın:${NC}"
echo -e "certbot --nginx -d randevuzamani.com -d www.randevuzamani.com"
echo -e "\n${YELLOW}Örnek veri eklemek için:${NC}"
echo -e "cd $APP_DIR && npx prisma db seed"

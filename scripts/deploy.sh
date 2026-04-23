#!/bin/bash

# Fiyat Takip Platformu - Deployment Script
# Sunucu: 89.252.179.121

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Fiyat Takip Platformu Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Değişkenler
APP_DIR="/var/www/fiyattakip"
REPO_URL="https://github.com/username/fiyattakip.git" # Git repo URL'inizi güncelleyin
BRANCH="main"

# 1. Sistemi güncelle
echo -e "\n${YELLOW}[1/10] Sistem güncelleniyor...${NC}"
apt update && apt upgrade -y

# 2. Gerekli paketleri kur
echo -e "\n${YELLOW}[2/10] Gerekli paketler kuruluyor...${NC}"
apt install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# 3. Node.js 22 kur (fnm ile)
echo -e "\n${YELLOW}[3/10] Node.js kuruluyor...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://fnm.vercel.app/install | bash
    source ~/.bashrc
    fnm install 22
    fnm use 22
fi
echo "Node.js version: $(node -v)"

# 4. PM2 kur
echo -e "\n${YELLOW}[4/10] PM2 kuruluyor...${NC}"
npm install -g pm2

# 5. PostgreSQL ayarla
echo -e "\n${YELLOW}[5/10] PostgreSQL ayarlanıyor...${NC}"
sudo -u postgres psql -c "CREATE DATABASE fiyattakip;" 2>/dev/null || echo "Veritabanı zaten mevcut"
sudo -u postgres psql -c "CREATE USER fiyattakip WITH ENCRYPTED PASSWORD 'your_secure_password';" 2>/dev/null || echo "Kullanıcı zaten mevcut"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fiyattakip TO fiyattakip;"
sudo -u postgres psql -c "ALTER DATABASE fiyattakip OWNER TO fiyattakip;"

# 6. Uygulama dizinini hazırla
echo -e "\n${YELLOW}[6/10] Uygulama dizini hazırlanıyor...${NC}"
mkdir -p $APP_DIR
mkdir -p /var/log/fiyattakip

# 7. Kodu çek veya güncelle
echo -e "\n${YELLOW}[7/10] Kod çekiliyor...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 8. Bağımlılıkları kur ve build al
echo -e "\n${YELLOW}[8/10] Bağımlılıklar kuruluyor ve build alınıyor...${NC}"
cd $APP_DIR

# .env.production dosyasını kontrol et
if [ ! -f ".env.production" ]; then
    echo -e "${RED}HATA: .env.production dosyası bulunamadı!${NC}"
    echo "Lütfen .env.production.example dosyasını kopyalayın ve değerleri güncelleyin."
    exit 1
fi

# Prisma schema'yı PostgreSQL için kullan
cp prisma/schema.postgresql.prisma prisma/schema.prisma

npm ci
npx prisma generate
npx prisma db push
npm run build

# 9. Nginx ayarla
echo -e "\n${YELLOW}[9/10] Nginx ayarlanıyor...${NC}"
cp nginx.conf /etc/nginx/sites-available/fiyattakip
ln -sf /etc/nginx/sites-available/fiyattakip /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 10. PM2 ile başlat
echo -e "\n${YELLOW}[10/10] PM2 ile başlatılıyor...${NC}"
cd $APP_DIR
pm2 delete fiyattakip 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment tamamlandı!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nSonraki adımlar:"
echo -e "1. SSL sertifikası için: ${YELLOW}certbot --nginx -d fiyattakip.com -d www.fiyattakip.com${NC}"
echo -e "2. Veritabanı seed için: ${YELLOW}cd $APP_DIR && npm run db:seed${NC}"
echo -e "3. Logları görmek için: ${YELLOW}pm2 logs fiyattakip${NC}"

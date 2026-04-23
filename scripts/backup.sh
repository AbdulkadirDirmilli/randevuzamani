#!/bin/bash

# Fiyat Takip Platformu - Database Backup Script
# Cron ile günlük çalıştırılması önerilir

set -e

# Değişkenler
BACKUP_DIR="/var/backups/fiyattakip"
DB_NAME="fiyattakip"
DB_USER="fiyattakip"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"
RETENTION_DAYS=30

# Backup dizinini oluştur
mkdir -p $BACKUP_DIR

# Veritabanı yedeği al
echo "Veritabanı yedeği alınıyor: $BACKUP_FILE"
PGPASSWORD="your_secure_password" pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# Eski yedekleri temizle
echo "Eski yedekler temizleniyor (${RETENTION_DAYS} günden eski)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Sonuç
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "Yedekleme tamamlandı!"
echo "Dosya: $BACKUP_FILE"
echo "Boyut: $BACKUP_SIZE"

# Kalan yedek sayısı
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)
echo "Toplam yedek sayısı: $BACKUP_COUNT"

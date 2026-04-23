"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download, History, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ImportType = "products" | "categories" | "brands";

interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface ImportLog {
  id: string;
  type: string;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  createdAt: string;
  user: { name: string | null; email: string };
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ImportType>("products");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImportLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/admin/import/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch {
      console.error("Failed to fetch import history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.toLowerCase().split(".").pop();
      if (["xlsx", "xls", "csv"].includes(ext || "")) {
        setFile(droppedFile);
        setResult(null);
        setError(null);
      } else {
        setError("Sadece Excel veya CSV dosyaları kabul edilir");
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import başarısız");
      }

      setResult(data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Refresh history after successful import
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const typeLabels: Record<ImportType, string> = {
    products: "Ürünler",
    categories: "Kategoriler",
    brands: "Markalar",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Toplu İçe Aktarma</h1>
        <p className="text-muted-foreground">
          Excel veya CSV dosyasından veri yükleyin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dosya Yükle</CardTitle>
            <CardDescription>
              Desteklenen formatlar: .xlsx, .xls, .csv (maksimum 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Import Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Veri Türü</label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as ImportType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Ürünler</SelectItem>
                  <SelectItem value="categories">Kategoriler</SelectItem>
                  <SelectItem value="brands">Markalar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Kaldır
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">
                    Dosyayı sürükleyin veya seçin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excel veya CSV dosyası
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <XCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  İçe aktarılıyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {typeLabels[type]} İçe Aktar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.errors.length === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                İçe Aktarma Sonucu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{result.totalRows}</p>
                  <p className="text-sm text-muted-foreground">Toplam Satır</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {result.imported}
                  </p>
                  <p className="text-sm text-muted-foreground">Yeni Eklenen</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {result.updated}
                  </p>
                  <p className="text-sm text-muted-foreground">Güncellenen</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {result.skipped}
                  </p>
                  <p className="text-sm text-muted-foreground">Atlanan</p>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-destructive">
                    Hatalar ({result.errors.length})
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.errors.map((err, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-sm"
                      >
                        <Badge variant="destructive" className="shrink-0">
                          Satır {err.row}
                        </Badge>
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Template Card */}
        <Card className={result ? "lg:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Şablon Dosyaları</CardTitle>
            <CardDescription>
              Örnek Excel dosyalarını indirerek doğru formatta veri hazırlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <TemplateButton
                title="Ürün Şablonu"
                columns={[
                  "Ürün Adı",
                  "Barkod",
                  "Fiyat",
                  "Stok",
                  "Kategori",
                  "Marka",
                ]}
              />
              <TemplateButton
                title="Kategori Şablonu"
                columns={["Ad", "Açıklama", "Sıra"]}
              />
              <TemplateButton
                title="Marka Şablonu"
                columns={["Ad", "Açıklama"]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            İçe Aktarma Geçmişi
          </CardTitle>
          <CardDescription>Son yapılan içe aktarma işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {log.type === "PRODUCT" && <FileSpreadsheet className="h-5 w-5 text-primary" />}
                      {log.type === "CATEGORY" && <FileSpreadsheet className="h-5 w-5 text-blue-500" />}
                      {log.type === "BRAND" && <FileSpreadsheet className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {log.type === "PRODUCT" && "Ürün"}
                        {log.type === "CATEGORY" && "Kategori"}
                        {log.type === "BRAND" && "Marka"} İçe Aktarma
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                        <span>•</span>
                        <span>{log.user.name || log.user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{log.totalRows}</p>
                      <p className="text-xs text-muted-foreground">Toplam</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{log.imported}</p>
                      <p className="text-xs text-muted-foreground">Yeni</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{log.updated}</p>
                      <p className="text-xs text-muted-foreground">Güncellenen</p>
                    </div>
                    {log.skipped > 0 && (
                      <div className="text-center">
                        <p className="font-semibold text-yellow-600">{log.skipped}</p>
                        <p className="text-xs text-muted-foreground">Atlanan</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Henüz içe aktarma yapılmamış
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Kılavuzu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Ürün İçe Aktarma</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Desteklenen sütun isimleri:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ürün Adı / name",
                  "Barkod / barcode",
                  "Stok Kodu / sku",
                  "Açıklama / description",
                  "Hacim / volume",
                  "Alkol Oranı / alcoholPercentage",
                  "Fiyat / currentPrice",
                  "Liste Fiyatı / originalPrice",
                  "Stok / stock",
                  "Kategori / categoryName",
                  "Marka / brandName",
                ].map((col) => (
                  <Badge key={col} variant="secondary">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Kategori İçe Aktarma</h4>
              <div className="flex flex-wrap gap-2">
                {["Ad / name", "Açıklama / description", "Sıra / order"].map(
                  (col) => (
                    <Badge key={col} variant="secondary">
                      {col}
                    </Badge>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Marka İçe Aktarma</h4>
              <div className="flex flex-wrap gap-2">
                {["Ad / name", "Açıklama / description"].map((col) => (
                  <Badge key={col} variant="secondary">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplateButton({
  title,
  columns,
}: {
  title: string;
  columns: string[];
}) {
  const downloadTemplate = () => {
    const header = columns.join(",");
    const blob = new Blob([header + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" className="h-auto py-4" onClick={downloadTemplate}>
      <div className="flex flex-col items-center gap-1">
        <Download className="h-5 w-5" />
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">
          {columns.length} sütun
        </span>
      </div>
    </Button>
  );
}

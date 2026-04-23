import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  parseFile,
  importProducts,
  importCategories,
  importBrands,
  type ImportType,
} from "@/services/import.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as ImportType | null;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya yüklenmedi" },
        { status: 400 }
      );
    }

    if (!type || !["products", "categories", "brands"].includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz import türü" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: "Sadece Excel (.xlsx, .xls) veya CSV dosyaları kabul edilir" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = parseFile(buffer, file.name);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Dosyada veri bulunamadı" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "products":
        result = await importProducts(data, user.id);
        break;
      case "categories":
        result = await importCategories(data, user.id);
        break;
      case "brands":
        result = await importBrands(data, user.id);
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Import error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import başarısız" },
      { status: 500 }
    );
  }
}

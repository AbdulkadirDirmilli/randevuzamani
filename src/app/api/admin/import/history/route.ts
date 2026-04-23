import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getImportLogs } from "@/services/import.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const logs = await getImportLogs(Math.min(limit, 50));

    return NextResponse.json(logs);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Geçmiş yüklenemedi" },
      { status: 500 }
    );
  }
}

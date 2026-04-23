import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      );
    }

    // Check if brand has products
    if (brand.products.length > 0) {
      return NextResponse.json(
        { error: `Bu markada ${brand.products.length} ürün var. Önce ürünleri başka bir markaya taşıyın veya silin.` },
        { status: 400 }
      );
    }

    // Delete brand
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Marka başarıyla silindi" });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json(
      { error: "Marka silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Get brand error:", error);
    return NextResponse.json(
      { error: "Marka getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "E-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // In production, you would send an email here
    // For development, we'll log the reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/sifre-sifirla?token=${token}`;

    console.log("=================================");
    console.log("Password Reset Link (DEV ONLY):");
    console.log(resetUrl);
    console.log("=================================");

    // TODO: Send email with reset link
    // await sendEmail({
    //   to: email,
    //   subject: "Şifre Sıfırlama - Fiyat Takip",
    //   html: `<p>Şifrenizi sıfırlamak için <a href="${resetUrl}">buraya tıklayın</a>.</p>`,
    // });

    return NextResponse.json({
      message: "E-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

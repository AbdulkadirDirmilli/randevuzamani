import { Logo } from "@/components/layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Bu site yalnızca fiyat bilgilendirme amaçlıdır.
        <br />
        Satış yapılmamaktadır.
      </p>
    </div>
  );
}

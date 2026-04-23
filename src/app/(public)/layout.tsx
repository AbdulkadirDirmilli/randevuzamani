import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PublicContent } from "./public-content";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <PublicContent>{children}</PublicContent>
        <Footer />
      </div>
      <Toaster />
    </SessionProvider>
  );
}

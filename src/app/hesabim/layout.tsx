import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { HesabimContent } from "./hesabim-content";

export default function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <HesabimContent>{children}</HesabimContent>
      <Footer />
      <Toaster />
    </SessionProvider>
  );
}

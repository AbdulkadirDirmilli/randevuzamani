import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/forms/campaign-form";

export default function YeniKampanyaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/kampanyalar">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Kampanya</h1>
          <p className="text-muted-foreground">
            Yeni bir kampanya oluşturun
          </p>
        </div>
      </div>

      <CampaignForm />
    </div>
  );
}

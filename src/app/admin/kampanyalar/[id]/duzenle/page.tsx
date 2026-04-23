import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCampaign } from "@/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/forms/campaign-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DuzenleKampanyaPage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/kampanyalar/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kampanyayı Düzenle</h1>
          <p className="text-muted-foreground">{campaign.name}</p>
        </div>
      </div>

      <CampaignForm campaign={campaign} />
    </div>
  );
}

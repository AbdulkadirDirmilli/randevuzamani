import { BrandForm } from "@/components/forms/brand-form";

export default function YeniMarkaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yeni Marka</h1>
        <p className="text-muted-foreground">Yeni bir marka ekleyin</p>
      </div>

      <BrandForm />
    </div>
  );
}

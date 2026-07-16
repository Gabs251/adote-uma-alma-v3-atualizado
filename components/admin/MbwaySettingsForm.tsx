"use client";

import { useTransition } from "react";
import { updateMbwaySettings } from "@/app/admin/actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function MbwaySettingsForm({
  initialNumber,
  initialQrUrl,
}: {
  initialNumber: string;
  initialQrUrl: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updateMbwaySettings(formData))}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <Label htmlFor="mbway_number">Número MBWay</Label>
        <Input id="mbway_number" name="mbway_number" defaultValue={initialNumber} />
      </div>
      <div>
        <Label htmlFor="mbway_qr_url">URL do QR Code</Label>
        <Input id="mbway_qr_url" name="mbway_qr_url" defaultValue={initialQrUrl} />
      </div>
      <Button type="submit" disabled={isPending} className="sm:col-span-2">
        {isPending ? "A guardar..." : "Guardar configurações"}
      </Button>
    </form>
  );
}

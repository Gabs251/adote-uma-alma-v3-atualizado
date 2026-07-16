"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { soulSchema } from "@/lib/validations";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createSoul(formData: FormData) {
  const supabase = await requireUser();

  const raw = {
    code: String(formData.get("code") ?? ""),
    age: Number(formData.get("age")),
    country: String(formData.get("country") ?? ""),
    extra_info: (formData.get("extra_info") as string) || null,
    description: String(formData.get("description") ?? ""),
    image_url: (formData.get("image_url") as string) || null,
    goal_cents: Math.round(Number(formData.get("goal") ?? 0) * 100),
    status: (formData.get("status") as string) || "disponivel",
  };

  const parsed = soulSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const { error } = await supabase.from("souls").insert(parsed.data);
  if (error) throw new Error("Não foi possível criar a alma.");

  revalidatePath("/admin/almas");
  revalidatePath("/adote-uma-alma");
  revalidatePath("/");
}

export async function updateSoul(soulId: string, formData: FormData) {
  const supabase = await requireUser();

  const raw = {
    code: String(formData.get("code") ?? ""),
    age: Number(formData.get("age")),
    country: String(formData.get("country") ?? ""),
    extra_info: (formData.get("extra_info") as string) || null,
    description: String(formData.get("description") ?? ""),
    image_url: (formData.get("image_url") as string) || null,
    goal_cents: Math.round(Number(formData.get("goal") ?? 0) * 100),
    status: (formData.get("status") as string) || "disponivel",
  };

  const parsed = soulSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const { error } = await supabase.from("souls").update(parsed.data).eq("id", soulId);
  if (error) throw new Error("Não foi possível atualizar a alma.");

  revalidatePath("/admin/almas");
  revalidatePath("/adote-uma-alma");
  revalidatePath("/");
  revalidatePath("/transparencia");
}

export async function archiveSoul(soulId: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("souls").update({ status: "arquivada" }).eq("id", soulId);
  if (error) throw new Error("Não foi possível arquivar a alma.");

  revalidatePath("/admin/almas");
  revalidatePath("/adote-uma-alma");
  revalidatePath("/");
}

export async function confirmContribution(contributionId: string) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("contributions")
    .update({ status: "confirmada" })
    .eq("id", contributionId);
  if (error) throw new Error("Não foi possível confirmar a contribuição.");

  revalidatePath("/admin/contribuicoes");
  revalidatePath("/adote-uma-alma");
  revalidatePath("/transparencia");
  revalidatePath("/");
}

export async function rejectContribution(contributionId: string, note?: string) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("contributions")
    .update({ status: "rejeitada", admin_note: note ?? null })
    .eq("id", contributionId);
  if (error) throw new Error("Não foi possível rejeitar a contribuição.");

  revalidatePath("/admin/contribuicoes");
}

export async function updateMbwaySettings(formData: FormData) {
  const supabase = await requireUser();
  const number = String(formData.get("mbway_number") ?? "");
  const qrUrl = String(formData.get("mbway_qr_url") ?? "");

  await supabase.from("site_settings").upsert([
    { key: "mbway_number", value: number },
    { key: "mbway_qr_url", value: qrUrl },
  ]);

  revalidatePath("/admin");
}

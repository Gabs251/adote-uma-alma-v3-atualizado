import { createClient } from "@/lib/supabase/server";
import type { Soul, TransparencyTotals } from "@/lib/types";

// Almas apresentadas enquanto a base de dados não devolve registos.
// Assim que o Supabase estiver configurado e semeado, os dados reais assumem.
export const FALLBACK_SOULS: Soul[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    code: "01",
    age: 40,
    country: "Brasil",
    extra_info: null,
    description:
      "Deseja participar novamente no Encontro com Deus Redenção para fortalecer a sua caminhada com Cristo.",
    image_url: null,
    goal_cents: 11000,
    raised_cents: 0,
    status: "disponivel",
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    code: "02",
    age: 32,
    country: "Brasil",
    extra_info: "Divorciada · Mãe de 3 filhos",
    description:
      "Deseja participar pela primeira vez no Encontro com Deus Redenção para entregar completamente a sua vida a Jesus.",
    image_url: null,
    goal_cents: 11000,
    raised_cents: 0,
    status: "disponivel",
    created_at: "2026-07-01T00:00:01.000Z",
    updated_at: "2026-07-01T00:00:01.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    code: "03",
    age: 20,
    country: "Brasil",
    extra_info: "Mãe de uma criança",
    description:
      "Tenho 20 anos, sou mãe de uma criança e desejo participar novamente no Encontro com Deus Redenção. Na minha primeira experiência fui profundamente impactada pelo amor de Deus e saí fortalecida espiritualmente. Quero viver mais uma vez este tempo de renovação, crescimento e comunhão com os irmãos, para continuar firme nos propósitos que Deus tem para a minha vida e para a minha família.",
    image_url: null,
    goal_cents: 11000,
    raised_cents: 0,
    status: "disponivel",
    created_at: "2026-07-01T00:00:02.000Z",
    updated_at: "2026-07-01T00:00:02.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    code: "04",
    age: null,
    country: "Brasil",
    extra_info: "Mãe de uma criança",
    description:
      "Sou mãe de uma criança e desejo participar pela primeira vez no Encontro com Deus Redenção. Tenho buscado me aproximar mais de Deus e acredito que este encontro será uma oportunidade para transformar a minha vida, fortalecer a minha fé e construir um futuro melhor para mim e para o meu filho. O meu desejo é conhecer mais profundamente o amor e os planos de Deus para a nossa família.",
    image_url: null,
    goal_cents: 11000,
    raised_cents: 0,
    status: "disponivel",
    created_at: "2026-07-01T00:00:03.000Z",
    updated_at: "2026-07-01T00:00:03.000Z",
  },
];

export async function getSouls(): Promise<Soul[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("souls")
      .select("*")
      .neq("status", "arquivada")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_SOULS;
    return data as Soul[];
  } catch {
    return FALLBACK_SOULS;
  }
}

export async function getSoulById(id: string): Promise<Soul | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("souls").select("*").eq("id", id).single();
    if (error || !data) return FALLBACK_SOULS.find((s) => s.id === id) ?? null;
    return data as Soul;
  } catch {
    return FALLBACK_SOULS.find((s) => s.id === id) ?? null;
  }
}

export async function getTransparencyTotals(): Promise<TransparencyTotals> {
  const souls = await getSouls();

  let contributionsCount = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("contributions")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmada");
    contributionsCount = count ?? 0;
  } catch {
    contributionsCount = 0;
  }

  const totalRaisedCents = souls.reduce((sum, s) => sum + s.raised_cents, 0);
  const totalGoalCents = souls.reduce((sum, s) => sum + s.goal_cents, 0);
  const percentage =
    totalGoalCents > 0 ? Math.min(100, Math.round((totalRaisedCents / totalGoalCents) * 100)) : 0;

  return {
    totalRaisedCents,
    totalGoalCents,
    soulsCount: souls.length,
    contributionsCount,
    percentage,
  };
}

export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();
    return data?.value ?? null;
  } catch {
    return null;
  }
}

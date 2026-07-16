import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StatsGrid } from "@/components/site/StatsGrid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { getSouls, getTransparencyTotals } from "@/lib/data";

export const metadata: Metadata = {
  title: "Transparência",
  description: "Veja em tempo real o total arrecadado, o número de almas e contribuições confirmadas.",
};

export const revalidate = 0;

export default async function TransparenciaPage() {
  const [souls, totals] = await Promise.all([getSouls(), getTransparencyTotals()]);

  const stats = [
    { label: "Total arrecadado", value: formatCurrency(totals.totalRaisedCents / 100) },
    { label: "Número de almas", value: String(totals.soulsCount) },
    { label: "Contribuições confirmadas", value: String(totals.contributionsCount) },
    { label: "Meta geral", value: formatCurrency(totals.totalGoalCents / 100) },
  ];

  return (
    <>
      <Section className="pb-0">
        <SectionHeading
          eyebrow="Transparência"
          title="Contas claras, corações em paz."
          description="Cada contribuição confirmada é refletida aqui. Nada é assumido automaticamente — só o que a nossa equipa valida manualmente."
        />
        <StatsGrid stats={stats} />
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl rounded-xl2 border border-brand-100 bg-white p-8 shadow-soft">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-semibold text-brand-900">Progresso geral</h3>
            <span className="text-sm font-medium text-brand-600">{totals.percentage}%</span>
          </div>
          <ProgressBar percentage={totals.percentage} />
          <p className="mt-4 text-sm text-brand-600">
            {formatCurrency(totals.totalRaisedCents / 100)} arrecadados de um objetivo total de{" "}
            {formatCurrency(totals.totalGoalCents / 100)}, distribuídos por {totals.soulsCount}{" "}
            almas.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          <h3 className="text-center font-semibold text-brand-900">Progresso por alma</h3>
          {souls.map((soul) => {
            const pct = soul.goal_cents > 0 ? Math.round((soul.raised_cents / soul.goal_cents) * 100) : 0;
            return (
              <div key={soul.id} className="rounded-xl border border-brand-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-800">Alma {soul.code}</span>
                  <span className="text-brand-500">
                    {formatCurrency(soul.raised_cents / 100)} / {formatCurrency(soul.goal_cents / 100)}
                  </span>
                </div>
                <ProgressBar percentage={pct} />
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

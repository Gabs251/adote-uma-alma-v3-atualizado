"use client";

import Image from "next/image";
import { useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, calcPercentage } from "@/lib/utils";
import type { Soul } from "@/lib/types";
import { AdoptModal } from "@/components/site/AdoptModal";

export function SoulCard({ soul }: { soul: Soul }) {
  const [open, setOpen] = useState(false);
  const percentage = calcPercentage(soul.raised_cents, soul.goal_cents);
  const isAdopted = soul.status === "adotada";

  return (
    <>
      <article className="flex h-full flex-col overflow-hidden rounded-xl2 border border-brand-100 bg-white shadow-soft transition-transform hover:-translate-y-1 hover:shadow-card">
        <div className="relative h-44 w-full shrink-0 bg-brand-100">
          {soul.image_url ? (
            <Image
              src={soul.image_url}
              alt=""
              fill
              className="scale-105 object-cover blur-md"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-300">
              <span className="text-5xl font-bold">{soul.code}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-brand-900/10" />
          <div className="absolute left-3 top-3">
            <Badge variant={isAdopted ? "success" : "default"}>
              {isAdopted ? "Adotada" : "Disponível"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-lg font-semibold text-brand-900">
            Alma #{soul.code}
            {soul.age !== null && <span className="font-normal text-brand-600"> · {soul.age} anos</span>}
          </h3>
          <p className="text-sm text-brand-500">{soul.country}</p>
          {soul.extra_info && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-400">
              {soul.extra_info}
            </p>
          )}
          <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-700">
            {soul.description}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-brand-800">
                {formatCurrency(soul.raised_cents / 100)}
              </span>
              <span className="text-brand-500">de {formatCurrency(soul.goal_cents / 100)}</span>
            </div>
            <ProgressBar percentage={percentage} />
            <p className="mt-1 text-right text-xs font-medium text-brand-500">{percentage}%</p>
          </div>

          <div className="mt-5">
            {isAdopted ? (
              <p className="text-center text-sm font-medium text-brand-500">
                ♡ Já apadrinhada — obrigado
              </p>
            ) : (
              <Button className="w-full" onClick={() => setOpen(true)}>
                Adotar esta alma →
              </Button>
            )}
          </div>
        </div>
      </article>

      {open && <AdoptModal soul={soul} onClose={() => setOpen(false)} />}
    </>
  );
}

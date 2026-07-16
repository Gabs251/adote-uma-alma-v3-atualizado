"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import type { Soul } from "@/lib/types";

const presetAmounts = [5, 10, 20, 30, 50, 100];

type Step = "valor" | "pagamento" | "comprovativo" | "sucesso";

export function AdoptModal({ soul, onClose }: { soul: Soul; onClose: () => void }) {
  const [step, setStep] = useState<Step>("valor");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mbwayNumber = process.env.NEXT_PUBLIC_MBWAY_NUMBER ?? "+351 965 012 201";
  const mbwayQrUrl = process.env.NEXT_PUBLIC_MBWAY_QR_URL ?? "/mbway-qr.png";

  const finalAmount = amount ?? Number(customAmount) ?? 0;

  function selectAmount(value: number) {
    setAmount(value);
    setCustomAmount("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!donorName.trim()) {
      setError("Indique o seu nome.");
      return;
    }
    if (!file) {
      setError("Anexe o comprovativo do pagamento.");
      return;
    }
    if (!finalAmount || finalAmount < 1) {
      setError("Indique um valor válido.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `${soul.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("comprovativos")
        .upload(filePath, file);

      if (uploadError) throw new Error("Não foi possível enviar o comprovativo.");

      const { data: publicUrlData } = supabase.storage
        .from("comprovativos")
        .getPublicUrl(filePath);

      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soul_id: soul.id,
          donor_name: donorName,
          amount_cents: Math.round(finalAmount * 100),
          proof_url: publicUrlData.publicUrl,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível registar a contribuição.");
      }

      setStep("sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Adotar alma ${soul.code}`}
      >
        <motion.div
          className="relative w-full max-w-md rounded-xl2 bg-white p-6 shadow-card sm:p-8"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-full p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700 focus-ring"
          >
            <X className="h-5 w-5" />
          </button>

          {step === "valor" && (
            <div>
              <h2 className="text-xl font-semibold text-brand-900">Adotar Alma {soul.code}</h2>
              <p className="mt-1 text-sm text-brand-600">Escolha o valor da sua contribuição.</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {presetAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => selectAmount(value)}
                    className={`rounded-lg border py-3 text-sm font-semibold transition-colors focus-ring ${
                      amount === value
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-brand-200 text-brand-700 hover:bg-brand-100"
                    }`}
                  >
                    {value}€
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="custom-amount">Outro valor (€)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="Ex: 25"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(null);
                  }}
                />
              </div>
              <Button
                className="mt-6 w-full"
                disabled={!finalAmount || finalAmount < 1}
                onClick={() => setStep("pagamento")}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === "pagamento" && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-brand-900">Pagamento via MBWay</h2>
              <p className="mt-1 text-sm text-brand-600">
                Valor a contribuir: <strong>{formatCurrency(finalAmount)}</strong>
              </p>
              <div className="mx-auto mt-6 flex h-52 w-52 items-center justify-center rounded-xl2 border border-brand-200 bg-brand-50 p-2">
                <img
                  src={mbwayQrUrl}
                  alt="QR Code para pagamento MBWay"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-brand-600">
                Ou envie diretamente para o número MBWay:
              </p>
              <p className="text-lg font-bold text-brand-800">{mbwayNumber}</p>
              <Button className="mt-6 w-full" onClick={() => setStep("comprovativo")}>
                Já paguei, enviar comprovativo
              </Button>
            </div>
          )}

          {step === "comprovativo" && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-brand-900">Enviar comprovativo</h2>
              <p className="mt-1 text-sm text-brand-600">
                Confirme os seus dados. A sua contribuição será validada pela nossa equipa.
              </p>

              <div className="mt-5">
                <Label htmlFor="donor-name">O seu nome</Label>
                <Input
                  id="donor-name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="proof">Comprovativo do pagamento</Label>
                <label
                  htmlFor="proof"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-brand-300 px-4 py-6 text-sm text-brand-600 hover:bg-brand-50"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {file ? file.name : "Clique para anexar imagem ou PDF"}
                </label>
                <input
                  id="proof"
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <FieldError message={error ?? undefined} />

              <Button type="submit" className="mt-6 w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> A enviar...
                  </>
                ) : (
                  "Confirmar contribuição"
                )}
              </Button>
            </form>
          )}

          {step === "sucesso" && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-brand-900">Obrigado, {donorName}!</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">
                A sua contribuição de {formatCurrency(finalAmount)} foi registada e está a
                aguardar confirmação da nossa equipa. Assim que for validada, o progresso da
                Alma {soul.code} será atualizado.
              </p>
              <Button className="mt-6 w-full" variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

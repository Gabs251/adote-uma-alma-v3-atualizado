import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>

      <p className="mt-4 text-brand-600">
        A página que procura pode ter sido movida ou já não existe.
      </p>

      <Link href="/">
        <Button className="mt-6">
          Voltar ao início
        </Button>
      </Link>
    </div>
  );
}
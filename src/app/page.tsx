"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/tableau-de-bord" : "/connexion");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen items-center justify-center px-6">
      <p className="text-muted">Redirection…</p>
    </main>
  );
}

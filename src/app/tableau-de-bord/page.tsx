"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/api";
import { clearSession, getStoredUser, isAuthenticated } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function TableauDeBordPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/connexion");
      return;
    }

    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
    }

    fetchMe()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearSession();
        router.replace("/connexion");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/connexion");
  }

  if (loading && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
        <p className="text-muted">Chargement du tableau de bord…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-brand uppercase">
            Pressing Manager
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-2 text-muted">
            Bienvenue{user ? `, ${user.fullName}` : ""}. Les indicateurs métier
            arriveront à l&apos;étape suivante.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="border border-line bg-panel px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-soft"
        >
          Déconnexion
        </button>
      </header>

      {user && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="border border-line bg-panel p-5">
            <h2 className="text-sm text-muted">Compte</h2>
            <p className="mt-2 text-lg font-semibold">{user.username}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </article>
          <article className="border border-line bg-panel p-5">
            <h2 className="text-sm text-muted">Rôles</h2>
            <p className="mt-2 text-lg font-semibold">{user.roles.join(", ")}</p>
          </article>
        </section>
      )}
    </main>
  );
}

"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getStoredUser } from "@/lib/auth";

export default function TableauDeBordPage() {
  const user = getStoredUser();

  return (
    <AppShell
      title="Tableau de bord"
      subtitle={`Bienvenue${user ? `, ${user.fullName}` : ""}. Les indicateurs métier arriveront plus tard.`}
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Clients</p>
          <Link
            href="/clients"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir
          </Link>
        </article>
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Commandes</p>
          <Link
            href="/commandes"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir
          </Link>
        </article>
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Tarifs</p>
          <Link
            href="/tarifs"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir
          </Link>
        </article>
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Utilisateurs</p>
          <Link
            href="/utilisateurs"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir
          </Link>
        </article>
      </section>
    </AppShell>
  );
}

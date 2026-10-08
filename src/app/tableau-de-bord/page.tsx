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
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Clients</p>
          <p className="mt-1 text-sm text-muted">
            Création, recherche, fiche client.
          </p>
          <Link
            href="/clients"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir les clients
          </Link>
        </article>
        <article className="border border-line bg-panel p-5">
          <h2 className="text-sm text-muted">Module disponible</h2>
          <p className="mt-2 text-lg font-semibold">Tarifs</p>
          <p className="mt-1 text-sm text-muted">
            Grille kilo / pièce en XOF.
          </p>
          <Link
            href="/tarifs"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Ouvrir les tarifs
          </Link>
        </article>
      </section>
    </AppShell>
  );
}

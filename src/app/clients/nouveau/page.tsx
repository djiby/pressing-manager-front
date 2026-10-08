"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, createClient } from "@/lib/api";

export default function NouveauClientPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createClient({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Création impossible pour le moment",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Nouveau client"
      subtitle="Le téléphone doit être un mobile valide (préfixes 70–78)."
      actions={
        <Link
          href="/clients"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Retour
        </Link>
      }
    >
      <form
        onSubmit={onSubmit}
        className="grid w-full max-w-2xl gap-4 border border-line bg-panel p-4 sm:p-6"
      >
        <label className="text-sm font-medium">
          Nom complet
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Téléphone
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="77 123 45 67"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Adresse
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Enregistrement réussi"
        message="Le client a bien été créé."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/clients")}
      />
    </AppShell>
  );
}

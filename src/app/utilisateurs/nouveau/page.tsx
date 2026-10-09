"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ApiError, createUser } from "@/lib/api";
import type { Role } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

export default function NouvelUtilisateurPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PRESSING");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createUser({
        username: username.trim(),
        fullName: fullName.trim(),
        password,
        roles: [role],
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
      title="Nouvel utilisateur"
      subtitle="Créer un compte ADMIN ou PRESSING."
      actions={
        <Link
          href="/utilisateurs"
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
          Identifiant
          <input
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Mot de passe
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="text-sm font-medium">
          Rôle
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
          >
            {(Object.keys(ROLE_LABELS) as Role[]).map((key) => (
              <option key={key} value={key}>
                {ROLE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-brand px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Créer l'utilisateur"}
        </button>
      </form>

      <ConfirmDialog
        open={showSuccess}
        title="Utilisateur créé"
        message="Le compte a bien été enregistré."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/utilisateurs")}
      />
    </AppShell>
  );
}

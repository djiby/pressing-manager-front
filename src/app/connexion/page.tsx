"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function ConnexionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await login(username.trim(), password);
      saveSession(session);
      router.replace("/tableau-de-bord");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Connexion impossible. Vérifiez que l'API est démarrée.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-brand uppercase">
        Pressing Manager
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-foreground">
        Connexion
      </h1>
      <p className="mt-2 text-muted">
        Accédez à votre espace de gestion.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 border border-line bg-panel p-6 shadow-[0_20px_60px_rgba(28,42,34,0.08)]"
      >
        <label className="block text-sm font-medium text-foreground">
          Identifiant
          <input
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-foreground">
          Mot de passe
          <input
            type="password"
            className="mt-2 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";
import { clearSession, getStoredUser, isAuthenticated } from "@/lib/auth";
import type { User } from "@/types/auth";

const links = [
  { href: "/tableau-de-bord", label: "Tableau de bord" },
  { href: "/clients", label: "Clients" },
];

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

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
      .finally(() => setReady(true));
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/connexion");
  }

  if (!ready && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
        <p className="text-muted">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-brand uppercase">
            Pressing Manager
          </p>
          <nav className="mt-3 flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "bg-brand px-3 py-1.5 text-sm font-medium text-white"
                      : "border border-line bg-panel px-3 py-1.5 text-sm text-foreground hover:bg-brand-soft"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted">
              {user.fullName} · {user.roles.join(", ")}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="border border-line bg-panel px-3 py-1.5 text-sm font-medium hover:bg-brand-soft"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-foreground">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {actions}
      </header>

      {children}
    </main>
  );
}

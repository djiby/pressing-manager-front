"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SortableTh } from "@/components/SortableTh";
import {
  ApiError,
  deleteOrder,
  downloadInvoicePdf,
  getOrder,
  updateOrderStatus,
} from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { formatXof } from "@/lib/format";
import { sortRows, toggleSort, type SortState } from "@/lib/sort";
import type { Order, OrderStatus, PaymentMethod } from "@/types/order";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  paymentLabel,
} from "@/types/order";
import { PRICING_TYPE_LABELS } from "@/types/tarif";

type LineSortKey =
  | "label"
  | "pricingType"
  | "quantity"
  | "unitPriceXof"
  | "lineTotalXof";

export default function CommandeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lineSort, setLineSort] = useState<SortState<LineSortKey>>({
    key: "label",
    direction: "asc",
  });

  useEffect(() => {
    if (!Number.isFinite(orderId)) {
      router.replace("/commandes");
      return;
    }

    getOrder(orderId)
      .then(setOrder)
      .catch(() => router.replace("/commandes"))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  async function changeStatus(next: OrderStatus) {
    if (!order) {
      return;
    }
    const needsPayment = next === "PRETE" && !order.invoiceId && !order.paymentMethod;
    if (needsPayment && !paymentMethod) {
      setError("Sélectionnez un mode de paiement avant de passer la commande en prête.");
      return;
    }
    setUpdating(true);
    setError(null);
    setStatusMessage(null);
    try {
      const method =
        !order.invoiceId && paymentMethod ? paymentMethod : null;
      const updated = await updateOrderStatus(order.id, next, method);
      setOrder(updated);
      setStatusMessage(
        method && updated.invoiceNumber
          ? `Statut mis à jour : ${ORDER_STATUS_LABELS[next]} · Facture ${updated.invoiceNumber} · ${PAYMENT_METHOD_LABELS[method]}`
          : `Statut mis à jour : ${ORDER_STATUS_LABELS[next]}`,
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Changement de statut impossible",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function onDownloadInvoice() {
    if (!order?.invoiceId || !order.invoiceNumber) {
      return;
    }
    setError(null);
    try {
      await downloadInvoicePdf(order.invoiceId, order.invoiceNumber);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Téléchargement de la facture impossible",
      );
    }
  }

  async function onConfirmDelete() {
    if (!order) {
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await deleteOrder(order.id);
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      setShowDeleteConfirm(false);
      setError(
        err instanceof ApiError ? err.message : "Suppression impossible",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !order) {
    return (
      <AppShell title="Commande">
        <p className="text-muted">Chargement…</p>
      </AppShell>
    );
  }

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
  const canDelete =
    isAdmin() && order.status === "RECEPTIONNEE" && !order.invoiceId;
  const sortedLines = sortRows(order.lines, lineSort, (line, key) => {
    switch (key as LineSortKey) {
      case "label":
        return line.label;
      case "pricingType":
        return PRICING_TYPE_LABELS[line.pricingType];
      case "quantity":
        return line.quantity;
      case "unitPriceXof":
        return line.unitPriceXof;
      case "lineTotalXof":
        return line.lineTotalXof;
      default:
        return null;
    }
  });

  return (
    <AppShell
      title={order.reference}
      subtitle={`${order.clientName} · ${order.clientPhoneDisplay}`}
      actions={
        <Link
          href="/commandes"
          className="border border-line bg-panel px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Liste des commandes
        </Link>
      }
    >
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Statut</h2>
          <p className="mt-2 text-lg font-semibold">
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Paiement</h2>
          <p className="mt-2 text-lg font-semibold">{paymentLabel(order)}</p>
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Total</h2>
          <p className="mt-2 text-lg font-semibold">
            {formatXof(order.totalXof)}
          </p>
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Facture</h2>
          {order.invoiceNumber ? (
            <div className="mt-2 space-y-2">
              <p className="text-lg font-semibold">{order.invoiceNumber}</p>
              <button
                type="button"
                onClick={() => void onDownloadInvoice()}
                className="border border-line px-3 py-1.5 text-sm hover:bg-brand-soft"
              >
                Télécharger PDF
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Non créée</p>
          )}
        </article>
        <article className="border border-line bg-panel p-4">
          <h2 className="text-sm text-muted">Notes</h2>
          <p className="mt-2 text-sm">{order.notes || "—"}</p>
        </article>
      </section>

      {nextStatuses.length > 0 && (
        <section className="mb-6 border border-line bg-panel p-4">
          <h2 className="mb-3 text-sm font-semibold">Changer le statut</h2>
          {!order.invoiceId && !order.paymentMethod && (
            <fieldset className="mb-3 space-y-2">
              <legend className="text-sm font-medium">
                Paiement <span className="font-normal text-muted">(obligatoire)</span>
              </legend>
              <div className="flex flex-wrap gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="size-4 accent-[var(--brand)]"
                    />
                    {PAYMENT_METHOD_LABELS[method]}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => {
              const needsPayment =
                status === "PRETE" && !order.invoiceId && !order.paymentMethod;
              const disabled = updating || (needsPayment && !paymentMethod);
              return (
                <button
                  key={status}
                  type="button"
                  disabled={disabled}
                  onClick={() => void changeStatus(status)}
                  className="bg-brand px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
                >
                  {ORDER_STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-3 md:hidden">
        {sortedLines.map((line) => (
          <article key={line.id} className="border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{line.label}</p>
              <p className="shrink-0 text-sm font-semibold">
                {formatXof(line.lineTotalXof)}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted">
              {PRICING_TYPE_LABELS[line.pricingType]} · Qté {line.quantity}
            </p>
            <p className="mt-1 text-sm text-muted">
              P.U. {formatXof(line.unitPriceXof)}
            </p>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto border border-line bg-panel md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-brand-soft/50">
            <tr>
              <SortableTh
                label="Article"
                column="label"
                sort={lineSort}
                onSort={(column) => setLineSort((s) => toggleSort(s, column))}
              />
              <SortableTh
                label="Type"
                column="pricingType"
                sort={lineSort}
                onSort={(column) => setLineSort((s) => toggleSort(s, column))}
              />
              <SortableTh
                label="Qté"
                column="quantity"
                sort={lineSort}
                onSort={(column) => setLineSort((s) => toggleSort(s, column))}
              />
              <SortableTh
                label="P.U."
                column="unitPriceXof"
                sort={lineSort}
                onSort={(column) => setLineSort((s) => toggleSort(s, column))}
              />
              <SortableTh
                label="Total"
                column="lineTotalXof"
                sort={lineSort}
                onSort={(column) => setLineSort((s) => toggleSort(s, column))}
              />
            </tr>
          </thead>
          <tbody>
            {sortedLines.map((line) => (
              <tr key={line.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{line.label}</td>
                <td className="px-4 py-3">
                  {PRICING_TYPE_LABELS[line.pricingType]}
                </td>
                <td className="px-4 py-3">{line.quantity}</td>
                <td className="px-4 py-3">{formatXof(line.unitPriceXof)}</td>
                <td className="px-4 py-3 font-medium">
                  {formatXof(line.lineTotalXof)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statusMessage && (
        <p className="mt-4 text-sm text-brand">{statusMessage}</p>
      )}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {canDelete && (
        <button
          type="button"
          disabled={updating}
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-6 w-full border border-red-700 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 sm:w-auto"
        >
          Supprimer la commande
        </button>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Supprimer cette commande ?"
        message={`La commande ${order.reference} sera définitivement supprimée.`}
        confirmLabel={updating ? "Suppression…" : "Supprimer"}
        cancelLabel="Annuler"
        danger
        onConfirm={() => {
          if (!updating) {
            void onConfirmDelete();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteSuccess}
        title="Commande supprimée"
        message="La commande a bien été supprimée."
        confirmLabel="Retour à la liste"
        onConfirm={() => router.replace("/commandes")}
      />
    </AppShell>
  );
}

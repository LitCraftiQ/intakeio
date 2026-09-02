"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  markAllDashboardNotificationsReadAction,
  markDashboardNotificationsReadAction,
} from "@/app/(admin)/dashboard/notification-actions";
import type { DashboardNotification } from "@/lib/dashboard/types";
import { useLiveDashboardNotifications } from
  "@/lib/dashboard/use-live-notifications";

type DashboardNotificationsProps = Readonly<{
  notifications: DashboardNotification[];
  errorMessage: string | null;
  ownerUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

function formatNotificationTime(
  value: string,
) {
  const date = new Date(value);
  const now = new Date();

  const elapsedMinutes = Math.floor(
    (now.getTime() - date.getTime()) /
      60_000,
  );

  if (elapsedMinutes < 1) {
    return "Just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(
    elapsedMinutes / 60,
  );

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const elapsedDays = Math.floor(
    elapsedHours / 24,
  );

  if (elapsedDays < 7) {
    return `${elapsedDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function DashboardNotifications({
  notifications: initialNotifications,
  errorMessage,
  ownerUserId,
  open,
  onOpenChange,
}: DashboardNotificationsProps) {
  const notifications =
    useLiveDashboardNotifications(
      initialNotifications,
      ownerUserId,
      !errorMessage,
    );

  const [optimisticReadIds, setOptimisticReadIds] =
    useState<string[]>([]);

  const visibleNotifications = useMemo(
    () =>
      notifications.map((notification) => {
        const read =
          Boolean(notification.readAt) ||
          optimisticReadIds.includes(
            notification.id,
          );

        return {
          ...notification,
          readAt: read
            ? notification.readAt ??
              new Date().toISOString()
            : null,
        };
      }),
    [notifications, optimisticReadIds],
  );

  const unreadIds = visibleNotifications
    .filter(
      (notification) => !notification.readAt,
    )
    .map((notification) => notification.id);

  const unreadCount = unreadIds.length;

  function markRead(ids: string[]) {
    if (ids.length === 0) {
      return;
    }

    setOptimisticReadIds((current) =>
      Array.from(new Set([...current, ...ids])),
    );

    void markDashboardNotificationsReadAction(
      ids,
    );
  }

  function markAllRead() {
    if (unreadIds.length === 0) {
      return;
    }

    setOptimisticReadIds((current) =>
      Array.from(
        new Set([...current, ...unreadIds]),
      ),
    );

    void markAllDashboardNotificationsReadAction();
  }

  return (
    <div>
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => {
          onOpenChange(!open);
        }}
        className="relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-muted)] transition hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--dash-ring)]"
      >
        <Bell
          className="h-[19px] w-[19px]"
          aria-hidden="true"
        />

        {unreadCount > 0 ? (
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--dash-accent)] ring-2 ring-[var(--dash-header)]" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-12 top-14 w-[min(88vw,330px)] rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-popover)] p-3 shadow-[var(--dash-popover-shadow)]">
          <div className="flex items-start justify-between gap-3 px-2 py-2">
            <div>
              <p className="text-sm font-bold">
                Notifications
              </p>

              <p className="mt-1 text-xs text-[var(--dash-muted)]">
                {errorMessage
                  ? "Finish the database setup to receive workspace activity."
                  : unreadCount > 0
                    ? `${unreadCount} new workspace ${
                        unreadCount === 1
                          ? "update"
                          : "updates"
                      }`
                    : "Important workspace activity will appear here."}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-[var(--dash-accent)] transition hover:bg-[var(--dash-surface)]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="mt-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-5">
              <p className="text-sm font-semibold text-[var(--dash-text)]">
                Setup needed
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--dash-muted)]">
                {errorMessage}
              </p>
            </div>
          ) : visibleNotifications.length ===
            0 ? (
            <div className="mt-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-5 text-center">
              <Bell
                className="mx-auto h-5 w-5 text-[var(--dash-soft)]"
                aria-hidden="true"
              />

              <p className="mt-2 text-sm font-semibold text-[var(--dash-muted)]">
                You’re all caught up
              </p>
            </div>
          ) : (
            <div className="mt-1 max-h-[min(60vh,360px)] space-y-1 overflow-y-auto">
              {visibleNotifications.map(
                (notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markRead([
                        notification.id,
                      ]);
                      onOpenChange(false);
                    }}
                    className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--dash-surface)]"
                  >
                    <span
                      className={[
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        notification.readAt
                          ? "bg-transparent"
                          : "bg-[var(--dash-accent)]",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {notification.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[var(--dash-muted)]">
                        {notification.body}
                      </span>

                      <span className="mt-1.5 block text-[11px] font-semibold text-[var(--dash-soft)]">
                        {formatNotificationTime(
                          notification.createdAt,
                        )}
                      </span>
                    </span>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

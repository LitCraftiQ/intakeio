"use client";

import {
  useEffect,
  useState,
} from "react";

import { createClient } from
  "@/lib/supabase/client";

import type {
  DashboardNotification,
} from "./types";

type RawLiveNotification = {
  id: string;
  type: DashboardNotification["type"];
  title: string;
  body: string;
  href: string;
  created_at: string;
  read_at: string | null;
};

function mapLiveNotification(
  row: RawLiveNotification,
): DashboardNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function isLiveNotification(
  value: unknown,
): value is RawLiveNotification {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const row = value as Record<
    string,
    unknown
  >;

  return (
    typeof row.id === "string" &&
    typeof row.type === "string" &&
    typeof row.title === "string" &&
    typeof row.body === "string" &&
    typeof row.href === "string" &&
    typeof row.created_at === "string"
  );
}

export function useLiveDashboardNotifications(
  initialNotifications: DashboardNotification[],
  ownerUserId: string,
  enabled: boolean,
) {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!enabled || !ownerUserId) {
      return;
    }

    const supabase = createClient();

    const channel = supabase
      .channel(
        `dashboard-notifications:${ownerUserId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dashboard_notifications",
          filter:
            `owner_user_id=eq.${ownerUserId}`,
        },
        (payload: { new: unknown }) => {
          if (
            !isLiveNotification(payload.new)
          ) {
            return;
          }

          const next = mapLiveNotification(
            payload.new,
          );

          setNotifications((current) => {
            if (
              current.some(
                (item) =>
                  item.id === next.id,
              )
            ) {
              return current;
            }

            return [next, ...current].slice(
              0,
              20,
            );
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dashboard_notifications",
          filter:
            `owner_user_id=eq.${ownerUserId}`,
        },
        (payload: { new: unknown }) => {
          if (
            !isLiveNotification(payload.new)
          ) {
            return;
          }

          const next = mapLiveNotification(
            payload.new,
          );

          setNotifications((current) =>
            current.map((item) =>
              item.id === next.id
                ? next
                : item,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, [enabled, ownerUserId]);

  return notifications;
}

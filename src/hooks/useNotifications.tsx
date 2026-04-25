import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const db = supabase as any;

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  created_at: string;
  is_read: boolean;
}

export interface PopupNotification extends Notification {
  popupId: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const uid = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popup, setPopup] = useState<PopupNotification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastIdRef = useRef<string | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!uid) return;
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data) return;

    setNotifications(data);
    const unread = data.filter((n: Notification) => !n.is_read);
    setUnreadCount(unread.length);

    // Show popup for newest unread not yet shown
    if (unread.length > 0) {
      const newest = unread[0] as Notification;
      if (newest.id !== lastIdRef.current) {
        lastIdRef.current = newest.id;
        const popupItem: PopupNotification = { ...newest, popupId: newest.id };
        setPopup(popupItem);
        // Auto-dismiss after 1s (0.2s in + 0.6s stay + 0.2s out = 1s total)
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        popupTimerRef.current = setTimeout(() => setPopup(null), 1000);
      }
    }
  }, [uid]);

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    await db.from("notifications").update({ is_read: true }).eq("user_id", uid).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [uid]);

  const markRead = useCallback(async (id: string) => {
    await db.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (!uid) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => {
      clearInterval(interval);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [uid, fetchNotifications]);

  return { notifications, unreadCount, popup, markAllRead, markRead, dismissPopup: () => setPopup(null) };
};

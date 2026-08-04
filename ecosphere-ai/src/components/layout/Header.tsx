"use client";

import { useState } from "react";
import { Bell, Search, Plus, Check } from "lucide-react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface HeaderProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}

export default function Header({ notifications, onMarkRead, onMarkAllRead }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (id: string) => {
    await onMarkRead(id);
  };

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 text-slate-200">
      {/* Search Bar */}
      <div className="relative w-64 max-w-xs hidden sm:block">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </span>
        <input
          type="text"
          placeholder="Search insights, goals..."
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
        />
      </div>

      <div className="flex-1 sm:hidden"></div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Log Action */}
        <Link
          href="/tracker"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 transform active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          <span>Log Activity</span>
        </Link>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-300 relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-20 animate-in fade-in slide-in-from-top-3 duration-250">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5">
                  <h3 className="font-semibold text-xs text-slate-300">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        await onMarkAllRead();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Check className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={async () => {
                          if (!notification.read) {
                            await handleNotificationClick(notification.id);
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                          notification.read
                            ? "bg-slate-950 border-slate-900/50 hover:bg-slate-900/20 text-slate-400"
                            : "bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[11px] truncate block max-w-[180px]">
                            {notification.title}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {formatRelativeDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

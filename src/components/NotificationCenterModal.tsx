import React from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm glass-panel-elevated rounded-3xl p-4 space-y-4 my-12 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white">Notifications</h3>
              <p className="text-[11px] text-slate-400">{unreadCount} unread room alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="p-1.5 rounded-xl text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10"
                title="Mark all read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkRead(n.id);
                  if (n.action_url && onNavigateToTab) {
                    if (n.action_url.includes('expenses')) onNavigateToTab('EXPENSES');
                    if (n.action_url.includes('reimbursement')) onNavigateToTab('REIMBURSEMENTS');
                  }
                }}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                  n.read
                    ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                    : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  <span className="text-[9px] text-slate-500">
                    {new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-slate-300">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

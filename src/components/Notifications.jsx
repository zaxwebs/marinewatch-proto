import { Bell, X, AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Notifications({ notifications }) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end font-sans">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "bg-card border border-border p-2.5 rounded hover:bg-accent transition-all duration-200 relative group shadow-lg",
                    isOpen && "bg-accent"
                )}
            >
                <Bell className="w-4 h-4 text-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-background">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="bg-card border border-border mt-2 w-80 rounded overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 shadow-2xl">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm">
                        <h3 className="font-semibold text-xs tracking-wide">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-accent rounded transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                <Bell className="w-6 h-6 opacity-20" />
                                <span>No notifications</span>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-3 border-b border-border hover:bg-accent/50 transition-colors flex gap-2.5",
                                        !n.read && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center shrink-0 border",
                                        n.type === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            n.type === 'alert' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {n.type === 'warning' ? <AlertTriangle size={12} /> :
                                            n.type === 'alert' ? <AlertCircle size={12} /> :
                                                <Info size={12} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-medium leading-tight mb-0.5">{n.title}</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                                        <span className="text-[10px] text-muted-foreground/70 mt-1.5 block font-mono">{n.time}</span>
                                    </div>
                                    {!n.read && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 bg-secondary/30 border-t border-border text-center">
                        <button className="text-[11px] text-primary hover:text-primary/80 transition-colors font-medium flex items-center justify-center gap-1 mx-auto">
                            <Check size={12} />
                            Mark all as read
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

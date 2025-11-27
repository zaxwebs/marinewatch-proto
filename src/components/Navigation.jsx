import { NavLink } from 'react-router-dom';
import { Ship, MapPin, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navigation() {
    const navItems = [
        { to: '/', label: 'Dashboard', icon: Ship },
        { to: '/vessels', label: 'Vessels', icon: Ship },
        { to: '/zones', label: 'Zones', icon: MapPin },
        { to: '/poi', label: 'Points of Interest', icon: MapPin },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[1500] bg-card border border-border rounded shadow-lg">
            <div className="flex items-center">
                {navItems.map(({ to, label, icon: Icon }, index) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-2 px-4 py-2 transition-all duration-200 text-sm font-medium relative",
                            index > 0 && "border-l border-border",
                            isActive
                                ? "text-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={14} />
                                <span>{label}</span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

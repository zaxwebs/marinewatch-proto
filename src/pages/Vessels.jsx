import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ship, Navigation, ChevronRight, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { getClosestPoi } from '../lib/geoUtils';

export default function Vessels() {
    const navigate = useNavigate();
    const { vessels, pois } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredVessels = vessels.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || v.type === filterType;
        const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const vesselTypes = [...new Set(vessels.map(v => v.type))];
    const vesselStatuses = [...new Set(vessels.map(v => v.status))];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Vessels</h1>

                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search vessels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                >
                                    <option value="all">All Types</option>
                                    {vesselTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                >
                                    <option value="all">All Statuses</option>
                                    {vesselStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filteredVessels.length} of {vessels.length} vessels
                        </div>
                    </div>
                </div>

                {/* Vessel List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVessels.map(vessel => (
                                <button
                                    key={vessel.id}
                                    onClick={() => navigate(`/vessels/${vessel.id}`)}
                                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-all text-left group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                                <Ship className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{vessel.name}</h3>
                                                <p className="text-xs text-muted-foreground">{vessel.type}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded border font-medium",
                                                vessel.status === 'Moving'
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : vessel.status === 'Anchored'
                                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            )}>
                                                {vessel.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Speed</span>
                                            <span className="font-mono text-primary">{vessel.speed.toFixed(1)} kn</span>
                                        </div>

                                        {(() => {
                                            const closest = getClosestPoi(vessel, pois);
                                            return closest ? (
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <MapPin size={10} />Nearest POI
                                                    </span>
                                                    <span className="font-medium truncate ml-2" title={closest.name}>
                                                        {closest.name.length > 15 ? closest.name.slice(0, 15) + '...' : closest.name}
                                                        <span className="text-muted-foreground ml-1">({closest.distance.toFixed(1)} km)</span>
                                                    </span>
                                                </div>
                                            ) : null;
                                        })()}

                                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
                                            <Navigation size={12} />
                                            <span className="font-mono">{vessel.heading}°</span>
                                            <span className="mx-1">•</span>
                                            <span className="font-mono text-[10px]">{vessel.lat.toFixed(2)}, {vessel.lng.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredVessels.length === 0 && (
                            <div className="text-center py-12">
                                <Ship className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground">No vessels found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

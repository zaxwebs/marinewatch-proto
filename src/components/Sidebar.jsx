import { Search, Ship, Navigation, X, Play, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { getClosestPoi } from '../lib/geoUtils';
import { useSettings } from '../context/SettingsContext';
import { useState } from 'react';

export default function Sidebar({ vessels, pois = [], selectedVessel, onSelectVessel, onReplayStart, isOpen, setIsOpen }) {
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedVessel, setExpandedVessel] = useState(null);

    const filteredVessels = vessels.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={cn(
            "z-10 flex flex-col transition-all duration-300 ease-in-out bg-card border-r border-border overflow-hidden",
            isOpen ? "w-80" : "w-0 border-r-0"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
                            <Ship className="text-primary w-4 h-4" />
                        </div>
                        <h1 className="text-sm font-semibold tracking-tight">Vessels</h1>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{vessels.length}</span>
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search vessels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary border border-border rounded py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
                    />
                </div>
            </div>

            {/* Vessel List */}
            <div className="flex-1 overflow-y-auto">
                {filteredVessels.map(vessel => (
                    <div
                        key={vessel.id}
                        className={cn(
                            "border-b border-border transition-all",
                            selectedVessel?.id === vessel.id ? "bg-primary/5" : "hover:bg-accent/50"
                        )}
                    >
                        <div
                            onClick={() => {
                                onSelectVessel(vessel);
                                setExpandedVessel(expandedVessel === vessel.id ? null : vessel.id);
                            }}
                            className="p-3 cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{vessel.name}</span>
                                        <ChevronDown
                                            className={cn(
                                                "w-3 h-3 text-muted-foreground transition-transform",
                                                expandedVessel === vessel.id && "rotate-180"
                                            )}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{vessel.type}</span>
                                </div>
                                <div className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded font-medium border",
                                    vessel.status === 'Moving'
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : vessel.status === 'Anchored'
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                )}>
                                    {vessel.status}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs flex-wrap">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Navigation className="w-3 h-3" />
                                    <span className="font-mono">{vessel.speed.toFixed(1)}</span>
                                    <span className="text-[10px]">kn</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="font-mono">{vessel.heading}°</span>
                                </div>
                                {(() => {
                                    const closest = getClosestPoi(vessel, pois);
                                    return closest ? (
                                        <div className="flex items-center gap-1 text-muted-foreground" title={closest.name}>
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            <span className="truncate max-w-[80px]">{closest.name}</span>
                                            <span className="text-[10px] shrink-0">({closest.distance.toFixed(1)} {settings.distanceUnit})</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedVessel === vessel.id && (
                            <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                {onReplayStart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReplayStart(vessel);
                                        }}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors font-medium"
                                    >
                                        <Play size={12} />
                                        <span>Replay Track</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

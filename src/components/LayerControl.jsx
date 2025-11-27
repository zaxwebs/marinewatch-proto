import { Layers, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function LayerControl({ layers, onLayerToggle, className, isOpen, onToggle }) {
    // const [isOpen, setIsOpen] = useState(false); // Removed internal state
    const [expandedGroups, setExpandedGroups] = useState(['zones', 'vessels']);

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const toggleAllInGroup = (groupLayers, enable) => {
        groupLayers.forEach(layer => {
            if (layer.visible !== enable) {
                onLayerToggle(layer.id);
            }
        });
    };

    const layerGroups = [
        {
            id: 'zones',
            label: 'Zones',
            layers: layers.filter(l => l.type === 'zone')
        },
        {
            id: 'vessels',
            label: 'Vessels',
            layers: layers.filter(l => l.type === 'vessel')
        },
        {
            id: 'tracks',
            label: 'Tracks',
            layers: layers.filter(l => l.type === 'track')
        },
        {
            id: 'pois',
            label: 'Points of Interest',
            layers: layers.filter(l => l.type === 'poi')
        }
    ].filter(group => group.layers.length > 0);

    return (
        <div className={cn("flex flex-col items-end font-sans", className)}>
            <button
                onClick={onToggle}
                className={cn(
                    "bg-card border border-border p-2.5 rounded hover:bg-accent transition-all duration-200 relative group shadow-lg",
                    isOpen && "bg-accent"
                )}
            >
                <Layers className="w-4 h-4 text-foreground" />
            </button>

            {isOpen && (
                <div className="bg-card border border-border mt-2 w-72 rounded overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 shadow-2xl">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm">
                        <h3 className="font-semibold text-xs tracking-wide">Map Layers</h3>
                        <button onClick={onToggle} className="p-1 hover:bg-accent rounded transition-colors">
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {layerGroups.map(group => {
                            const allVisible = group.layers.every(l => l.visible);
                            const someVisible = group.layers.some(l => l.visible);

                            return (
                                <div key={group.id} className="border-b border-border last:border-b-0">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleGroup(group.id)}
                                            className="flex-1 p-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                                        >
                                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                {group.label}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={cn(
                                                    "text-muted-foreground transition-transform",
                                                    expandedGroups.includes(group.id) && "rotate-180"
                                                )}
                                            />
                                        </button>
                                        <button
                                            onClick={() => toggleAllInGroup(group.layers, !allVisible)}
                                            className="p-3 hover:bg-accent/50 transition-colors border-l border-border"
                                            title={allVisible ? "Hide all" : "Show all"}
                                        >
                                            {allVisible ? (
                                                <Eye size={14} className="text-primary" />
                                            ) : someVisible ? (
                                                <Eye size={14} className="text-muted-foreground opacity-50" />
                                            ) : (
                                                <EyeOff size={14} className="text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>

                                    {expandedGroups.includes(group.id) && (
                                        <div>
                                            {group.layers.map(layer => (
                                                <button
                                                    key={layer.id}
                                                    onClick={() => onLayerToggle(layer.id)}
                                                    className="w-full flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        {layer.color && (
                                                            <div
                                                                className="w-3 h-3 rounded border border-white/20 shrink-0"
                                                                style={{ backgroundColor: layer.color }}
                                                            />
                                                        )}
                                                        <span className="text-xs truncate">{layer.name}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "p-1 rounded transition-colors",
                                                        layer.visible ? "text-primary" : "text-muted-foreground"
                                                    )}>
                                                        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-2 bg-secondary/30 border-t border-border">
                        <button
                            onClick={() => {
                                layers.forEach(layer => {
                                    if (!layer.visible) onLayerToggle(layer.id);
                                });
                            }}
                            className="w-full text-[11px] text-primary hover:text-primary/80 transition-colors font-medium py-1"
                        >
                            Show All Layers
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

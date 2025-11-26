import React, { useEffect, useState, useRef } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    MapPin,
    Maximize2,
    RotateCcw,
    Palette,
    Check,
    Search,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { createPoiMarker } from '../lib/mapUtils';
import { useApp } from '../context/AppContext';

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const POI_TYPES = [
    { value: 'general', label: 'General', color: '#3b82f6', description: 'General point of interest' },
    { value: 'port', label: 'Port', color: '#10b981', description: 'Port or harbor location' },
    { value: 'anchorage', label: 'Anchorage', color: '#f59e0b', description: 'Designated anchorage area' },
    { value: 'hazard', label: 'Hazard', color: '#ef4444', description: 'Navigational hazard' },
    { value: 'landmark', label: 'Landmark', color: '#8b5cf6', description: 'Visual landmark' },
];

function MapController({ fitBounds }) {
    const map = useMap();
    useEffect(() => {
        if (fitBounds) {
            try { map.setView(fitBounds, 14); }
            catch (e) { console.error("Map view error", e); }
        }
    }, [map, fitBounds]);
    return null;
}

function AddPointHandler({ isAdding, onPointAdded }) {
    const [mousePos, setMousePos] = useState(null);
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();
        if (isAdding) {
            container.style.cursor = 'crosshair';
        } else {
            container.style.cursor = '';
        }
        return () => { container.style.cursor = ''; };
    }, [isAdding, map]);

    useMapEvents({
        click: (e) => {
            if (isAdding) {
                onPointAdded(e.latlng);
            }
        },
        mousemove: (e) => {
            if (isAdding) {
                setMousePos(e.latlng);
            }
        },
    });

    return null;
}

export default function PointsOfInterest() {
    const { pois, setPois } = useApp();

    const [selectedPoi, setSelectedPoi] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [newPoiForm, setNewPoiForm] = useState({ name: '', type: 'general', color: '#3b82f6', description: '', customColor: false });
    const [editForm, setEditForm] = useState({ name: '', type: 'general', description: '', color: '#3b82f6', customColor: false });

    const [mapFitBounds, setMapFitBounds] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const mapRef = useRef(null);

    // Local storage effect removed as it is handled in AppContext

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (isAdding) { setIsAdding(false); }
                else if (isEditing) { setIsEditing(false); setSelectedPoi(null); }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isAdding, isEditing]);

    const handleStartAdding = () => {
        setIsAdding(true);
        setSelectedPoi(null);
        setIsEditing(false);
        setNewPoiForm({ name: '', type: 'general', color: '#3b82f6', description: '', customColor: false });
    };

    const handleCancelAdding = () => { setIsAdding(false); };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            let name = data.display_name;
            if (data.address) {
                const parts = [
                    data.address.amenity,
                    data.address.building,
                    data.address.road,
                    data.address.suburb,
                    data.address.city || data.address.town || data.address.village
                ].filter(Boolean);
                if (parts.length > 0) name = parts.slice(0, 3).join(', ');
            }
            return name || `Point at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (error) {
            console.error("Failed to fetch address", error);
            return `Point at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    const handlePointAdded = async (latlng) => {
        const selectedType = POI_TYPES.find((t) => t.value === newPoiForm.type);
        const color = newPoiForm.customColor ? newPoiForm.color : selectedType?.color || newPoiForm.color;

        // Optimistic name
        const tempName = newPoiForm.name || "Fetching address...";

        const newPoi = {
            id: `p${Date.now()}`,
            name: tempName,
            type: newPoiForm.type,
            color,
            description: newPoiForm.description || selectedType?.description || '',
            lat: latlng.lat,
            lng: latlng.lng,
        };

        setPois(prev => [...prev, newPoi]);
        setIsAdding(false);

        if (!newPoiForm.name) {
            const addressName = await fetchAddress(latlng.lat, latlng.lng);
            setPois(prev => prev.map(p => p.id === newPoi.id ? { ...p, name: addressName } : p));
        }
    };

    const handleEdit = (poi) => {
        setSelectedPoi(poi);
        setEditForm({
            name: poi.name,
            type: poi.type,
            description: poi.description || '',
            color: poi.color,
            customColor: !POI_TYPES.find((t) => t.value === poi.type && t.color === poi.color)
        });
        setIsEditing(true);
        setIsAdding(false);
        setMapFitBounds([poi.lat, poi.lng]);
    };

    const handleSave = () => {
        if (selectedPoi) {
            const selectedType = POI_TYPES.find((t) => t.value === editForm.type);
            const updates = {
                name: editForm.name,
                type: editForm.type,
                color: editForm.customColor ? editForm.color : selectedType?.color || editForm.color,
                description: editForm.description,
            };
            setPois(pois.map(p => p.id === selectedPoi.id ? { ...p, ...updates } : p));
        }
        setIsEditing(false);
        setSelectedPoi(null);
    };

    const handleDelete = () => {
        if (confirmDelete) {
            setPois(pois.filter(p => p.id !== confirmDelete));
            setSelectedPoi(null);
            setIsEditing(false);
            setConfirmDelete(null);
        }
    };

    const handleTypeChange = (type, isNew = false) => {
        const t = POI_TYPES.find((x) => x.value === type);
        if (isNew) setNewPoiForm((p) => ({ ...p, type, color: t?.color || p.color, description: p.description || t?.description || '', customColor: false }));
        else setEditForm((p) => ({ ...p, type, color: t?.color || p.color, customColor: false }));
    };

    const currentPoiColor = newPoiForm.customColor ? newPoiForm.color : POI_TYPES.find((t) => t.value === newPoiForm.type)?.color || '#3b82f6';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50">
                    <div className="bg-card border border-border rounded-lg shadow-xl w-80 p-4">
                        <h3 className="font-semibold mb-2">Delete Point?</h3>
                        <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 text-sm bg-secondary rounded hover:bg-accent">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-72 bg-card border-r border-border flex flex-col">
                <div className="p-3 border-b border-border">
                    <h1 className="text-base font-semibold">Points of Interest</h1>
                </div>

                {/* Adding Mode */}
                {isAdding && (
                    <div className="p-3 bg-primary/5 border-b border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Plus size={14} className="text-primary" />
                            <span className="font-medium text-sm">Adding New Point</span>
                        </div>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newPoiForm.name}
                                onChange={(e) => setNewPoiForm({ ...newPoiForm, name: e.target.value })}
                                placeholder="Point name (optional)"
                                className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-xs"
                            />
                            <select
                                value={newPoiForm.type}
                                onChange={(e) => handleTypeChange(e.target.value, true)}
                                className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-xs"
                            >
                                {POI_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-border shrink-0" style={{ backgroundColor: currentPoiColor }} />
                                {newPoiForm.customColor ? (
                                    <input type="color" value={newPoiForm.color} onChange={(e) => setNewPoiForm({ ...newPoiForm, color: e.target.value })} className="flex-1 h-6 bg-secondary border border-border rounded cursor-pointer" />
                                ) : (
                                    <button onClick={() => setNewPoiForm({ ...newPoiForm, customColor: true })} className="text-[10px] text-primary flex items-center gap-1"><Palette size={10} />Custom</button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                            <button onClick={handleCancelAdding} className="flex-1 bg-secondary py-1.5 rounded text-xs"><X size={12} className="inline mr-1" />Cancel</button>
                            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">Click map to place</div>
                        </div>
                    </div>
                )}

                {/* POI List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {pois.length === 0 ? (
                        <div className="text-center py-10">
                            <MapPin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No points yet</p>
                        </div>
                    ) : pois.map((poi) => {
                        const isSelected = selectedPoi?.id === poi.id;
                        const poiType = POI_TYPES.find(t => t.value === poi.type);
                        return (
                            <div
                                key={poi.id}
                                onClick={() => { if (!isAdding) { setSelectedPoi(poi); setMapFitBounds([poi.lat, poi.lng]); } }}
                                className={cn(
                                    'bg-card border border-border rounded-md p-2.5 hover:bg-accent/50 transition-all cursor-pointer group',
                                    isSelected && 'ring-1 ring-primary',
                                    isAdding && 'opacity-40 pointer-events-none'
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${poi.color}20` }}
                                        >
                                            <MapPin className="w-4 h-4" style={{ color: poi.color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">{poi.name}</h3>
                                            <p className="text-[11px] text-muted-foreground capitalize">{poiType?.label || poi.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(poi); }}
                                        className="p-1 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors shrink-0"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                <div className="space-y-1 text-[11px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground font-mono">{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setMapFitBounds([poi.lat, poi.lng]); }}
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            <Maximize2 size={11} />
                                            <span>Zoom</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(poi.id); }}
                                            className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={11} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Button */}
                {!isAdding && (
                    <div className="p-3 border-t border-border">
                        <button onClick={handleStartAdding} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded flex items-center justify-center gap-2 text-sm font-medium">
                            <Plus size={16} />Add Point
                        </button>
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer center={[1.28, 103.85]} zoom={12} className="h-full w-full z-0" whenCreated={(m) => (mapRef.current = m)} zoomControl>
                    <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <MapController fitBounds={mapFitBounds} />
                    <AddPointHandler isAdding={isAdding} onPointAdded={handlePointAdded} />

                    {pois.map((poi) => {
                        const isEditingThis = isEditing && selectedPoi?.id === poi.id;
                        return (
                            <Marker
                                key={poi.id}
                                position={[poi.lat, poi.lng]}
                                icon={createPoiMarker(poi.color, isEditingThis)}
                                draggable={isEditingThis}
                                eventHandlers={{
                                    click: () => {
                                        if (!isAdding) {
                                            setSelectedPoi(poi);
                                            setMapFitBounds([poi.lat, poi.lng]);
                                        }
                                    },
                                    dragend: (e) => {
                                        if (isEditingThis) {
                                            const { lat, lng } = e.target.getLatLng();
                                            setPois(pois.map(p => p.id === poi.id ? { ...p, lat, lng } : p));
                                        }
                                    }
                                }}
                            >
                                {!isEditingThis && (
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <h3 className="font-medium text-sm mb-1">{poi.name}</h3>
                                            <p className="text-xs text-muted-foreground">{poi.description || "No description"}</p>
                                        </div>
                                    </Popup>
                                )}
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Edit Panel */}
                {isEditing && selectedPoi && !isAdding && (
                    <div className="absolute top-3 right-3 w-80 bg-card border border-border rounded-lg shadow-xl max-h-[calc(100vh-24px)] overflow-hidden flex flex-col z-[1000]">
                        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: editForm.color }} />
                                <span className="font-medium text-sm truncate">{selectedPoi.name}</span>
                            </div>
                            <button onClick={() => { setIsEditing(false); setSelectedPoi(null); }} className="p-1 hover:bg-accent rounded"><X size={14} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            <div className="space-y-2">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</label>
                                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                                        {POI_TYPES.map((t) => (
                                            <button key={t.value} onClick={() => handleTypeChange(t.value)} className={cn('p-1.5 rounded border text-xs flex items-center gap-1.5', editForm.type === t.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
                                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-xs mt-1 resize-none" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Color</label>
                                        <button onClick={() => setEditForm({ ...editForm, customColor: !editForm.customColor })} className="text-[10px] text-primary flex items-center gap-1"><Palette size={10} />{editForm.customColor ? 'Default' : 'Custom'}</button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: editForm.color }} />
                                        {editForm.customColor && <input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="flex-1 h-6 bg-secondary border border-border rounded cursor-pointer" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-border flex gap-2 shrink-0">
                            <button onClick={() => setConfirmDelete(selectedPoi.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded"><Trash2 size={14} /></button>
                            <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-sm font-medium flex items-center justify-center gap-1.5"><Save size={14} />Save</button>
                        </div>
                    </div>
                )}

                {/* Adding Instructions */}
                {isAdding && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border rounded-lg px-4 py-2 shadow-lg z-[1000]">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Click map</span> to place point • <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px]">Esc</kbd> cancel
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

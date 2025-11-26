import React, { useEffect, useState, useRef } from 'react';
import {
    MapContainer,
    TileLayer,
    Polygon,
    useMapEvents,
    Marker,
    Polyline,
    Circle,
    useMap,
} from 'react-leaflet';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Pencil,
    Check,
    Undo,
    Palette,
    MapPin,
    Maximize2,
    RotateCcw,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

const ZONE_TYPES = [
    { value: 'port', label: 'Port', color: '#10b981', description: 'Commercial port area' },
    { value: 'restricted', label: 'Restricted', color: '#ef4444', description: 'No-entry zone' },
    { value: 'fishing', label: 'Fishing', color: '#3b82f6', description: 'Fishing permitted area' },
    { value: 'anchorage', label: 'Anchorage', color: '#f59e0b', description: 'Anchoring area' },
];

const MIN_DISTANCE_METERS = 5;
const MIN_POINTS = 3;

const createMarkerIcon = (color = '#ff6b35', isHovered = false) =>
    L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:${isHovered ? 16 : 12}px;height:${isHovered ? 16 : 12}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
        iconSize: [isHovered ? 16 : 12, isHovered ? 16 : 12],
        iconAnchor: [isHovered ? 8 : 6, isHovered ? 8 : 6],
    });

const deleteMarkerIcon = L.divIcon({
    className: 'custom-marker-delete',
    html: `<div style="width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">×</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

function segmentsIntersect(a1, a2, b1, b2) {
    const orient = (p, q, r) => {
        const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (Math.abs(val) < Number.EPSILON) return 0;
        return val > 0 ? 1 : 2;
    };
    const onSegment = (p, q, r) =>
        Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) &&
        Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
    const o1 = orient(a1, a2, b1), o2 = orient(a1, a2, b2), o3 = orient(b1, b2, a1), o4 = orient(b1, b2, a2);
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(a1, b1, a2)) return true;
    if (o2 === 0 && onSegment(a1, b2, a2)) return true;
    if (o3 === 0 && onSegment(b1, a1, b2)) return true;
    if (o4 === 0 && onSegment(b1, a2, b2)) return true;
    return false;
}

function polygonSelfIntersects(points) {
    if (!points || points.length < 4) return false;
    const n = points.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 2)) continue;
            if (segmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) return true;
        }
    }
    return false;
}

function MapController({ fitBounds }) {
    const map = useMap();
    useEffect(() => {
        if (fitBounds?.length > 0) {
            try { map.fitBounds(L.latLngBounds(fitBounds), { padding: [50, 50] }); }
            catch { if (fitBounds[0]) map.setView(fitBounds[0], 14); }
        }
    }, [map, fitBounds]);
    return null;
}

function DrawingHandler({ isDrawing, onPointAdded, drawingPoints, editingPoints, onEditPoint, isEditingCoordinates, onAddEditPoint, onDeleteEditPoint, onFinishDrawing, zoneColor }) {
    const [mousePos, setMousePos] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [nearStart, setNearStart] = useState(false);
    const draggingRef = useRef({});
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();
        if (isDrawing) {
            container.style.cursor = nearStart ? 'pointer' : 'crosshair';
        } else {
            container.style.cursor = '';
        }
        return () => { container.style.cursor = ''; };
    }, [isDrawing, nearStart, map]);

    useMapEvents({
        click: (e) => {
            if (isDrawing) {
                if (drawingPoints.length >= MIN_POINTS) {
                    const firstPx = map.latLngToContainerPoint(drawingPoints[0]);
                    const clickPx = map.latLngToContainerPoint(e.latlng);
                    const pxDist = Math.sqrt(Math.pow(firstPx.x - clickPx.x, 2) + Math.pow(firstPx.y - clickPx.y, 2));
                    if (pxDist < 15) { onFinishDrawing?.(); return; }
                }
                onPointAdded([e.latlng.lat, e.latlng.lng]);
            }
        },
        mousemove: (e) => {
            if (isDrawing) {
                setMousePos([e.latlng.lat, e.latlng.lng]);
                if (drawingPoints.length >= MIN_POINTS) {
                    const firstPx = map.latLngToContainerPoint(drawingPoints[0]);
                    const mousePx = map.latLngToContainerPoint(e.latlng);
                    const pxDist = Math.sqrt(Math.pow(firstPx.x - mousePx.x, 2) + Math.pow(firstPx.y - mousePx.y, 2));
                    setNearStart(pxDist < 15);
                } else {
                    setNearStart(false);
                }
            }
        },
    });

    const color = zoneColor || '#3b82f6';

    if (isDrawing && drawingPoints?.length > 0) {
        const lastPoint = drawingPoints[drawingPoints.length - 1];
        const canClose = drawingPoints.length >= MIN_POINTS;
        return (
            <>
                {drawingPoints.length >= 3 && (
                    <Polygon positions={drawingPoints} pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 0 }} />
                )}
                {drawingPoints.map((point, idx) => (
                    <Circle
                        key={`draw-${idx}`}
                        center={point}
                        radius={idx === 0 && canClose ? 8 : 5}
                        pathOptions={{ color: idx === 0 && canClose ? '#10b981' : color, fillColor: idx === 0 && canClose ? '#10b981' : color, fillOpacity: 0.9, weight: 2 }}
                        eventHandlers={{
                            click: (e) => { L.DomEvent.stopPropagation(e); if (idx === 0 && canClose) onFinishDrawing?.(); },
                            mouseover: (e) => { if (idx === 0 && canClose) e.target.setStyle({ radius: 12 }); },
                            mouseout: (e) => { if (idx === 0 && canClose) e.target.setStyle({ radius: 8 }); },
                        }}
                    />
                ))}
                {drawingPoints.length > 1 && <Polyline positions={drawingPoints} pathOptions={{ color, weight: 2, dashArray: '6,6' }} />}
                {mousePos && (
                    <>
                        <Polyline positions={[lastPoint, mousePos]} pathOptions={{ color, weight: 2, dashArray: '4,4', opacity: 0.5 }} />
                        {canClose && <Polyline positions={[mousePos, drawingPoints[0]]} pathOptions={{ color: '#10b981', weight: 1, dashArray: '4,4', opacity: 0.3 }} />}
                    </>
                )}
            </>
        );
    }

    if (isEditingCoordinates && editingPoints?.length > 0) {
        const ghostPoints = editingPoints.map((p, i) => {
            const next = editingPoints[(i + 1) % editingPoints.length];
            return { latlng: [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2], insertIndex: (i + 1) % editingPoints.length };
        });
        return (
            <>
                <Polygon positions={editingPoints} pathOptions={{ color: '#ff6b35', fillColor: '#ff6b35', fillOpacity: 0.1, weight: 0 }} />
                <Polyline positions={[...editingPoints, editingPoints[0]]} pathOptions={{ color: '#ff6b35', weight: 2, dashArray: '5,5' }} />
                {editingPoints.map((point, index) => (
                    <Marker
                        key={`edit-${index}`}
                        position={point}
                        icon={hoveredIndex === index ? deleteMarkerIcon : createMarkerIcon('#ff6b35', hoveredIndex === index)}
                        draggable
                        eventHandlers={{
                            dragstart: () => { draggingRef.current[index] = true; },
                            drag: (e) => { onEditPoint?.(index, [e.target.getLatLng().lat, e.target.getLatLng().lng]); },
                            dragend: (e) => { draggingRef.current[index] = false; onEditPoint?.(index, [e.target.getLatLng().lat, e.target.getLatLng().lng]); },
                            mouseover: () => setHoveredIndex(index),
                            mouseout: () => setHoveredIndex(null),
                            click: (e) => { if (draggingRef.current[index]) return; L.DomEvent.stopPropagation(e); if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) onDeleteEditPoint?.(index); },
                            dblclick: (e) => { L.DomEvent.stopPropagation(e); onDeleteEditPoint?.(index); },
                            contextmenu: (e) => { L.DomEvent.preventDefault(e); L.DomEvent.stopPropagation(e); onDeleteEditPoint?.(index); },
                        }}
                    />
                ))}
                {ghostPoints.map((gp, i) => (
                    <Marker
                        key={`ghost-${i}`}
                        position={gp.latlng}
                        draggable
                        icon={L.divIcon({ className: 'ghost-marker', html: `<div style="width:8px;height:8px;background:#ff6b35;border-radius:50%;opacity:0.5;border:1px solid white;"></div>`, iconSize: [8, 8], iconAnchor: [4, 4] })}
                        eventHandlers={{
                            dragend: (e) => onAddEditPoint?.([e.target.getLatLng().lat, e.target.getLatLng().lng], gp.insertIndex),
                            click: (e) => { L.DomEvent.stopPropagation(e); onAddEditPoint?.(gp.latlng, gp.insertIndex); },
                        }}
                    />
                ))}
            </>
        );
    }
    return null;
}

export default function Zones() {
    const { zones, addZone, updateZone, deleteZone } = useApp();
    const [selectedZone, setSelectedZone] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEditingCoordinates, setIsEditingCoordinates] = useState(false);
    const [drawingPoints, setDrawingPoints] = useState([]);
    const [editingPoints, setEditingPoints] = useState(null);
    const [newZoneForm, setNewZoneForm] = useState({ name: '', type: 'port', color: '#10b981', description: '', customColor: false });
    const [editForm, setEditForm] = useState({ name: '', type: 'port', description: '', color: '#10b981', customColor: false });
    const [mapFitBounds, setMapFitBounds] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (isDrawing) { setIsDrawing(false); setDrawingPoints([]); }
                else if (isEditingCoordinates) { setIsEditingCoordinates(false); setEditingPoints(null); }
                else if (isEditing) { setIsEditing(false); setSelectedZone(null); }
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && isDrawing) {
                setDrawingPoints((p) => p.slice(0, -1));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isDrawing, isEditingCoordinates, isEditing]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const handler = (ev) => { if (isEditingCoordinates) ev.preventDefault(); };
        const container = map.getContainer?.();
        container?.addEventListener('contextmenu', handler);
        return () => container?.removeEventListener('contextmenu', handler);
    }, [isEditingCoordinates]);

    const isTooClose = (points, latlng) => points.some((p) => L.latLng(p).distanceTo(L.latLng(latlng)) < MIN_DISTANCE_METERS);

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setDrawingPoints([]);
        setSelectedZone(null);
        setIsEditing(false);
        setNewZoneForm({ name: '', type: 'port', color: '#10b981', description: '', customColor: false });
    };

    const handleCancelDrawing = () => { setIsDrawing(false); setDrawingPoints([]); };
    const handleAddPoint = (point) => { if (!isTooClose(drawingPoints, point)) setDrawingPoints((p) => [...p, point]); };
    const handleUndoPoint = () => setDrawingPoints((p) => p.slice(0, -1));

    const handleFinishDrawing = () => {
        if (drawingPoints.length < MIN_POINTS) return;
        const selectedType = ZONE_TYPES.find((t) => t.value === newZoneForm.type);
        const color = newZoneForm.customColor ? newZoneForm.color : selectedType?.color || newZoneForm.color;
        addZone({
            id: `z${Date.now()}`,
            name: newZoneForm.name || `Zone ${zones.length + 1}`,
            type: newZoneForm.type,
            color,
            description: newZoneForm.description || selectedType?.description || '',
            coordinates: drawingPoints,
        });
        setIsDrawing(false);
        setDrawingPoints([]);
    };

    const handleEdit = (zone) => {
        setSelectedZone(zone);
        setEditForm({ name: zone.name, type: zone.type, description: zone.description || '', color: zone.color, customColor: !ZONE_TYPES.find((t) => t.value === zone.type && t.color === zone.color) });
        setIsEditing(true);
        setIsEditingCoordinates(true);
        setEditingPoints([...zone.coordinates]);
        setIsDrawing(false);
        if (zone.coordinates?.length) setMapFitBounds(zone.coordinates);
    };

    const handleEditPoint = (index, newPoint) => setEditingPoints((p) => { const c = [...p]; c[index] = newPoint; return c; });
    const handleAddEditPoint = (point, index) => setEditingPoints((p) => { const c = [...(p || [])]; if (index != null) c.splice(index, 0, point); else c.push(point); return c; });
    const handleDeleteEditPoint = (index) => setEditingPoints((p) => p?.length <= MIN_POINTS ? p : p.filter((_, i) => i !== index));

    const handleSave = () => {
        if (selectedZone) {
            const selectedType = ZONE_TYPES.find((t) => t.value === editForm.type);
            const updates = {
                name: editForm.name,
                type: editForm.type,
                color: editForm.customColor ? editForm.color : selectedType?.color || editForm.color,
                description: editForm.description,
            };
            if (isEditingCoordinates && editingPoints?.length >= MIN_POINTS) {
                if (!polygonSelfIntersects([...editingPoints, editingPoints[0]])) {
                    updates.coordinates = editingPoints;
                }
            }
            updateZone(selectedZone.id, updates);
        }
        setIsEditing(false);
        setSelectedZone(null);
        setIsEditingCoordinates(false);
        setEditingPoints(null);
    };

    const handleDelete = () => {
        if (confirmDelete) {
            deleteZone(confirmDelete);
            setSelectedZone(null);
            setIsEditing(false);
            setIsEditingCoordinates(false);
            setEditingPoints(null);
            setConfirmDelete(null);
        }
    };

    const handleTypeChange = (type, isNew = false) => {
        const t = ZONE_TYPES.find((x) => x.value === type);
        if (isNew) setNewZoneForm((p) => ({ ...p, type, color: t?.color || p.color, description: p.description || t?.description || '', customColor: false }));
        else setEditForm((p) => ({ ...p, type, color: t?.color || p.color, customColor: false }));
    };

    const handlePolygonClick = (zone) => {
        if (isDrawing || isEditingCoordinates) return;
        setSelectedZone(zone);
        if (zone.coordinates?.length) setMapFitBounds(zone.coordinates);
    };

    const currentZoneColor = newZoneForm.customColor ? newZoneForm.color : ZONE_TYPES.find((t) => t.value === newZoneForm.type)?.color || '#3b82f6';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50">
                    <div className="bg-card border border-border rounded-lg shadow-xl w-80 p-4">
                        <h3 className="font-semibold mb-2">Delete Zone?</h3>
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
                    <h1 className="text-base font-semibold">Zone Management</h1>
                </div>

                {/* Drawing Mode */}
                {isDrawing && (
                    <div className="p-3 bg-primary/5 border-b border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Pencil size={14} className="text-primary" />
                            <span className="font-medium text-sm">Drawing Mode</span>
                            <span className="ml-auto text-xs text-muted-foreground">{drawingPoints.length} pts</span>
                        </div>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newZoneForm.name}
                                onChange={(e) => setNewZoneForm({ ...newZoneForm, name: e.target.value })}
                                placeholder="Zone name"
                                className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-xs"
                            />
                            <select
                                value={newZoneForm.type}
                                onChange={(e) => handleTypeChange(e.target.value, true)}
                                className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-xs"
                            >
                                {ZONE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-border shrink-0" style={{ backgroundColor: currentZoneColor }} />
                                {newZoneForm.customColor ? (
                                    <input type="color" value={newZoneForm.color} onChange={(e) => setNewZoneForm({ ...newZoneForm, color: e.target.value })} className="flex-1 h-6 bg-secondary border border-border rounded cursor-pointer" />
                                ) : (
                                    <button onClick={() => setNewZoneForm({ ...newZoneForm, customColor: true })} className="text-[10px] text-primary flex items-center gap-1"><Palette size={10} />Custom</button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                            <button onClick={handleUndoPoint} disabled={!drawingPoints.length} className="flex-1 bg-secondary py-1.5 rounded text-xs flex items-center justify-center gap-1 disabled:opacity-50"><Undo size={12} />Undo</button>
                            <button onClick={() => setDrawingPoints([])} disabled={!drawingPoints.length} className="flex-1 bg-secondary py-1.5 rounded text-xs flex items-center justify-center gap-1 disabled:opacity-50"><RotateCcw size={12} />Clear</button>
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                            <button onClick={handleCancelDrawing} className="flex-1 bg-secondary py-1.5 rounded text-xs"><X size={12} className="inline mr-1" />Cancel</button>
                            <button onClick={handleFinishDrawing} disabled={drawingPoints.length < MIN_POINTS} className="flex-1 bg-primary text-primary-foreground py-1.5 rounded text-xs font-medium disabled:opacity-50"><Check size={12} className="inline mr-1" />Create</button>
                        </div>
                    </div>
                )}

                {/* Zone List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {zones.length === 0 ? (
                        <div className="text-center py-10">
                            <MapPin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No zones yet</p>
                        </div>
                    ) : zones.map((zone) => {
                        const isSelected = selectedZone?.id === zone.id;
                        const zoneType = ZONE_TYPES.find(t => t.value === zone.type);
                        return (
                            <div
                                key={zone.id}
                                onClick={() => { if (!isDrawing && !isEditingCoordinates) { setSelectedZone(zone); setMapFitBounds(zone.coordinates); } }}
                                className={cn(
                                    'bg-card border border-border rounded-md p-2.5 hover:bg-accent/50 transition-all cursor-pointer group',
                                    isSelected && 'ring-1 ring-primary',
                                    (isDrawing || isEditingCoordinates) && 'opacity-40 pointer-events-none'
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${zone.color}20` }}
                                        >
                                            <MapPin className="w-4 h-4" style={{ color: zone.color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">{zone.name}</h3>
                                            <p className="text-[11px] text-muted-foreground capitalize">{zoneType?.label || zone.type}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(zone); }} 
                                        className="p-1 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors shrink-0"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                <div className="space-y-1 text-[11px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Points</span>
                                        <span className="font-mono text-primary">{zone.coordinates?.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setMapFitBounds(zone.coordinates); }} 
                                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            <Maximize2 size={11} />
                                            <span>Zoom</span>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(zone.id); }} 
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

                {/* Add Zone Button */}
                {!isDrawing && !isEditingCoordinates && (
                    <div className="p-3 border-t border-border">
                        <button onClick={handleStartDrawing} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded flex items-center justify-center gap-2 text-sm font-medium">
                            <Plus size={16} />Draw Zone
                        </button>
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer center={[1.28, 103.85]} zoom={12} className="h-full w-full z-0" whenCreated={(m) => (mapRef.current = m)} zoomControl>
                    <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <MapController fitBounds={mapFitBounds} />
                    <DrawingHandler
                        isDrawing={isDrawing}
                        onPointAdded={handleAddPoint}
                        drawingPoints={drawingPoints}
                        editingPoints={editingPoints}
                        onEditPoint={handleEditPoint}
                        isEditingCoordinates={isEditingCoordinates}
                        onAddEditPoint={handleAddEditPoint}
                        onDeleteEditPoint={handleDeleteEditPoint}
                        onFinishDrawing={handleFinishDrawing}
                        zoneColor={currentZoneColor}
                    />
                    {zones.map((zone) => (
                        <Polygon
                            key={zone.id}
                            positions={zone.coordinates}
                            pathOptions={{
                                color: zone.color,
                                fillColor: zone.color,
                                fillOpacity: selectedZone?.id === zone.id ? 0.25 : 0.1,
                                weight: selectedZone?.id === zone.id ? 2.5 : 1.5,
                                dashArray: zone.type === 'restricted' ? '8,4' : null,
                            }}
                            eventHandlers={{ click: () => handlePolygonClick(zone) }}
                        />
                    ))}
                </MapContainer>

                {/* Edit Panel */}
                {isEditing && selectedZone && !isDrawing && (
                    <div className="absolute top-3 right-3 w-80 bg-card border border-border rounded-lg shadow-xl max-h-[calc(100vh-24px)] overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: editForm.color }} />
                                <span className="font-medium text-sm truncate">{selectedZone.name}</span>
                            </div>
                            <button onClick={() => { setIsEditing(false); setSelectedZone(null); setIsEditingCoordinates(false); setEditingPoints(null); }} className="p-1 hover:bg-accent rounded"><X size={14} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {/* Zone Info */}
                            <div className="space-y-2">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-secondary border border-border rounded py-1.5 px-2 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</label>
                                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                                        {ZONE_TYPES.map((t) => (
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

                        {/* Footer */}
                        <div className="p-3 border-t border-border flex gap-2 shrink-0">
                            <button onClick={() => setConfirmDelete(selectedZone.id)} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded"><Trash2 size={14} /></button>
                            <button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded text-sm font-medium flex items-center justify-center gap-1.5"><Save size={14} />Save</button>
                        </div>
                    </div>
                )}

                {/* Drawing Instructions */}
                {isDrawing && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border rounded-lg px-4 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Click</span> to add • <span className="font-medium text-green-400">Click start</span> to close • <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px]">Esc</kbd> cancel
                        </p>
                    </div>
                )}

                {/* Editing Instructions */}
                {isEditingCoordinates && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 border border-amber-500/30 rounded-lg px-4 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-amber-500">Drag</span> to move • <span className="font-medium text-amber-500">Drag midpoints</span> to add • <span className="font-medium text-red-400">Double-click</span> to delete
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

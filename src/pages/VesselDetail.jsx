import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Navigation, Anchor, MapPin, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

const VESSEL_TYPES = ['Cargo', 'Tanker', 'Fishing', 'Passenger', 'Tug'];
const STATUSES = ['Moored', 'Moving', 'Anchored', 'Drifting'];

export default function VesselDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { vessels, updateVessel } = useApp();

    const vessel = vessels.find(v => v.id === id);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(vessel || {});

    if (!vessel) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Vessel Not Found</h2>
                    <button
                        onClick={() => navigate('/vessels')}
                        className="text-primary hover:text-primary/80 transition-colors"
                    >
                        Back to Vessels
                    </button>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        updateVessel(vessel.id, editForm);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditForm(vessel);
        setIsEditing(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto p-6">
                        <button
                            onClick={() => navigate('/vessels')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-sm">Back to Vessels</span>
                        </button>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{vessel.name}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">{vessel.type}</span>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded border font-medium",
                                        vessel.status === 'Moving'
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : vessel.status === 'Anchored'
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                    )}>
                                        {vessel.status}
                                    </span>
                                </div>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit</span>
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="bg-secondary hover:bg-accent text-foreground px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                    >
                                        <X size={16} />
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                    >
                                        <Save size={16} />
                                        <span>Save</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto p-6 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                                    <Navigation className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Speed</span>
                            </div>
                            <div className="text-2xl font-mono font-light">{vessel.speed.toFixed(1)} <span className="text-sm text-muted-foreground">kn</span></div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center">
                                    <Anchor className="w-4 h-4 text-purple-500" />
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Heading</span>
                            </div>
                            <div className="text-2xl font-mono font-light">{vessel.heading}°</div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Position</span>
                            </div>
                            <div className="text-sm font-mono">{vessel.lat.toFixed(4)}, {vessel.lng.toFixed(4)}</div>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">ETA</span>
                            </div>
                            <div className="text-sm">{vessel.eta !== '-' ? new Date(vessel.eta).toLocaleDateString() : '-'}</div>
                        </div>
                    </div>

                    {/* Details Form */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Vessel Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-2 uppercase tracking-wider">Vessel Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    />
                                ) : (
                                    <div className="text-sm font-medium">{vessel.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground block mb-2 uppercase tracking-wider">Type</label>
                                {isEditing ? (
                                    <select
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {VESSEL_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium">{vessel.type}</div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground block mb-2 uppercase tracking-wider">Status</label>
                                {isEditing ? (
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {STATUSES.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium">{vessel.status}</div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground block mb-2 uppercase tracking-wider">Destination</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.destination}
                                        onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    />
                                ) : (
                                    <div className="text-sm font-medium">{vessel.destination}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Recent History</h2>
                        <div className="space-y-2 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                            {vessel.history.slice(0, 10).map((h, i) => (
                                <div key={i} className="flex justify-between text-sm pl-6 relative">
                                    <div className="absolute left-[5px] top-2 w-[5px] h-[5px] rounded-full bg-primary"></div>
                                    <span className="text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</span>
                                    <span className="font-mono text-primary">{h.speed.toFixed(1)} kn</span>
                                    <span className="font-mono text-muted-foreground">{h.heading}°</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

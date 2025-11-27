import { X, RotateCcw, Trash2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { convertDistance } from '../lib/geoUtils';

export default function MeasureControl({ distance, onUndo, onClear, onClose }) {
    const { settings } = useSettings();

    const formatDistance = (meters) => {
        const km = meters / 1000;
        const converted = convertDistance(km, settings.distanceUnit);
        return `${converted.toFixed(2)} ${settings.distanceUnit}`;
    };

    return (
        <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg px-4 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Distance</span>
                <span className="font-mono text-lg font-bold text-primary tabular-nums">
                    {formatDistance(distance)}
                </span>
            </div>

            <div className="h-8 w-px bg-border mx-1" />

            <div className="flex items-center gap-1">
                <button
                    onClick={onUndo}
                    className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Undo last point (Backspace)"
                >
                    <RotateCcw size={16} />
                </button>
                <button
                    onClick={onClear}
                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md text-muted-foreground transition-colors"
                    title="Clear all points"
                >
                    <Trash2 size={16} />
                </button>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors ml-1"
                    title="Close tool (Esc)"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

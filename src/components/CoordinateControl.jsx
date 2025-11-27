import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function CoordinateControl({ lat, lng, onClose, isLocked }) {
    const formatCoordinate = (lat, lng) => {
        if (lat === null || lng === null) return '—';
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
    };

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = formatCoordinate(lat, lng);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg px-4 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coordinates</span>
                <span className={`font-mono text-lg font-bold tabular-nums transition-colors ${isLocked ? 'text-green-500' : 'text-primary'}`}>
                    {formatCoordinate(lat, lng)}
                </span>
            </div>

            <div className="h-8 w-px bg-border mx-1" />

            <div className="flex items-center gap-1">
                {isLocked && (
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy coordinates"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Close tool (Esc)"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

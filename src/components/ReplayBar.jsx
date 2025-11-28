import { Play, Pause, SkipBack, SkipForward, X, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export default function ReplayBar({ vessel, onClose, onUpdatePosition }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const timerRef = useRef(null);

    // History is already in chronological order (oldest to newest)
    const sortedHistory = vessel.history;

    // Reset replay when vessel changes
    useEffect(() => {
        setCurrentIndex(0);
        setIsPlaying(false);
    }, [vessel.id]);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= sortedHistory.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000 / playbackSpeed);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, sortedHistory.length, playbackSpeed]);

    useEffect(() => {
        const point = sortedHistory[currentIndex];
        if (point) {
            onUpdatePosition({
                lat: point.lat,
                lng: point.lng,
                heading: point.heading,
                speed: point.speed,
                timestamp: point.timestamp
            });
        }
    }, [currentIndex, onUpdatePosition, sortedHistory]);

    const progress = (currentIndex / (sortedHistory.length - 1)) * 100;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[700px] bg-card border border-border rounded shadow-2xl z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="p-3 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <Play size={12} className="text-primary" />
                        </div>
                        <span className="font-semibold text-sm">Replay</span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <span className="text-xs text-muted-foreground">{vessel.name}</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentIndex(0)}
                            className="p-1.5 hover:bg-accent rounded transition-colors"
                            title="Reset"
                        >
                            <SkipBack size={14} />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 bg-primary hover:bg-primary/90 rounded transition-colors"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                        <button
                            onClick={() => setCurrentIndex(sortedHistory.length - 1)}
                            className="p-1.5 hover:bg-accent rounded transition-colors"
                            title="End"
                        >
                            <SkipForward size={14} />
                        </button>
                    </div>

                    <div className="flex-1 relative h-6 flex items-center group">
                        <div className="absolute w-full h-0.5 bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={sortedHistory.length - 1}
                            value={currentIndex}
                            onChange={(e) => {
                                setIsPlaying(false);
                                setCurrentIndex(parseInt(e.target.value));
                            }}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute h-2.5 w-2.5 bg-primary rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-linear border border-background"
                            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock size={12} />
                            <span className="font-mono">
                                {new Date(sortedHistory[currentIndex]?.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="h-3 w-px bg-border"></div>
                        <div className="font-mono text-primary font-medium">
                            {sortedHistory[currentIndex]?.speed.toFixed(1)} kn
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{currentIndex + 1} / {sortedHistory.length}</span>
                    <div className="flex items-center gap-2">
                        <span>Speed:</span>
                        {[0.5, 1, 2, 4].map(speed => (
                            <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={cn(
                                    "px-1.5 py-0.5 rounded transition-colors",
                                    playbackSpeed === speed
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent"
                                )}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

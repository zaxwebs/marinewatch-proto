import { Play, Pause, SkipBack, SkipForward, X, Clock } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '../lib/utils';

export default function ReplayBar({ vessel, vessels, onClose, onUpdatePosition }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(60); // Speed multiplier (1 second real time = X seconds replay time)
    const timerRef = useRef(null);

    // Normalize input to an array of vessels
    const targetVessels = useMemo(() => {
        if (vessels) return vessels;
        if (vessel) return [vessel];
        return [];
    }, [vessel, vessels]);

    // Calculate time range
    const { startTime, endTime, totalDuration } = useMemo(() => {
        let minTime = Infinity;
        let maxTime = -Infinity;

        targetVessels.forEach(v => {
            if (!v.history || v.history.length === 0) return;
            const start = new Date(v.history[0].timestamp).getTime();
            const end = new Date(v.history[v.history.length - 1].timestamp).getTime();
            if (start < minTime) minTime = start;
            if (end > maxTime) maxTime = end;
        });

        if (minTime === Infinity) return { startTime: 0, endTime: 0, totalDuration: 1 };

        return {
            startTime: minTime,
            endTime: maxTime,
            totalDuration: maxTime - minTime
        };
    }, [targetVessels]);

    // Initialize/Reset
    useEffect(() => {
        setCurrentTime(startTime);
        setIsPlaying(false);
    }, [targetVessels, startTime]);

    // Timer loop
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const nextTime = prev + (1000 * playbackSpeed);
                    if (nextTime >= endTime) {
                        setIsPlaying(false);
                        return endTime;
                    }
                    return nextTime;
                });
            }, 1000); // Update UI every second (can be faster for smoother animation but 1s is okay for now)
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying, endTime, playbackSpeed]);

    // Calculate positions for current time
    useEffect(() => {
        if (targetVessels.length === 0) return;

        // Clean unified logic for both single and global
        const positions = {};
        targetVessels.forEach(v => {
            const point = findClosestPoint(v.history, currentTime);
            if (point) {
                positions[v.id] = {
                    ...point,
                    timestamp: new Date(currentTime).toISOString() // normalize TS if needed
                };
            }
        });
        onUpdatePosition(positions);
    }, [currentTime, targetVessels, onUpdatePosition]);

    const progress = totalDuration > 0 ? ((currentTime - startTime) / totalDuration) * 100 : 0;
    const progressSafe = Math.min(100, Math.max(0, progress));

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[700px] bg-card border border-border rounded shadow-2xl z-[1000] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="p-3 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <Play size={12} className="text-primary" />
                        </div>
                        <span className="font-semibold text-sm">
                            {vessels ? `Fleet Replay (${vessels.length} vessels)` : "Replay"}
                        </span>
                    </div>
                    {!vessels && vessel && (
                        <>
                            <div className="h-4 w-px bg-border"></div>
                            <span className="text-xs text-muted-foreground">{vessel.name}</span>
                        </>
                    )}
                </div>
                <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setCurrentTime(startTime)}
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
                            onClick={() => setCurrentTime(endTime)}
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
                                style={{ width: `${progressSafe}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min={startTime}
                            max={endTime}
                            value={currentTime}
                            onChange={(e) => {
                                setIsPlaying(false);
                                setCurrentTime(Number(e.target.value));
                            }}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute h-2.5 w-2.5 bg-primary rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-linear border border-background"
                            style={{ left: `${progressSafe}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs shrink-0">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock size={12} />
                            <span className="font-mono min-w-[60px]">
                                {new Date(currentTime).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{new Date(startTime).toLocaleString()}</span>

                    <div className="flex items-center gap-2">
                        <span>Speed:</span>
                        {[30, 60, 120, 300].map(speed => (
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
                                {speed / 60}x
                            </button>
                        ))}
                    </div>

                    <span>{new Date(endTime).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

// Helper to find the history point active at a given time
function findClosestPoint(history, time) {
    if (!history || history.length === 0) return null;

    // History is old -> new
    // We want the point just before or at "time"
    // Since history is sorted, we can simple iterate or bisect. Linear is fine for small history (20 points).

    // Optimized for the sorted array (descending time in mock data? No, let's check mockData gen)
    // mockData: generateSmartHistory unshifts points. So index 0 is NEWEST, index last is OLDEST.
    // Wait, let me check the mockData generation again.
    // history.unshift(...) -> so [0] is latest timestamp.
    // In ReplayBar, line 12: `const sortedHistory = vessel.history;` ... wait, previous implementation:
    // `const sortedHistory = vessel.history;` -> `currentIndex` 0 to length.
    // If [0] is latest, then iterating 0->end means going backwards in time?
    // Let's re-read generateSmartHistory quickly.

    // In generateSmartHistory:
    // for loop from path.length-1 downto 0.
    // history.unshift(...)
    // Last iteration (i=0) unshifts the start point.
    // So history[0] is the START (oldest)?
    // No.
    // loop i=path end (current) -> start.
    // unshift adds to FRONT.
    // So last added (start point) becomes index 0.
    // So index 0 is OLDEST (Start). index length-1 is NEWEST (Current).
    // Correct. History is chronological.

    // So to find point <= time:
    for (let i = history.length - 1; i >= 0; i--) {
        const ptTime = new Date(history[i].timestamp).getTime();
        if (ptTime <= time) {
            return history[i];
        }
    }
    return history[0]; // Fallback to start
}

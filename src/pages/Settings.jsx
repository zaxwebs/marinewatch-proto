import { Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const DISTANCE_UNITS = [
    { value: 'nm', label: 'Nautical Miles', abbr: 'nm', description: 'Standard maritime distance unit' },
    { value: 'km', label: 'Kilometers', abbr: 'km', description: 'Metric system distance unit' },
    { value: 'mi', label: 'Statute Miles', abbr: 'mi', description: 'Imperial system distance unit' },
];

export default function Settings() {
    const { settings, updateSettings } = useSettings();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Customize your application preferences
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                    {/* Unit Preferences Section */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="border-b border-border bg-card/50 px-4 py-3">
                            <h2 className="text-lg font-semibold">Unit Preferences</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure measurement units used throughout the application
                            </p>
                        </div>

                        <div className="p-4">
                            {/* Distance Unit Setting */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">
                                    Distance Unit
                                </label>
                                <div className="space-y-2">
                                    {DISTANCE_UNITS.map((unit) => (
                                        <label
                                            key={unit.value}
                                            className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer transition-all hover:bg-accent/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary/50"
                                        >
                                            <input
                                                type="radio"
                                                name="distanceUnit"
                                                value={unit.value}
                                                checked={settings.distanceUnit === unit.value}
                                                onChange={(e) => updateSettings({ distanceUnit: e.target.value })}
                                                className="mt-0.5 w-4 h-4 text-primary border-border focus:ring-primary focus:ring-offset-0 focus:ring-2"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{unit.label}</span>
                                                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                        {unit.abbr}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {unit.description}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

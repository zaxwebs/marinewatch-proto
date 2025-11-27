import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
    distanceUnit: 'nm', // 'km', 'nm', or 'mi'
};

export function SettingsProvider({ children }) {
    // Initialize settings from localStorage or use defaults
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('marinetrack-settings');
        return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    });

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('marinetrack-settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}

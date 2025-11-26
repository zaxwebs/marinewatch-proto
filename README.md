# MarineTrack - Advanced GPS Tracker

A premium marine vessel tracking application built with React, Vite, Tailwind CSS, and Leaflet.

## Features

- **Real-time Tracking**: Visualize vessels on a dark-themed interactive map.
- **Vessel Details**: View detailed information including speed, heading, destination, and ETA.
- **History Playback**: (Mocked) View historical tracks of vessels.
- **Zoning**: Visualize restricted and port zones.
- **Notifications**: Real-time alerts for zone violations and arrivals.
- **Premium UI**: Glassmorphism design, smooth animations, and responsive layout.

## Tech Stack

- **Framework**: Vite + React
- **Styling**: Tailwind CSS (v3)
- **Map**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **Fonts**: Geist (via Google Fonts fallback or system font)

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components`: UI Components (Map, Sidebar, Notifications)
- `src/lib`: Utilities and Mock Data
- `src/App.jsx`: Main application layout
- `src/index.css`: Global styles and Tailwind configuration

import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
    initialLocation?: { address: string; lat: number; lng: number };
}

const defaultCenter = {
    lat: 28.6139, // New Delhi
    lng: 77.2090
};

// Component to handle map clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
    const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const mapRef = useRef<any>(null);

    // Free geocoding using Nominatim (OpenStreetMap)
    const searchLocation = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    // Reverse geocoding to get address from coordinates
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        const address = await reverseGeocode(lat, lng);
        const location = { address, lat, lng };
        setSelectedLocation(location);
        setSearchQuery(address);
        onLocationSelect(location);
    };

    const handleSearchResultClick = async (result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const location = { address: result.display_name, lat, lng };

        setSelectedLocation(location);
        setSearchQuery(result.display_name);
        setSearchResults([]);
        onLocationSelect(location);

        // Fly to location on map
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 15);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        if (value.length > 2) {
            searchLocation(value);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    📍 Search Location
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for a location in India..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{
                            background: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {searching ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                            <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-2 rounded-xl shadow-2xl overflow-hidden border-2 animate-fade-in max-h-64 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        {searchResults.map((result) => (
                            <button
                                key={result.place_id}
                                onClick={() => handleSearchResultClick(result)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                            >
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {result.display_name}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="relative overflow-hidden rounded-xl border-2" style={{ borderColor: 'var(--border-color)', height: '300px' }}>
                <MapContainer
                    center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [defaultCenter.lat, defaultCenter.lng]}
                    zoom={selectedLocation ? 15 : 11}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker onLocationSelect={handleMapClick} />
                    {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
                </MapContainer>
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
                <div className="p-4 rounded-xl flex items-start gap-3 animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Selected Location</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedLocation.address}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click on the map or search to select a location</span>
            </div>
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { Location, Coordinates } from '../types';
import Input from './Input';
import Button from './Button';
import { getDistance } from 'geolib';

interface LocationListProps {
  locations: Location[];
  onSelectLocation: (locationId: string) => void;
  currentUserLocation?: Coordinates;
  className?: string;
  selectedLocationId?: string | null; // For visual highlighting
  onPreviewLocation?: (locationId: string) => void; // For just updating the map without closing
  mode?: 'instant' | 'preview'; // 'instant' = click closes modal. 'preview' = click updates map, button confirms.
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
  onSelectLocation,
  currentUserLocation,
  className = '',
  selectedLocationId,
  onPreviewLocation,
  mode = 'instant',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const sortedLocations = locations
    .filter(location => location.isApproved)
    .filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (currentUserLocation) {
        const distA = getDistance(currentUserLocation, { latitude: a.latitude, longitude: a.longitude });
        const distB = getDistance(currentUserLocation, { latitude: b.latitude, longitude: b.longitude });
        return distA - distB;
      }
      return a.name.localeCompare(b.name);
    });

  const handleRowClick = (locationId: string) => {
    if (mode === 'instant') {
      onSelectLocation(locationId);
    } else {
      onPreviewLocation?.(locationId);
    }
  };

  // Auto-scroll to selected item when it changes (e.g. from map click)
  useEffect(() => {
    if (selectedLocationId && listRef.current) {
      const element = document.getElementById(`loc-${selectedLocationId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedLocationId]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="shrink-0 mb-2 px-1">
        <Input
          id="search-location"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-1"
        />
        {mode === 'preview' && !selectedLocationId && (
          <p className="text-xs text-primary text-center animate-pulse mb-2">
            Select a location below to see it on the map
          </p>
        )}
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-1 custom-scrollbar min-h-0">
        {sortedLocations.length === 0 ? (
          <p className="text-text-secondary italic text-center mt-4">No approved locations found.</p>
        ) : (
          <ul className="space-y-2 pb-2">
            {sortedLocations.map(location => {
              const isSelected = selectedLocationId === location.id;
              
              return (
                <li
                  key={location.id}
                  id={`loc-${location.id}`} // ID for scrolling
                  onClick={() => handleRowClick(location.id)}
                  className={`
                    relative p-3 rounded-lg border transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-md' 
                      : 'bg-surfaceHighlight/30 border-slate-700/50 hover:bg-surfaceHighlight hover:border-slate-500'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold truncate transition-colors ${isSelected ? 'text-primary' : 'text-text'}`}>
                            {location.name}
                          </h4>
                          {location.approxDriveMinutes && (
                            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-900/30 text-blue-200 border border-blue-800/50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {location.approxDriveMinutes} min from Church
                            </span>
                          )}
                      </div>
                      <p className="text-sm text-text-secondary truncate">{location.address}</p>
                      {currentUserLocation && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          {(getDistance(currentUserLocation, { latitude: location.latitude, longitude: location.longitude }) / 1609.34).toFixed(1)} miles away
                        </p>
                      )}
                    </div>
                    
                    {/* Selection Indicator / Button Area */}
                    {isSelected && mode === 'preview' && (
                      <div className="shrink-0 flex flex-col justify-center ml-2 items-center">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLocation(location.id);
                          }}
                          className="text-xs px-4 py-2 bg-primary hover:bg-primary-dark shadow-lg animate-fade-in whitespace-nowrap"
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationList;
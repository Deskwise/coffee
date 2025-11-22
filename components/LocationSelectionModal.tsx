
import React, { useState } from 'react';
import Modal from './Modal';
import LocationList from './LocationList';
import LocationMap from './LocationMap';
import Button from './Button';
import { Location, Coordinates } from '../types';

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onSelectLocation: (locationId: string) => void;
  currentUserLocation?: Coordinates;
}

const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  isOpen,
  onClose,
  locations,
  onSelectLocation,
  currentUserLocation,
}) => {
  // CRITICAL CHANGE: Default to 'map' so the modal opens in preview mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [previewLocationId, setPreviewLocationId] = useState<string | null>(null);

  const handleSelectLocation = (locationId: string) => {
    onSelectLocation(locationId);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Select Meeting Location" 
      className="max-w-3xl h-[85vh] flex flex-col"
      noPadding={true} // CRITICAL: Prevents double scrollbars and layout cutting off
    >
      {/* Toggle Controls */}
      <div className="flex justify-center p-3 bg-surface border-b border-slate-700 shrink-0 z-10">
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            className="w-32"
          >
            List View
          </Button>
          <Button
            onClick={() => setViewMode('map')}
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            className="w-32"
          >
            Map View
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-background/50 relative">
        {viewMode === 'list' ? (
          // --- SIMPLE LIST MODE ---
          <div className="h-full p-4 overflow-hidden">
             <LocationList
               locations={locations}
               onSelectLocation={handleSelectLocation}
               currentUserLocation={currentUserLocation}
               mode="instant" 
               className="h-full"
             />
          </div>
        ) : (
          // --- MAP INTERACTIVE MODE ---
          <div className="flex flex-col h-full">
            
            {/* Top Pane: The Map */}
            <div className="h-[50%] w-full relative border-b border-slate-700 shadow-lg z-0">
               <LocationMap 
                 locations={locations} 
                 selectedLocationId={previewLocationId}
                 onMarkerClick={setPreviewLocationId} 
               />
            </div>
            
            {/* Bottom Pane: The List */}
            <div className="flex-1 overflow-hidden bg-surface p-2 relative z-10">
               <LocationList
                 locations={locations}
                 onSelectLocation={handleSelectLocation}
                 onPreviewLocation={setPreviewLocationId}
                 currentUserLocation={currentUserLocation}
                 selectedLocationId={previewLocationId}
                 mode="preview"
                 className="h-full"
               />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LocationSelectionModal;

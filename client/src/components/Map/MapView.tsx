import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useState, useEffect } from 'react';
import MapMarkers from './MapMarkers';
import type { HechoFluvial, Coordenada } from '../../types';

interface MapViewProps {
  hechos: HechoFluvial[];
  onMapClick?: (latlng: Coordenada, pointType: 'ingreso' | 'hallazgo') => void;
  selectingPoint?: 'ingreso' | 'hallazgo' | null;
  tempIngreso?: Coordenada | null;
  tempHallazgo?: Coordenada | null;
  selectedHecho?: HechoFluvial | null;
  onSelectHecho?: (hecho: HechoFluvial | null) => void;
}

// Centro de Tucumán
const TUCUMAN_CENTER: [number, number] = [-26.82, -65.22];
const TUCUMAN_ZOOM = 10;

export default function MapView({
  hechos,
  onMapClick,
  selectingPoint,
  tempIngreso,
  tempHallazgo,
  selectedHecho,
  onSelectHecho,
}: MapViewProps) {
  const [riosGeoJSON, setRiosGeoJSON] = useState<any>(null);

  useEffect(() => {
    fetch('/data/rios-tucuman.geojson')
      .then((res) => res.json())
      .then((data) => setRiosGeoJSON(data))
      .catch(() => console.warn('No se pudo cargar GeoJSON de ríos'));
  }, []);

  return (
    <MapContainer
      center={TUCUMAN_CENTER}
      zoom={TUCUMAN_ZOOM}
      className="map-container"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Capa de ríos */}
      {riosGeoJSON && (
        <GeoJSON
          data={riosGeoJSON}
          style={() => ({
            color: '#2196F3',
            weight: 2,
            opacity: 0.7,
            fillColor: '#2196F3',
            fillOpacity: 0.1,
          })}
        />
      )}

      {/* Marcadores de hechos */}
      <MapMarkers
        hechos={hechos}
        onMapClick={onMapClick}
        selectingPoint={selectingPoint}
        tempIngreso={tempIngreso}
        tempHallazgo={tempHallazgo}
        selectedHecho={selectedHecho}
        onSelectHecho={onSelectHecho}
      />
    </MapContainer>
  );
}

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

const TUCUMAN_CENTER: [number, number] = [-26.82, -65.22];
const TUCUMAN_ZOOM = 10;

const REGIONAL_COLORS: Record<string, string> = {
  URN: '#4CAF50',
  URC: '#2196F3',
  URE: '#FF9800',
  URO: '#9C27B0',
  URS: '#F44336',
};

const REGIONAL_LABELS: Record<string, string> = {
  URN: 'Norte',
  URC: 'Capital',
  URE: 'Este',
  URO: 'Oeste',
  URS: 'Sur',
};

export default function MapView({
  hechos,
  onMapClick,
  selectingPoint,
  tempIngreso,
  tempHallazgo,
  selectedHecho,
  onSelectHecho,
}: MapViewProps) {
  const [jurisdiccionesData, setJurisdiccionesData] = useState<any>(null);
  const [showJurisdicciones, setShowJurisdicciones] = useState(true);

  useEffect(() => {
    fetch('/data/jurisdicciones.geojson')
      .then(res => res.json())
      .then(data => setJurisdiccionesData(data))
      .catch(() => console.warn('No se pudo cargar jurisdicciones.geojson'));
  }, []);

  const styleFeature = (feature: any) => {
    const color = REGIONAL_COLORS[feature?.properties?.regional] ?? '#607D8B';
    return {
      color,
      weight: 1.2,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.12,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties?.name) {
      const regional = feature.properties.regional;
      layer.bindTooltip(
        `<strong>${feature.properties.name}</strong><br/>${regional} — ${REGIONAL_LABELS[regional] ?? ''}`,
        { sticky: true, className: 'juris-tooltip' }
      );
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Control de capa */}
      <div className="map-layer-control">
        <button
          className={`map-layer-btn ${showJurisdicciones ? 'active' : ''}`}
          onClick={() => setShowJurisdicciones(v => !v)}
          title="Mostrar/ocultar límites jurisdiccionales"
        >
          🗺 Jurisdicciones
        </button>
        {showJurisdicciones && (
          <div className="map-layer-legend">
            {Object.entries(REGIONAL_LABELS).map(([code, label]) => (
              <span key={code} className="map-layer-legend-item">
                <span
                  className="map-layer-legend-dot"
                  style={{ background: REGIONAL_COLORS[code] }}
                />
                {code}
              </span>
            ))}
          </div>
        )}
      </div>

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

        {/* Capa de jurisdicciones */}
        {showJurisdicciones && jurisdiccionesData && (
          <GeoJSON
            key="jurisdicciones"
            data={jurisdiccionesData}
            style={styleFeature}
            onEachFeature={onEachFeature}
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
    </div>
  );
}

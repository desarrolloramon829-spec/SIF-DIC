import { useMapEvents, Popup, Polyline, CircleMarker } from 'react-leaflet';
import type { HechoFluvial, Coordenada } from '../../types';
import MarkerPopup from './MarkerPopup';

interface MapMarkersProps {
  hechos: HechoFluvial[];
  onMapClick?: (latlng: Coordenada, pointType: 'ingreso' | 'hallazgo') => void;
  selectingPoint?: 'ingreso' | 'hallazgo' | null;
  tempIngreso?: Coordenada | null;
  tempHallazgo?: Coordenada | null;
  selectedHecho?: HechoFluvial | null;
  onSelectHecho?: (hecho: HechoFluvial | null) => void;
}

// Colores por carátula
const CARATULA_COLORS: Record<string, string> = {
  rescate: '#4CAF50', // Verde
  fallecimiento_ahogamiento: '#F44336', // Rojo
  hallazgo_cuerpo_nn: '#FF9800', // Naranja
};

function MapClickHandler({
  onMapClick,
  selectingPoint,
}: {
  onMapClick?: (latlng: Coordenada, pointType: 'ingreso' | 'hallazgo') => void;
  selectingPoint?: 'ingreso' | 'hallazgo' | null;
}) {
  useMapEvents({
    click(e) {
      if (onMapClick && selectingPoint) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }, selectingPoint);
      }
    },
  });
  return null;
}

export default function MapMarkers({
  hechos,
  onMapClick,
  selectingPoint,
  tempIngreso,
  tempHallazgo,
  selectedHecho,
  onSelectHecho,
}: MapMarkersProps) {
  return (
    <>
      <MapClickHandler
        onMapClick={onMapClick}
        selectingPoint={selectingPoint}
      />

      {/* Marcadores temporales durante la carga */}
      {tempIngreso && (
        <CircleMarker
          center={[tempIngreso.lat, tempIngreso.lng]}
          radius={10}
          pathOptions={{
            color: '#1565C0',
            fillColor: '#2196F3',
            fillOpacity: 0.8,
          }}
        >
          <Popup>📍 Punto de ingreso al agua (temporal)</Popup>
        </CircleMarker>
      )}

      {tempHallazgo && (
        <CircleMarker
          center={[tempHallazgo.lat, tempHallazgo.lng]}
          radius={10}
          pathOptions={{
            color: '#C62828',
            fillColor: '#EF5350',
            fillOpacity: 0.8,
          }}
        >
          <Popup>📍 Punto de hallazgo/rescate (temporal)</Popup>
        </CircleMarker>
      )}

      {/* Línea temporal entre puntos */}
      {tempIngreso && tempHallazgo && (
        <Polyline
          positions={[
            [tempIngreso.lat, tempIngreso.lng],
            [tempHallazgo.lat, tempHallazgo.lng],
          ]}
          pathOptions={{ color: '#9C27B0', weight: 2, dashArray: '8 4' }}
        />
      )}

      {/* Marcadores de hechos registrados */}
      {hechos.map(hecho => {
        const color = CARATULA_COLORS[hecho.caratula] || '#757575';
        const isSelected = selectedHecho?.id === hecho.id;

        return (
          <div key={hecho.id}>
            {/* Punto de ingreso */}
            <CircleMarker
              center={[hecho.punto_ingreso.lat, hecho.punto_ingreso.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: '#1565C0',
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.7,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectHecho?.(isSelected ? null : hecho),
              }}
            >
              <MarkerPopup hecho={hecho} tipo="ingreso" />
            </CircleMarker>

            {/* Punto de hallazgo */}
            <CircleMarker
              center={[hecho.punto_hallazgo.lat, hecho.punto_hallazgo.lng]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: '#C62828',
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.7,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectHecho?.(isSelected ? null : hecho),
              }}
            >
              <MarkerPopup hecho={hecho} tipo="hallazgo" />
            </CircleMarker>

            {/* Línea entre puntos */}
            <Polyline
              positions={[
                [hecho.punto_ingreso.lat, hecho.punto_ingreso.lng],
                [hecho.punto_hallazgo.lat, hecho.punto_hallazgo.lng],
              ]}
              pathOptions={{
                color: color,
                weight: isSelected ? 3 : 1.5,
                dashArray: '6 4',
                opacity: isSelected ? 1 : 0.6,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

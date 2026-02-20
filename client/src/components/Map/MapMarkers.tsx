import { useMapEvents, Popup, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
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

// Colores por carátula (color de relleno)
const CARATULA_COLORS: Record<string, string> = {
  rescate: '#4CAF50',
  fallecimiento_ahogamiento: '#F44336',
  hallazgo_cuerpo_nn: '#FF9800',
};

// Color de borde por tipo de punto
const INGRESO_BORDER = '#1565C0'; // Azul
const HALLAZGO_BORDER = '#E65100'; // Naranja oscuro

/** Ícono cuadrado — Punto de Ingreso */
function squareIcon(fillColor: string, selected: boolean): L.DivIcon {
  const s = selected ? 22 : 16;
  const sw = selected ? 3 : 2;
  const r = 2;
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
      <rect x="${sw / 2}" y="${sw / 2}" width="${s - sw}" height="${s - sw}"
        fill="${fillColor}" stroke="${INGRESO_BORDER}" stroke-width="${sw}" rx="${r}"/>
    </svg>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
  });
}

/** Ícono triángulo — Punto de Hallazgo */
function triangleIcon(fillColor: string, selected: boolean): L.DivIcon {
  const s = selected ? 24 : 18;
  const sw = selected ? 3 : 2;
  const half = s / 2;
  // Triángulo con vértice arriba, base abajo
  const pts = `${half},${sw} ${s - sw},${s - sw} ${sw},${s - sw}`;
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
      <polygon points="${pts}"
        fill="${fillColor}" stroke="${HALLAZGO_BORDER}" stroke-width="${sw}"
        stroke-linejoin="round"/>
    </svg>`,
    iconSize: [s, s],
    iconAnchor: [half, s - sw],
    popupAnchor: [0, -(s + 4)],
  });
}

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
        <Marker
          position={[tempIngreso.lat, tempIngreso.lng]}
          icon={squareIcon('#2196F3', false)}
        >
          <Popup>🟦 Punto de ingreso al agua (temporal)</Popup>
        </Marker>
      )}

      {tempHallazgo && (
        <Marker
          position={[tempHallazgo.lat, tempHallazgo.lng]}
          icon={triangleIcon('#FF9800', false)}
        >
          <Popup>🔶 Punto de hallazgo/rescate (temporal)</Popup>
        </Marker>
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
            {/* Punto de ingreso — cuadrado azul */}
            <Marker
              position={[hecho.punto_ingreso.lat, hecho.punto_ingreso.lng]}
              icon={squareIcon(color, isSelected)}
              eventHandlers={{
                click: () => onSelectHecho?.(isSelected ? null : hecho),
              }}
            >
              <MarkerPopup hecho={hecho} tipo="ingreso" />
            </Marker>

            {/* Punto de hallazgo — triángulo naranja */}
            <Marker
              position={[hecho.punto_hallazgo.lat, hecho.punto_hallazgo.lng]}
              icon={triangleIcon(color, isSelected)}
              eventHandlers={{
                click: () => onSelectHecho?.(isSelected ? null : hecho),
              }}
            >
              <MarkerPopup hecho={hecho} tipo="hallazgo" />
            </Marker>

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

import { Popup } from 'react-leaflet';
import type { HechoFluvial } from '../../types';
import { CARATULA_LABELS, UNIDAD_REGIONAL_LABELS } from '../../types';

interface MarkerPopupProps {
  hecho: HechoFluvial;
  tipo: 'ingreso' | 'hallazgo';
}

export default function MarkerPopup({ hecho, tipo }: MarkerPopupProps) {
  return (
    <Popup>
      <div className="marker-popup">
        <h4>
          {tipo === 'ingreso'
            ? '� Punto de Ingreso'
            : '🔶 Punto de Hallazgo/Rescate'}
        </h4>
        <div className="popup-field">
          <strong>Carátula:</strong> {CARATULA_LABELS[hecho.caratula]}
        </div>
        <div className="popup-field">
          <strong>Víctima:</strong> {hecho.victima}
        </div>
        <div className="popup-field">
          <strong>Sexo:</strong>{' '}
          {hecho.sexo === 'masculino' ? 'Masculino' : 'Femenino'} —{' '}
          <strong>Edad:</strong> {hecho.edad === 0 ? 'S/D' : hecho.edad}
        </div>
        <div className="popup-field">
          <strong>Unidad Regional:</strong> {hecho.unidad_regional}
        </div>
        <div className="popup-field">
          <strong>Jurisdicción:</strong> {hecho.jurisdiccion}
        </div>
        <div className="popup-field">
          <strong>Lugar:</strong> {hecho.lugar_del_hecho}
        </div>
        {hecho.sintesis && (
          <div className="popup-field popup-sintesis">
            <strong>Síntesis:</strong> {hecho.sintesis}
          </div>
        )}
        <div className="popup-field">
          <strong>Fecha del hecho:</strong>{' '}
          {new Date(hecho.fecha_del_hecho).toLocaleDateString('es-AR')}
        </div>
        {hecho.fecha_del_habido && (
          <div className="popup-field">
            <strong>Fecha del habido:</strong>{' '}
            {new Date(hecho.fecha_del_habido).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>
    </Popup>
  );
}

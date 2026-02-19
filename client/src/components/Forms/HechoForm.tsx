import { useState, useEffect } from 'react';
import type {
  HechoFormData,
  HechoFluvial,
  Coordenada,
  CaratulaTipo,
  UnidadRegional,
  Sexo,
} from '../../types';
import { CARATULA_LABELS } from '../../types';
import { hechosApi } from '../../services/api';

interface HechoFormProps {
  onClose: () => void;
  onSaved: () => void;
  editHecho?: HechoFluvial | null;
  puntoIngreso: Coordenada | null;
  puntoHallazgo: Coordenada | null;
  onSelectPoint: (type: 'ingreso' | 'hallazgo') => void;
  selectingPoint: 'ingreso' | 'hallazgo' | null;
}

const initialForm: HechoFormData = {
  caratula: 'rescate',
  unidad_regional: 'URN',
  jurisdiccion: '',
  lugar_del_hecho: '',
  fecha_del_hecho: '',
  fecha_del_habido: '',
  victima: '',
  sexo: 'masculino',
  edad: 0,
  punto_ingreso: null,
  punto_hallazgo: null,
};

export default function HechoForm({
  onClose,
  onSaved,
  editHecho,
  puntoIngreso,
  puntoHallazgo,
  onSelectPoint,
  selectingPoint,
}: HechoFormProps) {
  const [form, setForm] = useState<HechoFormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editHecho) {
      setForm({
        caratula: editHecho.caratula,
        unidad_regional: editHecho.unidad_regional,
        jurisdiccion: editHecho.jurisdiccion,
        lugar_del_hecho: editHecho.lugar_del_hecho,
        fecha_del_hecho: editHecho.fecha_del_hecho.split('T')[0],
        fecha_del_habido: editHecho.fecha_del_habido?.split('T')[0] || '',
        victima: editHecho.victima,
        sexo: editHecho.sexo,
        edad: editHecho.edad,
        punto_ingreso: editHecho.punto_ingreso,
        punto_hallazgo: editHecho.punto_hallazgo,
      });
    }
  }, [editHecho]);

  useEffect(() => {
    if (puntoIngreso) {
      setForm(prev => ({ ...prev, punto_ingreso: puntoIngreso }));
    }
  }, [puntoIngreso]);

  useEffect(() => {
    if (puntoHallazgo) {
      setForm(prev => ({ ...prev, punto_hallazgo: puntoHallazgo }));
    }
  }, [puntoHallazgo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'edad' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.punto_ingreso || !form.punto_hallazgo) {
      setError('Debe seleccionar ambos puntos en el mapa');
      return;
    }

    setSaving(true);
    try {
      if (editHecho) {
        await hechosApi.update(editHecho.id, form);
      } else {
        await hechosApi.create(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        'Error al guardar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-panel">
      <div className="form-header">
        <h2>{editHecho ? 'Editar Hecho' : 'Nuevo Hecho Fluvial'}</h2>
        <button className="btn btn-icon" onClick={onClose}>
          ✕
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-body">
        {/* Carátula */}
        <div className="form-group">
          <label>Carátula de la Causa *</label>
          <select
            name="caratula"
            value={form.caratula}
            onChange={handleChange}
            required
          >
            <option value="rescate">{CARATULA_LABELS.rescate}</option>
            <option value="fallecimiento_ahogamiento">
              {CARATULA_LABELS.fallecimiento_ahogamiento}
            </option>
            <option value="hallazgo_cuerpo_nn">
              {CARATULA_LABELS.hallazgo_cuerpo_nn}
            </option>
          </select>
        </div>

        {/* Unidad Regional */}
        <div className="form-group">
          <label>Unidad Regional *</label>
          <select
            name="unidad_regional"
            value={form.unidad_regional}
            onChange={handleChange}
            required
          >
            <option value="URN">URN — Unidad Regional Norte</option>
            <option value="URS">URS — Unidad Regional Sur</option>
            <option value="URE">URE — Unidad Regional Este</option>
            <option value="URO">URO — Unidad Regional Oeste</option>
          </select>
        </div>

        {/* Jurisdicción */}
        <div className="form-group">
          <label>Jurisdicción *</label>
          <input
            type="text"
            name="jurisdiccion"
            value={form.jurisdiccion}
            onChange={handleChange}
            placeholder="Ej: Comisaría 1ra Capital"
            required
          />
        </div>

        {/* Lugar del hecho */}
        <div className="form-group">
          <label>Lugar del Hecho *</label>
          <input
            type="text"
            name="lugar_del_hecho"
            value={form.lugar_del_hecho}
            onChange={handleChange}
            placeholder="Ej: Río Salí - Puente Lucas Córdoba"
            required
          />
        </div>

        {/* Fechas */}
        <div className="form-row">
          <div className="form-group">
            <label>Fecha del Hecho *</label>
            <input
              type="date"
              name="fecha_del_hecho"
              value={form.fecha_del_hecho}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha del Habido</label>
            <input
              type="date"
              name="fecha_del_habido"
              value={form.fecha_del_habido}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Víctima */}
        <div className="form-group">
          <label>Víctima *</label>
          <input
            type="text"
            name="victima"
            value={form.victima}
            onChange={handleChange}
            placeholder="Nombre completo o N.N."
            required
          />
        </div>

        {/* Sexo y Edad */}
        <div className="form-row">
          <div className="form-group">
            <label>Sexo *</label>
            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              required
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>
          <div className="form-group">
            <label>Edad *</label>
            <input
              type="number"
              name="edad"
              value={form.edad}
              onChange={handleChange}
              min={0}
              max={150}
              required
            />
          </div>
        </div>

        {/* Puntos en mapa */}
        <div className="form-section">
          <h3>Puntos de Referencia en Mapa</h3>

          <div className="form-group">
            <label>Punto de Ingreso al Agua *</label>
            <div className="point-selector">
              <button
                type="button"
                className={`btn btn-sm ${selectingPoint === 'ingreso' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => onSelectPoint('ingreso')}
              >
                {selectingPoint === 'ingreso'
                  ? '🔵 Hacé clic en el mapa...'
                  : '📍 Seleccionar en mapa'}
              </button>
              {form.punto_ingreso && (
                <span className="point-coords">
                  {form.punto_ingreso.lat.toFixed(5)},{' '}
                  {form.punto_ingreso.lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Punto de Hallazgo/Rescate *</label>
            <div className="point-selector">
              <button
                type="button"
                className={`btn btn-sm ${selectingPoint === 'hallazgo' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => onSelectPoint('hallazgo')}
              >
                {selectingPoint === 'hallazgo'
                  ? '🔴 Hacé clic en el mapa...'
                  : '📍 Seleccionar en mapa'}
              </button>
              {form.punto_hallazgo && (
                <span className="point-coords">
                  {form.punto_hallazgo.lat.toFixed(5)},{' '}
                  {form.punto_hallazgo.lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? 'Guardando...'
              : editHecho
                ? 'Actualizar'
                : 'Registrar Hecho'}
          </button>
        </div>
      </form>
    </div>
  );
}

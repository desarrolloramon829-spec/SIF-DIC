import { useState, useEffect } from 'react';
import type {
  HechoFormData,
  HechoFluvial,
  Coordenada,
  CaratulaTipo,
  UnidadRegional,
  Sexo,
  VictimaAdicional,
} from '../../types';
import { CARATULA_LABELS } from '../../types';
import { hechosApi } from '../../services/api';
import { COMISARIAS_POR_REGIONAL } from '../../constants/comisarias';

interface HechoFormProps {
  onClose: () => void;
  onSaved: () => void;
  editHecho?: HechoFluvial | null;
  puntoIngreso: Coordenada | null;
  puntoHallazgo: Coordenada | null;
  onSelectPoint: (type: 'ingreso' | 'hallazgo') => void;
  selectingPoint: 'ingreso' | 'hallazgo' | null;
}

const emptyVictima: VictimaAdicional = {
  nombre: '',
  edad: 0,
  sexo: 'masculino',
};

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
  sintesis: '',
  duracion_busqueda: '',
  total_personal: null,
  equipo_logistico: '',
  punto_ingreso: null,
  punto_hallazgo: null,
  victimas_adicionales: [],
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
  const [showCoordsIngreso, setShowCoordsIngreso] = useState(false);
  const [showCoordsHallazgo, setShowCoordsHallazgo] = useState(false);

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
        sintesis: editHecho.sintesis || '',
        duracion_busqueda: editHecho.duracion_busqueda || '',
        total_personal: editHecho.total_personal ?? null,
        equipo_logistico: editHecho.equipo_logistico || '',
        punto_ingreso: editHecho.punto_ingreso,
        punto_hallazgo: editHecho.punto_hallazgo,
        victimas_adicionales: editHecho.victimas_adicionales ?? [],
      });
      if (editHecho.punto_ingreso) setShowCoordsIngreso(true);
      if (editHecho.punto_hallazgo) setShowCoordsHallazgo(true);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === 'unidad_regional') {
      setForm(prev => ({
        ...prev,
        unidad_regional: value as UnidadRegional,
        jurisdiccion: '',
      }));
      return;
    }
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'edad'
          ? parseInt(value) || 0
          : name === 'total_personal'
            ? value === ''
              ? null
              : parseInt(value) || 0
            : value,
    }));
  };

  /* -------- Coordenadas manuales -------- */
  const handleCoordChange = (
    point: 'punto_ingreso' | 'punto_hallazgo',
    axis: 'lat' | 'lng',
    value: string
  ) => {
    const num = parseFloat(value);
    setForm(prev => {
      const current = prev[point] ?? { lat: 0, lng: 0 };
      return {
        ...prev,
        [point]: { ...current, [axis]: isNaN(num) ? 0 : num },
      };
    });
  };

  /* -------- Víctimas adicionales -------- */
  const addVictima = () => {
    setForm(prev => ({
      ...prev,
      victimas_adicionales: [...prev.victimas_adicionales, { ...emptyVictima }],
    }));
  };

  const removeVictima = (idx: number) => {
    setForm(prev => ({
      ...prev,
      victimas_adicionales: prev.victimas_adicionales.filter(
        (_, i) => i !== idx
      ),
    }));
  };

  const handleVictimaChange = (
    idx: number,
    field: keyof VictimaAdicional,
    value: string
  ) => {
    setForm(prev => {
      const updated = [...prev.victimas_adicionales];
      if (field === 'edad') {
        updated[idx] = { ...updated[idx], edad: parseInt(value) || 0 };
      } else if (field === 'sexo') {
        updated[idx] = { ...updated[idx], sexo: value as Sexo };
      } else {
        updated[idx] = { ...updated[idx], nombre: value };
      }
      return { ...prev, victimas_adicionales: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.punto_ingreso || !form.punto_hallazgo) {
      setError('Debe seleccionar o ingresar ambos puntos geográficos');
      return;
    }

    if (
      form.punto_ingreso.lat === 0 &&
      form.punto_ingreso.lng === 0 &&
      form.punto_hallazgo.lat === 0 &&
      form.punto_hallazgo.lng === 0
    ) {
      setError('Las coordenadas no pueden ser todas 0');
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
        <h2>
          {editHecho
            ? 'Editar Intervención'
            : 'Nueva Intervención por Sumersión'}
        </h2>
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
            <option value="URC">URC — Unidad Regional Capital</option>
          </select>
        </div>

        {/* Jurisdicción */}
        <div className="form-group">
          <label>Jurisdicción *</label>
          <select
            name="jurisdiccion"
            value={form.jurisdiccion}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar comisaría...</option>
            {(COMISARIAS_POR_REGIONAL[form.unidad_regional] ?? []).map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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

        {/* Síntesis del hecho */}
        <div className="form-group">
          <label>Síntesis del Hecho</label>
          <textarea
            name="sintesis"
            value={form.sintesis}
            onChange={handleChange}
            placeholder="Breve descripción de lo ocurrido..."
            rows={3}
            className="form-textarea"
          />
        </div>

        {/* ====== DATOS OPERATIVOS ====== */}
        <div className="form-section">
          <h3>Datos Operativos</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Duración de la Búsqueda</label>
              <input
                type="text"
                name="duracion_busqueda"
                value={form.duracion_busqueda}
                onChange={handleChange}
                placeholder="Ej: 4h 30min"
              />
            </div>
            <div className="form-group">
              <label>Total de Personal</label>
              <input
                type="number"
                name="total_personal"
                value={form.total_personal ?? ''}
                onChange={handleChange}
                min={0}
                placeholder="Ej: 15"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Equipo Logístico Utilizado</label>
            <textarea
              name="equipo_logistico"
              value={form.equipo_logistico}
              onChange={handleChange}
              placeholder="Ej: 2 lanchas de rescate, 1 dron, equipo de buceo..."
              rows={3}
              className="form-textarea"
            />
          </div>
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

        {/* ====== VÍCTIMA PRINCIPAL ====== */}
        <div className="form-section">
          <h3>Datos de la Víctima</h3>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="victima"
              value={form.victima}
              onChange={handleChange}
              placeholder="Nombre completo o N.N."
              required
            />
          </div>

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
        </div>

        {/* ====== VÍCTIMAS ADICIONALES ====== */}
        <div className="form-section">
          <div className="victimas-header">
            <h3>Víctimas Adicionales</h3>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-add-victima"
              onClick={addVictima}
            >
              + Agregar víctima
            </button>
          </div>

          {form.victimas_adicionales.length === 0 && (
            <p className="victimas-empty">
              No hay víctimas adicionales. Presioná el botón para agregar más.
            </p>
          )}

          {form.victimas_adicionales.map((v, idx) => (
            <div key={idx} className="victima-card">
              <div className="victima-card-header">
                <span className="victima-card-title">Víctima {idx + 2}</span>
                <button
                  type="button"
                  className="btn btn-icon btn-remove-victima"
                  onClick={() => removeVictima(idx)}
                  title="Eliminar víctima"
                >
                  ✕
                </button>
              </div>

              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={v.nombre}
                  onChange={e =>
                    handleVictimaChange(idx, 'nombre', e.target.value)
                  }
                  placeholder="Nombre completo o N.N."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sexo</label>
                  <select
                    value={v.sexo}
                    onChange={e =>
                      handleVictimaChange(idx, 'sexo', e.target.value)
                    }
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Edad</label>
                  <input
                    type="number"
                    value={v.edad}
                    onChange={e =>
                      handleVictimaChange(idx, 'edad', e.target.value)
                    }
                    min={0}
                    max={150}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ====== PUNTOS EN MAPA + COORDENADAS ====== */}
        <div className="form-section">
          <h3>Puntos de Referencia en Mapa</h3>

          {/* Punto de Ingreso */}
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
              <button
                type="button"
                className={`btn btn-sm ${showCoordsIngreso ? 'btn-outline' : 'btn-outline'}`}
                onClick={() => {
                  setShowCoordsIngreso(prev => !prev);
                  if (!form.punto_ingreso) {
                    setForm(p => ({ ...p, punto_ingreso: { lat: 0, lng: 0 } }));
                  }
                }}
                title="Ingresar coordenadas manualmente"
              >
                ⌨ Coordenadas
              </button>
              {form.punto_ingreso && !showCoordsIngreso && (
                <span className="point-coords">
                  {form.punto_ingreso.lat.toFixed(5)},{' '}
                  {form.punto_ingreso.lng.toFixed(5)}
                </span>
              )}
            </div>

            {showCoordsIngreso && (
              <div className="coords-inputs">
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={form.punto_ingreso?.lat ?? ''}
                      onChange={e =>
                        handleCoordChange(
                          'punto_ingreso',
                          'lat',
                          e.target.value
                        )
                      }
                      placeholder="Ej: -26.8241"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={form.punto_ingreso?.lng ?? ''}
                      onChange={e =>
                        handleCoordChange(
                          'punto_ingreso',
                          'lng',
                          e.target.value
                        )
                      }
                      placeholder="Ej: -65.2226"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Punto de Hallazgo */}
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
              <button
                type="button"
                className={`btn btn-sm ${showCoordsHallazgo ? 'btn-outline' : 'btn-outline'}`}
                onClick={() => {
                  setShowCoordsHallazgo(prev => !prev);
                  if (!form.punto_hallazgo) {
                    setForm(p => ({
                      ...p,
                      punto_hallazgo: { lat: 0, lng: 0 },
                    }));
                  }
                }}
                title="Ingresar coordenadas manualmente"
              >
                ⌨ Coordenadas
              </button>
              {form.punto_hallazgo && !showCoordsHallazgo && (
                <span className="point-coords">
                  {form.punto_hallazgo.lat.toFixed(5)},{' '}
                  {form.punto_hallazgo.lng.toFixed(5)}
                </span>
              )}
            </div>

            {showCoordsHallazgo && (
              <div className="coords-inputs">
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={form.punto_hallazgo?.lat ?? ''}
                      onChange={e =>
                        handleCoordChange(
                          'punto_hallazgo',
                          'lat',
                          e.target.value
                        )
                      }
                      placeholder="Ej: -26.8300"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={form.punto_hallazgo?.lng ?? ''}
                      onChange={e =>
                        handleCoordChange(
                          'punto_hallazgo',
                          'lng',
                          e.target.value
                        )
                      }
                      placeholder="Ej: -65.2100"
                    />
                  </div>
                </div>
              </div>
            )}
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

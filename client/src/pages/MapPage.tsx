import { useState, useCallback } from 'react';
import Navbar from '../components/Layout/Navbar';
import MapView from '../components/Map/MapView';
import HechoForm from '../components/Forms/HechoForm';
import FilterPanel from '../components/Dashboard/FilterPanel';
import StatsPanel from '../components/Dashboard/StatsPanel';
import { useAuth } from '../context/AuthContext';
import { useHechos } from '../hooks/useHechos';
import { hechosApi } from '../services/api';
import type { Coordenada, HechoFluvial } from '../types';

export default function MapPage() {
  const { hasRole } = useAuth();
  const { hechos, stats, loading, filtros, applyFiltros, refresh } =
    useHechos();

  const [showForm, setShowForm] = useState(false);
  const [editHecho, setEditHecho] = useState<HechoFluvial | null>(null);
  const [selectedHecho, setSelectedHecho] = useState<HechoFluvial | null>(null);
  const [selectingPoint, setSelectingPoint] = useState<
    'ingreso' | 'hallazgo' | null
  >(null);
  const [tempIngreso, setTempIngreso] = useState<Coordenada | null>(null);
  const [tempHallazgo, setTempHallazgo] = useState<Coordenada | null>(null);

  const handleMapClick = useCallback(
    (latlng: Coordenada, pointType: 'ingreso' | 'hallazgo') => {
      if (pointType === 'ingreso') {
        setTempIngreso(latlng);
      } else {
        setTempHallazgo(latlng);
      }
      setSelectingPoint(null);
    },
    []
  );

  const handleSelectPoint = (type: 'ingreso' | 'hallazgo') => {
    setSelectingPoint(selectingPoint === type ? null : type);
  };

  const handleNewHecho = () => {
    setEditHecho(null);
    setTempIngreso(null);
    setTempHallazgo(null);
    setSelectingPoint(null);
    setShowForm(true);
  };

  const handleEditHecho = (hecho: HechoFluvial) => {
    setEditHecho(hecho);
    setTempIngreso(hecho.punto_ingreso);
    setTempHallazgo(hecho.punto_hallazgo);
    setSelectingPoint(null);
    setShowForm(true);
  };

  const handleDeleteHecho = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este hecho?')) return;
    try {
      await hechosApi.delete(id);
      setSelectedHecho(null);
      refresh();
    } catch (err) {
      alert('Error al eliminar hecho');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditHecho(null);
    setTempIngreso(null);
    setTempHallazgo(null);
    setSelectingPoint(null);
  };

  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-body">
        {/* Panel lateral izquierdo */}
        <aside className="sidebar">
          {hasRole('admin', 'operador') && (
            <button
              className="btn btn-primary btn-full"
              onClick={handleNewHecho}
            >
              + Nuevo Hecho Fluvial
            </button>
          )}

          <FilterPanel filtros={filtros} onApply={applyFiltros} />
          <StatsPanel stats={stats} totalVisible={hechos.length} />
        </aside>

        {/* Mapa central */}
        <main className="map-main">
          {selectingPoint && (
            <div className="map-instruction">
              Hacé clic en el mapa para marcar el{' '}
              <strong>
                {selectingPoint === 'ingreso'
                  ? 'punto de ingreso al agua'
                  : 'punto de hallazgo/rescate'}
              </strong>
            </div>
          )}

          <MapView
            hechos={hechos}
            onMapClick={showForm ? handleMapClick : undefined}
            selectingPoint={selectingPoint}
            tempIngreso={tempIngreso}
            tempHallazgo={tempHallazgo}
            selectedHecho={selectedHecho}
            onSelectHecho={setSelectedHecho}
          />

          {/* Detalle del hecho seleccionado */}
          {selectedHecho && !showForm && (
            <div className="detail-card">
              <div className="detail-header">
                <h3>Detalle del Hecho #{selectedHecho.id}</h3>
                <button
                  className="btn btn-icon"
                  onClick={() => setSelectedHecho(null)}
                >
                  ✕
                </button>
              </div>
              <div className="detail-body">
                <p>
                  <strong>Carátula:</strong>{' '}
                  {selectedHecho.caratula.replace(/_/g, ' ')}
                </p>
                <p>
                  <strong>Víctima:</strong> {selectedHecho.victima}
                </p>
                <p>
                  <strong>Sexo:</strong> {selectedHecho.sexo} —{' '}
                  <strong>Edad:</strong> {selectedHecho.edad || 'S/D'}
                </p>
                <p>
                  <strong>Unidad Regional:</strong>{' '}
                  {selectedHecho.unidad_regional}
                </p>
                <p>
                  <strong>Jurisdicción:</strong> {selectedHecho.jurisdiccion}
                </p>
                <p>
                  <strong>Lugar:</strong> {selectedHecho.lugar_del_hecho}
                </p>
                <p>
                  <strong>Fecha hecho:</strong>{' '}
                  {new Date(selectedHecho.fecha_del_hecho).toLocaleDateString(
                    'es-AR'
                  )}
                </p>
                {selectedHecho.fecha_del_habido && (
                  <p>
                    <strong>Fecha habido:</strong>{' '}
                    {new Date(
                      selectedHecho.fecha_del_habido
                    ).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
              {hasRole('admin', 'operador') && (
                <div className="detail-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditHecho(selectedHecho)}
                  >
                    ✏️ Editar
                  </button>
                  {hasRole('admin') && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteHecho(selectedHecho.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Panel del formulario (derecha) */}
        {showForm && (
          <aside className="form-sidebar">
            <HechoForm
              onClose={handleCloseForm}
              onSaved={refresh}
              editHecho={editHecho}
              puntoIngreso={tempIngreso}
              puntoHallazgo={tempHallazgo}
              onSelectPoint={handleSelectPoint}
              selectingPoint={selectingPoint}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

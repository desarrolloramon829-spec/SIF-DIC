import { useState, useRef, useEffect } from 'react';
import type { FiltrosHechos, CaratulaTipo, UnidadRegional } from '../../types';
import { CARATULA_LABELS } from '../../types';
import { COMISARIAS_POR_REGIONAL } from '../../constants/comisarias';

const COMISARIAS_TODAS: { region: string; lista: string[] }[] = [
  { region: 'URN — Norte', lista: COMISARIAS_POR_REGIONAL.URN },
  { region: 'URS — Sur', lista: COMISARIAS_POR_REGIONAL.URS },
  { region: 'URE — Este', lista: COMISARIAS_POR_REGIONAL.URE },
  { region: 'URO — Oeste', lista: COMISARIAS_POR_REGIONAL.URO },
  { region: 'URC — Capital', lista: COMISARIAS_POR_REGIONAL.URC },
];

// (legacy, ya no se usa directamente)
const _COMISARIAS_OLD: { region: string; lista: string[] }[] = [
  {
    region: 'Este',
    lista: [
      'Cria. Burruyacu',
      'Cria. El Cajon',
      'Cria. Villa B. Araoz',
      'Cria. El Puestito',
      'Cria. Chilcas',
      'Cria. 7 de Abril',
      'Cria. El Chañar',
      'Cria. La Ramada',
      'Cria. Garmendia',
      'Cria. El Timbo',
      'Cria. El Naranjo',
      'Cria. Piedrabuena',
      'Cria. Villa P. Monti',
      'Cria. Banda del Rio Sali',
      'Cria. Lastenia',
      'Cria. Guemes',
      'Cria. Alderetes',
      'Cria. Pozo del Alto',
      'Cria. Ranchillos',
      'Cria. Los Ralos',
      'Cria. Delfin Gallo',
      'Cria. Colombres',
      'Cria. La Florida',
      'Cria. San Andres',
      'Cria. El Bracho',
      'Cria. Las Cejas',
      'Cria. Los Bulacios',
      'Cria. Bella Vista',
      'Cria. Romera Pozo',
      'Cria. Santa Rosa de Leales',
      'Cria. Quilmes',
      'Cria. Ingenio Leales',
      'Cria. Los Sueldos',
      'Cria. Estacion Araoz',
      'Cria. Villa de Leales',
      'Cria. Rio Colorado',
      'Cria. Esquina',
      'Cria. Mancopa',
      'Cria. Agua Dulce',
      'Cria. Los Gomez',
      'Cria. Los Puestos',
      'Cria. Los Herrera',
      'Cria. El Mojon',
      'Cria. Campo El Quimil',
    ],
  },
  {
    region: 'Capital',
    lista: [
      'Comisaria 1a',
      'Comisaria 2a',
      'Comisaria 3a',
      'Comisaria 4a',
      'Comisaria 5a',
      'Comisaria 6a',
      'Comisaria 7a',
      'Comisaria 8a',
      'Comisaria 9a',
      'Comisaria 10a',
      'Comisaria 11a',
      'Comisaria 12a',
      'Comisaria 13a',
      'Comisaria 14a',
      'Comisaria 15a',
    ],
  },
  {
    region: 'Oeste',
    lista: [
      'Cria. Tafi del Valle',
      'Cria. El Mollar',
      'Cria. Amaicha del Valle',
      'Cria. Colalao del Valle',
      'Cria. Lules',
      'Cria. La Reducción',
      'Cria. El Manantial',
      'Cria. San Pablo',
      'Cria. V. Nougues',
      'Cria. Los Aguirre',
      'Cria. Famailla',
      'Cria. Tte. Berdina',
      'Cria. Monteros',
      'Cria. Santa Lucía',
      'Cria. Acheral',
      'Cria. Río Seco',
      'Cria. Villa Quinteros',
      'Cria. León Rouges',
      'Cria. Capitán Cáceres',
      'Cria. Los Sosa y Soldado Maldonado',
      'Cria. Amberes',
      'Cria. Sargento Moya',
    ],
  },
  {
    region: 'Sur',
    lista: [
      'Cria. de Concepción',
      'Sub. Cria. Alto Verde',
      'Cria. Arcadia',
      'Cria. Alpachiri',
      'Cria. Medinas',
      'Cria. La Trinidad',
      'Cria. Aguilares',
      'Sub. Cria. El Polear',
      'Cria. Sta. Ana',
      'Cria. Los Sarmientos',
      'Cria. Sta. Cruz',
      'Cria. Monteagudo',
      'Cria. Villa Chicligasta',
      'Cria. Graneros',
      'Cria. Atahona',
      'Cria. Simoca',
      'Cria. Manuela Pedraza',
      'Cria. Taco Ralo',
      'Cria. Villa Belgrano',
      'Cria. Lamadrid',
      'Cria. J. B. Alberdi',
      'Cria. Escaba',
      'Cria. La Invernada',
      'Cria. Los Juarez',
      'Cria. Juan Posse',
      'Cria. Rio Chico',
      'Cria. Pampa Mayo',
    ],
  },
  {
    region: 'Norte',
    lista: [
      'Cria. de Trancas',
      'Cria. Chuscha',
      'Cria. Choromoro',
      'Cria. Vipos',
      'Sub Cria. de Tapia',
      'Cria. San Pedro de Colalao',
      'Cria. Yerba Buena',
      'Cria. Marti Coll',
      'Cria. San José',
      'Cria. El Corte',
      'Cria. San Javier',
      'Cria. Villa Carmela',
      'Cria. Raco',
      'Cria. Los Nogales',
      'Cria. El Cadillal',
      'Cria. Las Talitas',
      'Cria. V. Mariano Moreno',
      'Cria. El Colmenar',
      'Cria. Los Pocitos',
      'Cria. Lomas de Tafi',
      'Cria. Villa Obrera',
      'Cria. Tafi Viejo',
    ],
  },
];

interface FilterPanelProps {
  filtros: FiltrosHechos;
  onApply: (filtros: FiltrosHechos) => void;
}

export default function FilterPanel({ filtros, onApply }: FilterPanelProps) {
  const [local, setLocal] = useState<FiltrosHechos>(filtros);
  const [expanded, setExpanded] = useState(true);
  const [jurisQuery, setJurisQuery] = useState(filtros.jurisdiccion || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const jurisRef = useRef<HTMLDivElement>(null);
  const jurisInputRef = useRef<HTMLInputElement>(null);

  const calcDropdownPos = () => {
    if (jurisInputRef.current) {
      const rect = jurisInputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (jurisRef.current && !jurisRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fuente según regional seleccionada o todas si no hay selección
  const fuenteComisarias = local.unidad_regional
    ? [
        {
          region: local.unidad_regional,
          lista: COMISARIAS_POR_REGIONAL[local.unidad_regional] ?? [],
        },
      ]
    : COMISARIAS_TODAS;

  const filteredComisarias = fuenteComisarias
    .map(grupo => ({
      region: grupo.region,
      lista: grupo.lista.filter(c =>
        c.toLowerCase().includes(jurisQuery.toLowerCase())
      ),
    }))
    .filter(g => g.lista.length > 0);

  const handleSelectJuris = (value: string) => {
    setJurisQuery(value);
    setLocal(prev => ({ ...prev, jurisdiccion: value }));
    setShowSuggestions(false);
  };

  const handleJurisInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJurisQuery(e.target.value);
    setLocal(prev => ({ ...prev, jurisdiccion: e.target.value }));
    calcDropdownPos();
    setShowSuggestions(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'unidad_regional') {
      setJurisQuery('');
      setLocal(prev => ({
        ...prev,
        unidad_regional: value as UnidadRegional | undefined,
        jurisdiccion: '',
      }));
      return;
    }
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply(local);
  };

  const handleClear = () => {
    const empty: FiltrosHechos = {};
    setLocal(empty);
    setJurisQuery('');
    onApply(empty);
  };

  const hasFilters = Object.values(local).some(v => v);

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setExpanded(!expanded)}>
        <h3>
          🔍 Filtros
          {hasFilters && <span className="badge badge-small">Activos</span>}
        </h3>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="filter-body">
          <div className="form-group">
            <label>Carátula</label>
            <select
              name="caratula"
              value={local.caratula || ''}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              <option value="rescate">{CARATULA_LABELS.rescate}</option>
              <option value="fallecimiento_ahogamiento">
                {CARATULA_LABELS.fallecimiento_ahogamiento}
              </option>
              <option value="hallazgo_cuerpo_nn">
                {CARATULA_LABELS.hallazgo_cuerpo_nn}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Unidad Regional</label>
            <select
              name="unidad_regional"
              value={local.unidad_regional || ''}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              <option value="URN">URN — Norte</option>
              <option value="URS">URS — Sur</option>
              <option value="URE">URE — Este</option>
              <option value="URO">URO — Oeste</option>
              <option value="URC">URC — Capital</option>
            </select>
          </div>

          <div className="form-group" ref={jurisRef}>
            <label>Jurisdicción</label>
            <input
              ref={jurisInputRef}
              type="text"
              name="jurisdiccion"
              value={jurisQuery}
              onChange={handleJurisInput}
              onFocus={() => {
                calcDropdownPos();
                setShowSuggestions(true);
              }}
              placeholder="Buscar jurisdicción..."
              autoComplete="off"
            />
            {showSuggestions && filteredComisarias.length > 0 && (
              <div
                className="juris-suggestions"
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  width: dropdownPos.width,
                }}
              >
                {filteredComisarias.map(grupo => (
                  <div key={grupo.region}>
                    <div className="juris-region-label">{grupo.region}</div>
                    {grupo.lista.map(item => (
                      <div
                        key={item}
                        className="juris-option"
                        onMouseDown={() => handleSelectJuris(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Desde</label>
              <input
                type="date"
                name="fecha_desde"
                value={local.fecha_desde || ''}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input
                type="date"
                name="fecha_hasta"
                value={local.fecha_hasta || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-sm btn-outline" onClick={handleClear}>
              Limpiar
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleApply}>
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

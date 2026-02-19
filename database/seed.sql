-- =============================================================
-- SIF-TUC — Datos de prueba (seed)
-- =============================================================
-- Contraseña de todos los usuarios de prueba: "password123"

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Admin SIF', 'admin@siftuc.gob.ar', '$2b$10$w8bvvhkLmvhrW4GKLe.RdumGtWLLAyidojiE/buiRAfyh3EXRgU7O', 'admin'),
  ('Operador Norte', 'operador.norte@siftuc.gob.ar', '$2b$10$w8bvvhkLmvhrW4GKLe.RdumGtWLLAyidojiE/buiRAfyh3EXRgU7O', 'operador'),
  ('Consulta General', 'consulta@siftuc.gob.ar', '$2b$10$w8bvvhkLmvhrW4GKLe.RdumGtWLLAyidojiE/buiRAfyh3EXRgU7O', 'consulta');

-- Hechos de prueba en distintos ríos de Tucumán

INSERT INTO hechos_fluviales (
  caratula, unidad_regional, jurisdiccion, lugar_del_hecho,
  fecha_del_hecho, fecha_del_habido, victima, sexo, edad,
  punto_ingreso, punto_hallazgo, usuario_carga_id
) VALUES
  -- Rescate en Río Salí, zona norte
  (
    'rescate', 'URN', 'Comisaría 1ra Capital',
    'Río Salí - Puente Lucas Córdoba, San Miguel de Tucumán',
    '2025-12-15', '2025-12-15',
    'Juan Carlos Pérez', 'masculino', 28,
    ST_SetSRID(ST_MakePoint(-65.2040, -26.8170), 4326),
    ST_SetSRID(ST_MakePoint(-65.2015, -26.8200), 4326),
    1
  ),
  -- Fallecimiento en Río Lules
  (
    'fallecimiento_ahogamiento', 'URS', 'Comisaría Lules',
    'Río Lules - Balneario Municipal de Lules',
    '2026-01-08', '2026-01-09',
    'María Elena Gómez', 'femenino', 34,
    ST_SetSRID(ST_MakePoint(-65.3380, -26.9300), 4326),
    ST_SetSRID(ST_MakePoint(-65.3350, -26.9340), 4326),
    2
  ),
  -- Hallazgo N.N. en Río Famaillá
  (
    'hallazgo_cuerpo_nn', 'URS', 'Comisaría Famaillá',
    'Río Famaillá - Zona rural Ruta 38',
    '2026-01-20', '2026-01-22',
    'N.N.', 'masculino', 0,
    ST_SetSRID(ST_MakePoint(-65.4020, -27.0520), 4326),
    ST_SetSRID(ST_MakePoint(-65.3980, -27.0560), 4326),
    1
  ),
  -- Rescate en Dique El Cadillal
  (
    'rescate', 'URN', 'Comisaría El Cadillal',
    'Embalse El Cadillal - Zona de recreación',
    '2026-02-05', '2026-02-05',
    'Roberto Alejandro Sánchez', 'masculino', 19,
    ST_SetSRID(ST_MakePoint(-65.2100, -26.6300), 4326),
    ST_SetSRID(ST_MakePoint(-65.2080, -26.6320), 4326),
    2
  ),
  -- Fallecimiento en Río Gastona
  (
    'fallecimiento_ahogamiento', 'URS', 'Comisaría Concepción',
    'Río Gastona - Puente Concepción',
    '2026-02-10', '2026-02-11',
    'Ana Lucía Torres', 'femenino', 22,
    ST_SetSRID(ST_MakePoint(-65.5900, -27.3400), 4326),
    ST_SetSRID(ST_MakePoint(-65.5870, -27.3430), 4326),
    1
  );

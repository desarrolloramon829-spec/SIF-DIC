-- =============================================================
-- SIIS-TUC — Migración 003
-- Agrega campos operativos de intervención:
--   1. duracion_busqueda  — tiempo trabajado en la búsqueda
--   2. total_personal     — cantidad total de personal interviniente
--   3. equipo_logistico   — descripción del equipo logístico utilizado
-- =============================================================

ALTER TABLE hechos_fluviales
  ADD COLUMN IF NOT EXISTS duracion_busqueda VARCHAR(100),
  ADD COLUMN IF NOT EXISTS total_personal    INTEGER,
  ADD COLUMN IF NOT EXISTS equipo_logistico  TEXT;

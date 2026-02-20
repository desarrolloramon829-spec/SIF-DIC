-- =============================================================
-- SIF-TUC — Migración 002
-- 1. Agrega columna "sintesis" a hechos_fluviales
-- 2. Agrega valor "URC" al enum unidad_regional_tipo
-- =============================================================

-- Agregar URC al enum (debe hacerse fuera de transacción)
ALTER TYPE unidad_regional_tipo ADD VALUE IF NOT EXISTS 'URC';

-- Agregar columna sintesis (texto libre, opcional)
ALTER TABLE hechos_fluviales
  ADD COLUMN IF NOT EXISTS sintesis TEXT;

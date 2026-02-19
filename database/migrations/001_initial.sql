-- =============================================================
-- SIF-TUC — Sistema de Información Fluvial - Policía de Tucumán
-- Migración inicial: Tablas y tipos
-- NOTA: PostGIS debe estar instalado previamente como superusuario
-- =============================================================

-- =============================================================
-- ENUM Types
-- =============================================================

CREATE TYPE caratula_tipo AS ENUM (
  'rescate',
  'fallecimiento_ahogamiento',
  'hallazgo_cuerpo_nn'
);

CREATE TYPE unidad_regional_tipo AS ENUM (
  'URN',
  'URS',
  'URE',
  'URO'
);

CREATE TYPE sexo_tipo AS ENUM (
  'masculino',
  'femenino'
);

CREATE TYPE rol_tipo AS ENUM (
  'admin',
  'operador',
  'consulta'
);

-- =============================================================
-- Tabla: usuarios
-- =============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  rol           rol_tipo      NOT NULL DEFAULT 'consulta',
  activo        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Tabla: hechos_fluviales
-- =============================================================

CREATE TABLE IF NOT EXISTS hechos_fluviales (
  id                SERIAL PRIMARY KEY,
  caratula          caratula_tipo         NOT NULL,
  unidad_regional   unidad_regional_tipo  NOT NULL,
  jurisdiccion      VARCHAR(255)          NOT NULL,
  lugar_del_hecho   VARCHAR(500)          NOT NULL,
  fecha_del_hecho   DATE                  NOT NULL,
  fecha_del_habido  DATE,
  victima           VARCHAR(255)          NOT NULL,
  sexo              sexo_tipo             NOT NULL,
  edad              INTEGER               NOT NULL CHECK (edad >= 0 AND edad <= 150),
  
  -- Puntos geográficos (SRID 4326 = WGS84)
  punto_ingreso     GEOMETRY(Point, 4326) NOT NULL,
  punto_hallazgo    GEOMETRY(Point, 4326) NOT NULL,
  
  -- Auditoría
  usuario_carga_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Índices espaciales GiST
-- =============================================================

CREATE INDEX idx_hechos_punto_ingreso  ON hechos_fluviales USING GIST (punto_ingreso);
CREATE INDEX idx_hechos_punto_hallazgo ON hechos_fluviales USING GIST (punto_hallazgo);

-- Índices adicionales para filtros frecuentes
CREATE INDEX idx_hechos_caratula        ON hechos_fluviales (caratula);
CREATE INDEX idx_hechos_unidad_regional ON hechos_fluviales (unidad_regional);
CREATE INDEX idx_hechos_fecha_hecho     ON hechos_fluviales (fecha_del_hecho);
CREATE INDEX idx_hechos_jurisdiccion    ON hechos_fluviales (jurisdiccion);

-- =============================================================
-- Función trigger para updated_at
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_hechos_updated_at
  BEFORE UPDATE ON hechos_fluviales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// Helper para convertir fila de BD a formato JSON amigable
const formatHecho = (row: any) => ({
  id: row.id,
  caratula: row.caratula,
  unidad_regional: row.unidad_regional,
  jurisdiccion: row.jurisdiccion,
  lugar_del_hecho: row.lugar_del_hecho,
  fecha_del_hecho: row.fecha_del_hecho,
  fecha_del_habido: row.fecha_del_habido,
  victima: row.victima,
  sexo: row.sexo,
  edad: row.edad,
  sintesis: row.sintesis || null,
  punto_ingreso: {
    lat: row.ingreso_lat,
    lng: row.ingreso_lng,
  },
  punto_hallazgo: {
    lat: row.hallazgo_lat,
    lng: row.hallazgo_lng,
  },
  usuario_carga_id: row.usuario_carga_id,
  usuario_carga_nombre: row.usuario_nombre || null,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const SELECT_HECHOS = `
  SELECT 
    h.id, h.caratula, h.unidad_regional, h.jurisdiccion,
    h.lugar_del_hecho, h.fecha_del_hecho, h.fecha_del_habido,
    h.victima, h.sexo, h.edad, h.sintesis,
    ST_Y(h.punto_ingreso) as ingreso_lat,
    ST_X(h.punto_ingreso) as ingreso_lng,
    ST_Y(h.punto_hallazgo) as hallazgo_lat,
    ST_X(h.punto_hallazgo) as hallazgo_lng,
    h.usuario_carga_id, h.created_at, h.updated_at,
    u.nombre as usuario_nombre
  FROM hechos_fluviales h
  LEFT JOIN usuarios u ON h.usuario_carga_id = u.id
`;

export const getHechos = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      caratula,
      unidad_regional,
      jurisdiccion,
      fecha_desde,
      fecha_hasta,
    } = req.query;

    let query = SELECT_HECHOS;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (caratula) {
      conditions.push(`h.caratula = $${paramIndex++}`);
      params.push(caratula);
    }
    if (unidad_regional) {
      conditions.push(`h.unidad_regional = $${paramIndex++}`);
      params.push(unidad_regional);
    }
    if (jurisdiccion) {
      conditions.push(`h.jurisdiccion ILIKE $${paramIndex++}`);
      params.push(`%${jurisdiccion}%`);
    }
    if (fecha_desde) {
      conditions.push(`h.fecha_del_hecho >= $${paramIndex++}`);
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      conditions.push(`h.fecha_del_hecho <= $${paramIndex++}`);
      params.push(fecha_hasta);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY h.fecha_del_hecho DESC';

    const result = await pool.query(query, params);
    res.json(result.rows.map(formatHecho));
  } catch (error) {
    console.error('Error al obtener hechos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getHechoById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(SELECT_HECHOS + ' WHERE h.id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Hecho no encontrado' });
      return;
    }

    res.json(formatHecho(result.rows[0]));
  } catch (error) {
    console.error('Error al obtener hecho:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createHecho = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      caratula,
      unidad_regional,
      jurisdiccion,
      lugar_del_hecho,
      fecha_del_hecho,
      fecha_del_habido,
      victima,
      sexo,
      edad,
      sintesis,
      punto_ingreso,
      punto_hallazgo,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO hechos_fluviales (
        caratula, unidad_regional, jurisdiccion, lugar_del_hecho,
        fecha_del_hecho, fecha_del_habido, victima, sexo, edad, sintesis,
        punto_ingreso, punto_hallazgo, usuario_carga_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        ST_SetSRID(ST_MakePoint($11, $12), 4326),
        ST_SetSRID(ST_MakePoint($13, $14), 4326),
        $15
      ) RETURNING id`,
      [
        caratula,
        unidad_regional,
        jurisdiccion,
        lugar_del_hecho,
        fecha_del_hecho,
        fecha_del_habido || null,
        victima,
        sexo,
        edad,
        sintesis || null,
        punto_ingreso.lng,
        punto_ingreso.lat,
        punto_hallazgo.lng,
        punto_hallazgo.lat,
        req.user?.id,
      ]
    );

    // Retornar el hecho completo
    const newHecho = await pool.query(SELECT_HECHOS + ' WHERE h.id = $1', [
      result.rows[0].id,
    ]);
    res.status(201).json(formatHecho(newHecho.rows[0]));
  } catch (error) {
    console.error('Error al crear hecho:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateHecho = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const {
      caratula,
      unidad_regional,
      jurisdiccion,
      lugar_del_hecho,
      fecha_del_hecho,
      fecha_del_habido,
      victima,
      sexo,
      edad,
      sintesis,
      punto_ingreso,
      punto_hallazgo,
    } = req.body;

    const result = await pool.query(
      `UPDATE hechos_fluviales SET
        caratula = $1, unidad_regional = $2, jurisdiccion = $3,
        lugar_del_hecho = $4, fecha_del_hecho = $5, fecha_del_habido = $6,
        victima = $7, sexo = $8, edad = $9, sintesis = $10,
        punto_ingreso = ST_SetSRID(ST_MakePoint($11, $12), 4326),
        punto_hallazgo = ST_SetSRID(ST_MakePoint($13, $14), 4326)
      WHERE id = $15
      RETURNING id`,
      [
        caratula,
        unidad_regional,
        jurisdiccion,
        lugar_del_hecho,
        fecha_del_hecho,
        fecha_del_habido || null,
        victima,
        sexo,
        edad,
        sintesis || null,
        punto_ingreso.lng,
        punto_ingreso.lat,
        punto_hallazgo.lng,
        punto_hallazgo.lat,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Hecho no encontrado' });
      return;
    }

    const updated = await pool.query(SELECT_HECHOS + ' WHERE h.id = $1', [id]);
    res.json(formatHecho(updated.rows[0]));
  } catch (error) {
    console.error('Error al actualizar hecho:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteHecho = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM hechos_fluviales WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Hecho no encontrado' });
      return;
    }

    res.json({ message: 'Hecho eliminado correctamente', id: parseInt(id) });
  } catch (error) {
    console.error('Error al eliminar hecho:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Helper para construir WHERE clause con filtros
const buildWhereClause = (
  query: any
): { where: string; params: any[]; nextIdx: number } => {
  const { caratula, unidad_regional, jurisdiccion, fecha_desde, fecha_hasta } =
    query;
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (caratula) {
    conditions.push(`caratula = $${paramIndex++}`);
    params.push(caratula);
  }
  if (unidad_regional) {
    conditions.push(`unidad_regional = $${paramIndex++}`);
    params.push(unidad_regional);
  }
  if (jurisdiccion) {
    conditions.push(`jurisdiccion ILIKE $${paramIndex++}`);
    params.push(`%${jurisdiccion}%`);
  }
  if (fecha_desde) {
    conditions.push(`fecha_del_hecho >= $${paramIndex++}`);
    params.push(fecha_desde);
  }
  if (fecha_hasta) {
    conditions.push(`fecha_del_hecho <= $${paramIndex++}`);
    params.push(fecha_hasta);
  }

  const where =
    conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return { where, params, nextIdx: paramIndex };
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { where, params } = buildWhereClause(req.query);

    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM hechos_fluviales ${where}`,
      params
    );

    const porCaratula = await pool.query(
      `SELECT caratula, COUNT(*) as cantidad FROM hechos_fluviales ${where} GROUP BY caratula ORDER BY cantidad DESC`,
      params
    );

    const porUnidadRegional = await pool.query(
      `SELECT unidad_regional, COUNT(*) as cantidad FROM hechos_fluviales ${where} GROUP BY unidad_regional ORDER BY cantidad DESC`,
      params
    );

    const porMes = await pool.query(
      `SELECT 
        TO_CHAR(fecha_del_hecho, 'YYYY-MM') as mes,
        COUNT(*) as cantidad
      FROM hechos_fluviales 
      ${where}
      GROUP BY mes 
      ORDER BY mes ASC 
      LIMIT 24`,
      params
    );

    const porSexo = await pool.query(
      `SELECT sexo, COUNT(*) as cantidad FROM hechos_fluviales ${where} GROUP BY sexo`,
      params
    );

    const porEdad = await pool.query(
      `SELECT
        CASE
          WHEN edad IS NULL THEN 'Sin dato'
          WHEN edad BETWEEN 0 AND 12 THEN '0-12'
          WHEN edad BETWEEN 13 AND 17 THEN '13-17'
          WHEN edad BETWEEN 18 AND 30 THEN '18-30'
          WHEN edad BETWEEN 31 AND 50 THEN '31-50'
          ELSE '51+'
        END as rango,
        COUNT(*) as cantidad
      FROM hechos_fluviales
      ${where}
      GROUP BY rango
      ORDER BY rango`,
      params
    );

    const porJurisdiccion = await pool.query(
      `SELECT jurisdiccion, COUNT(*) as cantidad FROM hechos_fluviales ${where} GROUP BY jurisdiccion ORDER BY cantidad DESC LIMIT 10`,
      params
    );

    const porDiaSemana = await pool.query(
      `SELECT
        EXTRACT(DOW FROM fecha_del_hecho)::int as dia_num,
        TO_CHAR(fecha_del_hecho, 'Day') as dia,
        COUNT(*) as cantidad
      FROM hechos_fluviales
      ${where}
      GROUP BY dia_num, dia
      ORDER BY dia_num`,
      params
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      por_caratula: porCaratula.rows,
      por_unidad_regional: porUnidadRegional.rows,
      por_mes: porMes.rows,
      por_sexo: porSexo.rows,
      por_edad: porEdad.rows,
      por_jurisdiccion: porJurisdiccion.rows,
      por_dia_semana: porDiaSemana.rows,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const exportHechos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      caratula,
      unidad_regional,
      jurisdiccion,
      fecha_desde,
      fecha_hasta,
    } = req.query;

    let query = `
      SELECT 
        h.id,
        h.caratula,
        h.unidad_regional,
        h.jurisdiccion,
        h.lugar_del_hecho,
        TO_CHAR(h.fecha_del_hecho, 'DD/MM/YYYY') as fecha_del_hecho,
        TO_CHAR(h.fecha_del_habido, 'DD/MM/YYYY') as fecha_del_habido,
        h.victima,
        h.sexo,
        h.edad,
        h.sintesis,
        ST_Y(h.punto_ingreso) as ingreso_lat,
        ST_X(h.punto_ingreso) as ingreso_lng,
        ST_Y(h.punto_hallazgo) as hallazgo_lat,
        ST_X(h.punto_hallazgo) as hallazgo_lng,
        u.nombre as usuario_carga,
        TO_CHAR(h.created_at, 'DD/MM/YYYY HH24:MI') as created_at
      FROM hechos_fluviales h
      LEFT JOIN usuarios u ON h.usuario_carga_id = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (caratula) {
      conditions.push(`h.caratula = $${paramIndex++}`);
      params.push(caratula);
    }
    if (unidad_regional) {
      conditions.push(`h.unidad_regional = $${paramIndex++}`);
      params.push(unidad_regional);
    }
    if (jurisdiccion) {
      conditions.push(`h.jurisdiccion ILIKE $${paramIndex++}`);
      params.push(`%${jurisdiccion}%`);
    }
    if (fecha_desde) {
      conditions.push(`h.fecha_del_hecho >= $${paramIndex++}`);
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      conditions.push(`h.fecha_del_hecho <= $${paramIndex++}`);
      params.push(fecha_hasta);
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY h.fecha_del_hecho DESC';

    const result = await pool.query(query, params);

    const headers = [
      'ID',
      'Carátula',
      'Unidad Regional',
      'Jurisdicción',
      'Lugar del Hecho',
      'Fecha del Hecho',
      'Fecha del Habido',
      'Víctima',
      'Sexo',
      'Edad',
      'Síntesis',
      'Lat. Ingreso',
      'Lng. Ingreso',
      'Lat. Hallazgo',
      'Lng. Hallazgo',
      'Usuario Carga',
      'Fecha Carga',
    ];

    const csvRows = [
      headers.join(','),
      ...result.rows.map(row =>
        [
          row.id,
          `"${row.caratula}"`,
          `"${row.unidad_regional}"`,
          `"${(row.jurisdiccion || '').replace(/"/g, '""')}"`,
          `"${(row.lugar_del_hecho || '').replace(/"/g, '""')}"`,
          `"${row.fecha_del_hecho || ''}"`,
          `"${row.fecha_del_habido || ''}"`,
          `"${(row.victima || '').replace(/"/g, '""')}"`,
          `"${row.sexo || ''}"`,
          row.edad || '',
          `"${(row.sintesis || '').replace(/"/g, '""')}"`,
          row.ingreso_lat || '',
          row.ingreso_lng || '',
          row.hallazgo_lat || '',
          row.hallazgo_lng || '',
          `"${(row.usuario_carga || '').replace(/"/g, '""')}"`,
          `"${row.created_at || ''}"`,
        ].join(',')
      ),
    ];

    const csv = '\uFEFF' + csvRows.join('\n'); // BOM para Excel en UTF-8
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hechos_fluviales_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar hechos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

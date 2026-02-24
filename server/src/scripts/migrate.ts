import fs from 'fs';
import path from 'path';
import pool from '../config/db';

// Códigos de error de PostgreSQL que indican "ya existe"
const ALREADY_EXISTS_CODES = new Set([
  '42710', // duplicate_object (tipo/enum ya existe)
  '42P07', // duplicate_table
  '42701', // duplicate_column
  '42704', // undefined_object al hacer ADD VALUE IF NOT EXISTS (no aplica)
]);

async function migrate() {
  try {
    console.log('🔄 Ejecutando migraciones...');

    // Crear tabla de control si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'database',
      'migrations'
    );

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Obtener migraciones ya registradas
    const { rows } = await pool.query('SELECT filename FROM schema_migrations');
    const applied = new Set(rows.map((r: any) => r.filename));

    let pendientes = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ✓ ${file} (ya aplicada)`);
        continue;
      }

      console.log(`  → ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      try {
        await pool.query(sql);
      } catch (err: any) {
        if (ALREADY_EXISTS_CODES.has(err.code)) {
          // La migración ya fue aplicada manualmente antes de usar este script
          console.log(`  ⚠ ${file} (ya estaba aplicada, registrando...)`);
        } else {
          throw err; // Error real → propagar
        }
      }

      // Registrar como aplicada (tanto éxito como "ya existía")
      await pool.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      );
      pendientes++;
    }

    if (pendientes === 0) {
      console.log('✅ No hay migraciones pendientes');
    } else {
      console.log(`✅ ${pendientes} migración(es) procesada(s) correctamente`);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

migrate();

import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function migrate() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    const migrationPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'database',
      'migrations',
      '001_initial.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    await pool.query(sql);
    console.log('✅ Migraciones ejecutadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

migrate();

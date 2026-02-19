import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function seed() {
  try {
    console.log('🌱 Insertando datos de prueba...');
    const seedPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'database',
      'seed.sql'
    );
    const sql = fs.readFileSync(seedPath, 'utf-8');
    await pool.query(sql);
    console.log('✅ Datos de prueba insertados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    process.exit(1);
  }
}

seed();

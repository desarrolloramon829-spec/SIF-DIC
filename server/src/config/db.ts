import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sif_tuc',
  user: process.env.DB_USER || 'sif_admin',
  password: process.env.DB_PASS || 'sif_password_2026',
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', err => {
  console.error('❌ Error en conexión PostgreSQL:', err);
  process.exit(-1);
});

export default pool;

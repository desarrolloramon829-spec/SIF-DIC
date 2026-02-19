import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import hechosRoutes from './routes/hechos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware global
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/hechos', hechosRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SIF-TUC API',
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 SIF-TUC API corriendo en http://localhost:${PORT}`);
});

// Manejo de error si el puerto está ocupado
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ El puerto ${PORT} ya está en uso.`);
    console.error(`   Ejecutá: npm run kill-port   (para liberar el puerto)`);
    console.error(`   Luego:   npm run dev\n`);
    process.exit(1);
  }
  throw err;
});

// Graceful shutdown: cerrar el socket al recibir señales de cierre
const shutdown = () => {
  console.log('\n🛑 Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado limpiamente.');
    process.exit(0);
  });
  // Forzar cierre si tarda más de 5s
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;

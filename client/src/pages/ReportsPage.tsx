import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import ReportFilterBar from '../components/Reports/ReportFilterBar';
import SummaryCards from '../components/Reports/SummaryCards';
import ChartByCaratula from '../components/Reports/ChartByCaratula';
import ChartByRegional from '../components/Reports/ChartByRegional';
import ChartByMonth from '../components/Reports/ChartByMonth';
import ChartBySexo from '../components/Reports/ChartBySexo';
import ChartByEdad from '../components/Reports/ChartByEdad';
import ChartByJurisdiccion from '../components/Reports/ChartByJurisdiccion';
import ChartByDiaSemana from '../components/Reports/ChartByDiaSemana';
import type { FiltrosHechos, Stats } from '../types';
import { CARATULA_LABELS, UNIDAD_REGIONAL_LABELS } from '../types';
import { hechosApi } from '../services/api';

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosHechos>({});
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchStats = useCallback(async (f: FiltrosHechos = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hechosApi.getStats(f);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApplyFiltros = (newFiltros: FiltrosHechos) => {
    setFiltros(newFiltros);
    fetchStats(newFiltros);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await hechosApi.exportCSV(filtros);
    } catch {
      alert('Error al exportar CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!printRef.current || !stats) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(printRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Si el contenido es más largo que una página, paginar
      const pageHeightMM = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeightMM) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let yPosition = 0;
        let remainingHeight = pdfHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, -yPosition, pdfWidth, pdfHeight);
          remainingHeight -= pageHeightMM;
          yPosition += pageHeightMM;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`informe_intervenciones_sumersion_${fecha}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error al generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Construir texto descriptivo de filtros activos
  const filtrosTexto = (() => {
    const partes: string[] = [];
    if (filtros.caratula)
      partes.push(CARATULA_LABELS[filtros.caratula] || filtros.caratula);
    if (filtros.unidad_regional)
      partes.push(
        UNIDAD_REGIONAL_LABELS[filtros.unidad_regional] ||
          filtros.unidad_regional
      );
    if (filtros.jurisdiccion)
      partes.push(`Jurisdicción: ${filtros.jurisdiccion}`);
    if (filtros.fecha_desde) partes.push(`Desde: ${filtros.fecha_desde}`);
    if (filtros.fecha_hasta) partes.push(`Hasta: ${filtros.fecha_hasta}`);
    return partes.length > 0
      ? partes.join(' · ')
      : 'Sin filtros aplicados (totales globales)';
  })();

  return (
    <div className="app-layout">
      <Navbar />
      <div className="reports-page">
        {/* Barra de filtros y exportación */}
        <ReportFilterBar
          filtros={filtros}
          onApply={handleApplyFiltros}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />

        {/* Indicador de navegación */}
        <div className="reports-breadcrumb">
          <Link to="/" className="reports-breadcrumb__link">
            ← Volver al Mapa
          </Link>
          <span className="reports-breadcrumb__sep">|</span>
          <span className="reports-breadcrumb__filter">{filtrosTexto}</span>
        </div>

        {/* Contenido imprimible */}
        <div className="reports-content" ref={printRef}>
          {/* Encabezado del informe */}
          <div className="report-header">
            <div className="report-header__logo">🌊</div>
            <div className="report-header__info">
              <h1>Informe de Intervenciones por Sumersión</h1>
              <p>
                Policía de Tucumán — Sistema de Información de Intervenciones
                por Sumersión (SIIS-TUC)
              </p>
              <p className="report-header__meta">
                Generado:{' '}
                {new Date().toLocaleDateString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                &nbsp;|&nbsp; Filtros: {filtrosTexto}
              </p>
            </div>
          </div>

          {loading && (
            <div className="reports-loading">
              <div className="spinner" />
              <p>Calculando estadísticas...</p>
            </div>
          )}

          {error && (
            <div className="reports-error">
              <p>⚠ {error}</p>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => fetchStats(filtros)}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && stats && (
            <>
              {/* Tarjetas de resumen */}
              <section className="reports-section">
                <h2 className="reports-section__title">Resumen General</h2>
                <SummaryCards stats={stats} />
              </section>

              {/* Gráficos — fila 1 */}
              <section className="reports-section">
                <h2 className="reports-section__title">
                  Distribución de Hechos
                </h2>
                <div className="charts-grid">
                  <ChartByCaratula stats={stats} />
                  <ChartByRegional stats={stats} />
                  <ChartBySexo stats={stats} />
                </div>
              </section>

              {/* Gráfico de línea temporal — ancho completo */}
              <section className="reports-section">
                <h2 className="reports-section__title">Evolución Temporal</h2>
                <div className="charts-grid charts-grid--full">
                  <ChartByMonth stats={stats} />
                </div>
              </section>

              {/* Gráficos — fila 2 */}
              <section className="reports-section">
                <h2 className="reports-section__title">
                  Análisis Demográfico y Geográfico
                </h2>
                <div className="charts-grid">
                  <ChartByEdad stats={stats} />
                  <ChartByDiaSemana stats={stats} />
                </div>
              </section>

              {/* Jurisdicción — ancho completo */}
              {stats.por_jurisdiccion.length > 0 && (
                <section className="reports-section">
                  <h2 className="reports-section__title">
                    Jurisdicciones con Mayor Incidencia
                  </h2>
                  <div className="charts-grid charts-grid--full">
                    <ChartByJurisdiccion stats={stats} />
                  </div>
                </section>
              )}

              {/* Tabla de detalle por carátula y regional */}
              <section className="reports-section reports-section--print">
                <h2 className="reports-section__title">
                  Cuadro Estadístico Detallado
                </h2>
                <div className="stats-table-wrapper">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Carátula</th>
                        {stats.por_unidad_regional.map(r => (
                          <th key={r.unidad_regional}>{r.unidad_regional}</th>
                        ))}
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.por_caratula.map(c => (
                        <tr key={c.caratula}>
                          <td>
                            {CARATULA_LABELS[
                              c.caratula as keyof typeof CARATULA_LABELS
                            ] || c.caratula}
                          </td>
                          {stats.por_unidad_regional.map(r => (
                            <td key={r.unidad_regional}>—</td>
                          ))}
                          <td className="stats-table__total">{c.cantidad}</td>
                        </tr>
                      ))}
                      <tr className="stats-table__footer">
                        <td>
                          <strong>Total</strong>
                        </td>
                        {stats.por_unidad_regional.map(r => (
                          <td key={r.unidad_regional}>
                            <strong>{r.cantidad}</strong>
                          </td>
                        ))}
                        <td className="stats-table__total">
                          <strong>{stats.total}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

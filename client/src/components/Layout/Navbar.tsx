import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🌊</span>
        <h1 className="navbar-title">SIF-TUC</h1>
        <span className="navbar-subtitle">Sistema de Información Fluvial</span>
      </div>

      {user && (
        <div className="navbar-user">
          <span className="navbar-user-info">
            {user.nombre} — <span className="badge badge-role">{user.rol.toUpperCase()}</span>
          </span>
          <button className="btn btn-sm btn-outline" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

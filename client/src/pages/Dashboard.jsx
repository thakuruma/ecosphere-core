import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">EcoSphere</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

        {/* KPI cards — wire these to GET /api/dashboard/summary once it's ready */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Total CO2 Emitted" value="—" unit="kg" />
          <KpiCard label="CSR Participants" value="—" />
          <KpiCard label="Open Compliance Issues" value="—" />
          <KpiCard label="Your XP Points" value={user?.xp_points ?? 0} />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-slate-400 text-sm">
          Environmental, Social, Gamification, and Governance modules will render here as
          each team member's screens are built. Add routes in App.jsx and link them from
          this dashboard.
        </div>
      </main>
    </div>
  );
}

function KpiCard({ label, value, unit }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">
        {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

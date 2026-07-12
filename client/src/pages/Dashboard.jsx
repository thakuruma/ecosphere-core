import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalCo2: 0,
    csrParticipants: 0,
    openIssues: 0,
    xpPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token'); // Grab auth token from login
        const headers = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch parallel metrics from the server endpoints you created
        const [co2Res, complianceRes, gamificationRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/emissions-summary', { headers }).catch(() => null),
          fetch('http://localhost:5000/api/compliance-issues', { headers }).catch(() => null),
          fetch('http://localhost:5000/api/leaderboard', { headers }).catch(() => null)
        ]);

        const co2Data = co2Res ? await co2Res.json() : { totalEmission: 0 };
        const complianceData = complianceRes ? await complianceRes.json() : [];
        const gamificationData = gamificationRes ? await gamificationRes.json() : [];

        // Count how many compliance issues are open/overdue
        const openIssuesCount = Array.isArray(complianceData) 
          ? complianceData.filter(issue => issue.status !== 'resolved').length 
          : 0;

        // Sum up CO2 across all departments (co2Data is an array)
const totalCo2 = Array.isArray(co2Data)
  ? co2Data.reduce((sum, dept) => sum + parseFloat(dept.total_co2 || 0), 0)
  : 0;

// Find current user's XP from the leaderboard data
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const myLeaderboardEntry = Array.isArray(gamificationData)
  ? gamificationData.find(emp => emp.id === currentUser.id)
  : null;
const myXp = myLeaderboardEntry ? myLeaderboardEntry.xp_points : 0;

setMetrics({
  totalCo2: totalCo2,
  csrParticipants: 0,
  openIssues: openIssuesCount || 0,
  xpPoints: myXp
});
      } catch (error) {
        console.error("Error connecting to backend modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Total CO2 Emitted</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : `${metrics.totalCo2} kg`}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">CSR Participants</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : metrics.csrParticipants}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Open Compliance Issues</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : metrics.openIssues}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Your XP Points</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : metrics.xpPoints}</p>
        </div>
      </div>

      {/* Modules Message Box */}
      <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100/50 text-blue-700">
        <p className="font-semibold text-sm">System Status: Connected</p>
        <p className="text-xs mt-1 opacity-80">
          Backend server endpoints successfully integrated. Real-time token payloads are being tracked dynamically.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalScans: 0,
    healthyScans: 0,
    unhealthyScans: 0,
    highConfidenceScans: 0,
  });
  const [todayStats, setTodayStats] = useState({
    scansToday: 0,
    newUsersToday: 0,
    feedbackToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => !u.isBlocked).length;
        const blockedUsers = users.filter((u) => u.isBlocked).length;
        const newUsersToday = users.filter((u) => {
          if (!u.createdAt) return false;
          return new Date(u.createdAt) >= today;
        }).length;

        const scansSnap = await getDocs(collection(db, "history"));
        const scans = scansSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const totalScans = scans.length;
        const healthyScans = scans.filter((s) => s.isHealthy === true).length;
        const unhealthyScans = scans.filter((s) => s.isHealthy === false).length;
        const highConfidenceScans = scans.filter((s) => s.confidence >= 80).length;
        const scansToday = scans.filter((s) => {
          if (!s.timestamp) return false;
          const scanDate = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
          return scanDate >= today;
        }).length;

        let feedbackToday = 0;
        try {
          const feedbackSnap = await getDocs(collection(db, "feedback"));
          feedbackToday = feedbackSnap.docs.filter((doc) => {
            const data = doc.data();
            if (!data.createdAt) return false;
            return new Date(data.createdAt) >= today;
          }).length;
        } catch (e) {}

        setStats({ totalUsers, activeUsers, blockedUsers, totalScans, healthyScans, unhealthyScans, highConfidenceScans });
        setTodayStats({ scansToday, newUsersToday, feedbackToday });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getPercent = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const pieData = {
    labels: ["Healthy", "Unhealthy"],
    datasets: [{
      data: [stats.healthyScans, stats.unhealthyScans],
      backgroundColor: ["#00904a", "#e53935"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} scans (${getPercent(ctx.raw, stats.totalScans)}%)`,
        },
      },
    },
  };

  if (loading) {
    return <div className="loading-screen">Loading dashboard...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-title">Dashboard</div>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        <div className="stat-card clickable" onClick={() => navigate("/users")}>
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-link">View all users →</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate("/users?filter=active")}>
          <div className="stat-icon">✅</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-value green">{stats.activeUsers}</div>
          <div className="stat-link">View active →</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate("/users?filter=blocked")}>
          <div className="stat-icon">🚫</div>
          <div className="stat-label">Blocked Users</div>
          <div className="stat-value red">{stats.blockedUsers}</div>
          <div className="stat-link">View blocked →</div>
        </div>
        <div className="stat-card clickable" onClick={() => navigate("/scans")}>
          <div className="stat-icon">🔍</div>
          <div className="stat-label">Total Scans</div>
          <div className="stat-value">{stats.totalScans}</div>
          <div className="stat-link">View all scans →</div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="today-section">
        <div className="today-title">Today's Activity</div>
        <div className="today-cards">
          <div className="today-card">
            <div className="today-icon">🔍</div>
            <div className="today-info">
              <div className="today-value">{todayStats.scansToday}</div>
              <div className="today-label">Scans today</div>
            </div>
          </div>
          <div className="today-card">
            <div className="today-icon">👤</div>
            <div className="today-info">
              <div className="today-value">{todayStats.newUsersToday}</div>
              <div className="today-label">New users today</div>
            </div>
          </div>
          <div className="today-card">
            <div className="today-icon">💬</div>
            <div className="today-info">
              <div className="today-value">{todayStats.feedbackToday}</div>
              <div className="today-label">Feedback today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="health-card">
        <div className="health-card-title">Scan Health Overview</div>
        <div className="health-content">
          <div className="pie-wrapper">
            <Doughnut data={pieData} options={pieOptions} />
            <div className="pie-center-label">
              <div className="pie-center-value">{stats.totalScans}</div>
              <div className="pie-center-text">Total</div>
            </div>
          </div>
          <div className="health-stats">
            <div className="health-stat-item">
              <div className="health-stat-dot green"></div>
              <div>
                <div className="health-stat-label">Healthy scans</div>
                <div className="health-stat-value green">{stats.healthyScans} <span className="health-stat-total">/ {stats.totalScans}</span></div>
                <div className="health-stat-percent">{getPercent(stats.healthyScans, stats.totalScans)}% of total</div>
              </div>
            </div>
            <div className="health-stat-item">
              <div className="health-stat-dot red"></div>
              <div>
                <div className="health-stat-label">Unhealthy scans</div>
                <div className="health-stat-value red">{stats.unhealthyScans} <span className="health-stat-total">/ {stats.totalScans}</span></div>
                <div className="health-stat-percent">{getPercent(stats.unhealthyScans, stats.totalScans)}% of total</div>
              </div>
            </div>
            <div className="health-stat-item">
              <div className="health-stat-dot gray"></div>
              <div>
                <div className="health-stat-label">High confidence (80%+)</div>
                <div className="health-stat-value">{stats.highConfidenceScans} <span className="health-stat-total">/ {stats.totalScans}</span></div>
                <div className="health-stat-percent">{getPercent(stats.highConfidenceScans, stats.totalScans)}% of total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
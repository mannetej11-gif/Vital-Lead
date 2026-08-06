import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, Users, Mail, BarChart3, Zap, LogOut, Eye, EyeOff,
  Activity, Clock, TrendingUp, MessageSquare, CheckCircle, Settings,
  Bell, UserCircle, ChevronRight, Search, X, Phone, AlertTriangle,
  Stethoscope, FileText, Headphones, Heart, Plus, Calendar, CreditCard,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const API_URL = "https://vital-lead-production.up.railway.app";

// ====== PATIENT DATA ======
const MOCK_PATIENTS = [
  { id: "P-001", name: "John Smith", condition: "Cancer", age: 72, score: 95, priority: "Critical", admission: "Emergency", testResult: "Abnormal" },
  { id: "P-002", name: "Maria Garcia", condition: "Hypertension", age: 58, score: 78, priority: "High", admission: "Urgent", testResult: "Inconclusive" },
  { id: "P-003", name: "David Lee", condition: "Diabetes", age: 45, score: 62, priority: "Moderate", admission: "Elective", testResult: "Abnormal" },
  { id: "P-004", name: "Sarah Johnson", condition: "Asthma", age: 34, score: 38, priority: "Routine", admission: "Elective", testResult: "Normal" },
  { id: "P-005", name: "Robert Wilson", condition: "Arthritis", age: 68, score: 72, priority: "High", admission: "Urgent", testResult: "Inconclusive" },
];

// ====== COLOR PALETTE - Hospital Green & White ======
const COLORS = {
  bg: {
    primary: "#FFFFFF",
    secondary: "#F8FBFA",
    tertiary: "#E8F5F1",
    sidebar: "#1B5E46", // Deep hospital green
  },
  text: {
    primary: "#1B5E46",
    secondary: "#4A7C6F",
    light: "#7CA89F",
  },
  accent: {
    green: "#00A86B", // Hospital green
    lightGreen: "#2ECC71", // Bright green
    darkGreen: "#1B5E46", // Dark green
    red: "#E74C3C", // For alerts
    orange: "#F39C12", // For warnings
    blue: "#3498DB", // For info
  },
  border: "#D0E6E1",
  shadow: "rgba(27, 94, 70, 0.1)",
};

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function HospitalBackground() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: `linear-gradient(135deg, ${COLORS.bg.primary} 0%, ${COLORS.bg.secondary} 100%)`,
      zIndex: 0,
      pointerEvents: "none",
    }} />
  );
}

export default function VitalLeadApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("jwt_token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        alert("Login failed: " + data.error);
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (username, email, password, fullName) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, full_name: fullName })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please login.");
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} loading={loading} />;
  }

  return <DashboardPage user={user} token={token} onLogout={logout} />;
}

// ====== LOGIN PAGE ======
function LoginPage({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(username, password);
    } else {
      onRegister(username, email, password, fullName);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: `linear-gradient(135deg, ${COLORS.bg.primary} 0%, ${COLORS.bg.tertiary} 100%)`,
      fontFamily: "'Poppins', sans-serif",
      padding: "20px"
    }}>
      <HospitalBackground />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "450px" }}>
        <div style={{
          borderRadius: "20px",
          padding: "50px 40px",
          background: COLORS.bg.primary,
          boxShadow: `0 20px 60px ${COLORS.shadow}`,
          border: `2px solid ${COLORS.border}`
        }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "16px"
            }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${COLORS.accent.green}, ${COLORS.accent.lightGreen})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 10px 25px rgba(0, 168, 107, 0.3)`
              }}>
                <Heart size={28} color="white" fill="white" />
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: COLORS.text.primary
              }}>VitalLead</span>
            </div>
            <p style={{ fontSize: "15px", color: COLORS.text.secondary, marginTop: "8px" }}>
              🏥 Patient Care Management System
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: "12px",
                background: isLogin ? `linear-gradient(135deg, ${COLORS.accent.green}, ${COLORS.accent.lightGreen})` : "transparent",
                color: isLogin ? "white" : COLORS.text.secondary,
                border: `2px solid ${isLogin ? COLORS.accent.green : COLORS.border}`,
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: "12px",
                background: !isLogin ? `linear-gradient(135deg, ${COLORS.accent.green}, ${COLORS.accent.lightGreen})` : "transparent",
                color: !isLogin ? "white" : COLORS.text.secondary,
                border: `2px solid ${!isLogin ? COLORS.accent.green : COLORS.border}`,
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {!isLogin && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `2px solid ${COLORS.border}`,
                  background: COLORS.bg.secondary,
                  color: COLORS.text.primary,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.accent.green}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            )}

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: `2px solid ${COLORS.border}`,
                background: COLORS.bg.secondary,
                color: COLORS.text.primary,
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.accent.green}
              onBlur={(e) => e.target.style.borderColor = COLORS.border}
            />

            {!isLogin && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `2px solid ${COLORS.border}`,
                  background: COLORS.bg.secondary,
                  color: COLORS.text.primary,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.accent.green}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            )}

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  paddingRight: "40px",
                  borderRadius: "10px",
                  border: `2px solid ${COLORS.border}`,
                  background: COLORS.bg.secondary,
                  color: COLORS.text.primary,
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.accent.green}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  color: COLORS.text.secondary
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                marginTop: "12px",
                background: `linear-gradient(135deg, ${COLORS.accent.green}, ${COLORS.accent.lightGreen})`,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s",
                boxShadow: `0 10px 25px rgba(0, 168, 107, 0.3)`
              }}
            >
              {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          {isLogin && (
            <div style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: COLORS.bg.tertiary,
              border: `2px solid ${COLORS.border}`
            }}>
              <p style={{ fontSize: "12px", color: COLORS.accent.green, fontWeight: 600, marginBottom: "8px" }}>
                🔐 Demo Credentials:
              </p>
              <p style={{ fontSize: "12px", color: COLORS.text.secondary, margin: "4px 0" }}>
                Username: <span style={{ color: COLORS.text.primary, fontWeight: 600 }}>manne</span>
              </p>
              <p style={{ fontSize: "12px", color: COLORS.text.secondary }}>
                Password: <span style={{ color: COLORS.text.primary, fontWeight: 600 }}>password123</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ====== DASHBOARD PAGE ======
function DashboardPage({ user, token, onLogout }) {
  const [activeModule, setActiveModule] = useState("dashboard");

  const modules = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "patients", label: "Patient Leads", icon: Users },
    { key: "email", label: "AI Email", icon: Mail },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.bg.primary} 0%, ${COLORS.bg.secondary} 100%)`,
      color: COLORS.text.primary,
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      display: "flex"
    }}>
      <HospitalBackground />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%" }}>
        {/* Sidebar */}
        <aside style={{
          width: "260px",
          background: COLORS.bg.sidebar,
          boxShadow: `4px 0 15px ${COLORS.shadow}`,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          borderRight: `3px solid ${COLORS.accent.green}`
        }}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Heart size={24} color={COLORS.accent.lightGreen} fill={COLORS.accent.lightGreen} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "white" }}>
                VitalLead
              </h2>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Healthcare CRM</p>
          </div>

          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            {modules.map(mod => {
              const Icon = mod.icon;
              const active = activeModule === mod.key;
              return (
                <button key={mod.key} onClick={() => setActiveModule(mod.key)} style={{
                  background: active ? "rgba(255,255,255,0.25)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.7)",
                  padding: "12px",
                  borderRadius: "10px",
                  border: active ? `2px solid ${COLORS.accent.lightGreen}` : "none",
                  fontWeight: active ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.3s"
                }}>
                  <Icon size={16} />
                  {mod.label}
                </button>
              );
            })}
          </nav>

          <button onClick={onLogout} style={{
            background: "#E74C3C",
            color: "white",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "13px"
          }}>
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {/* Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: `2px solid ${COLORS.border}`,
            background: COLORS.bg.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: `0 4px 12px ${COLORS.shadow}`
          }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: COLORS.text.primary }}>
              Dashboard
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text.primary }}>{user?.full_name}</p>
                <p style={{ fontSize: "12px", color: COLORS.text.secondary }}>{user?.role}</p>
              </div>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLORS.accent.green}, ${COLORS.accent.lightGreen})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <UserCircle size={24} color="white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "32px" }}>
            {activeModule === "dashboard" && <DashboardView user={user} />}
            {activeModule === "patients" && <PatientsView patients={MOCK_PATIENTS} />}
            {activeModule === "email" && <EmailView />}
            {activeModule === "analytics" && <AnalyticsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ====== VIEWS ======
function DashboardView({ user }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{
        borderRadius: "15px",
        padding: "24px",
        background: COLORS.bg.primary,
        border: `2px solid ${COLORS.border}`,
        boxShadow: `0 10px 30px ${COLORS.shadow}`
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: COLORS.text.primary, marginBottom: "8px" }}>
          Welcome back, {user?.username}! 👋
        </h2>
        <p style={{ fontSize: "14px", color: COLORS.text.secondary }}>
          Your patient care dashboard is ready. Manage leads, send emails, and track analytics.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard title="Total Patients" value="140" icon="👥" color={COLORS.accent.green} />
        <StatCard title="Active Cases" value="32" icon="📋" color={COLORS.accent.blue} />
        <StatCard title="Follow-ups" value="18" icon="📞" color={COLORS.accent.orange} />
        <StatCard title="Success Rate" value="87%" icon="✅" color={COLORS.accent.lightGreen} />
      </div>
    </div>
  );
}

function PatientsView({ patients }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard title="Total Patients" value="140" icon="👥" color={COLORS.accent.green} />
        <StatCard title="Critical Cases" value="23" icon="🚨" color={COLORS.accent.red} />
        <StatCard title="High Priority" value="45" icon="⚠️" color={COLORS.accent.orange} />
        <StatCard title="Avg Score" value="68" icon="📊" color={COLORS.accent.blue} />
      </div>

      <div style={{
        borderRadius: "15px",
        padding: "20px",
        background: COLORS.bg.primary,
        border: `2px solid ${COLORS.border}`,
        boxShadow: `0 10px 30px ${COLORS.shadow}`,
        overflow: "hidden"
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: COLORS.text.primary }}>
          Patient Directory
        </h3>
        <table style={{ width: "100%", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              {["Patient", "Condition", "Age", "Score", "Priority"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px", color: COLORS.text.secondary, fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "12px", color: COLORS.text.primary, fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "12px", color: COLORS.text.secondary }}>{p.condition}</td>
                <td style={{ padding: "12px", color: COLORS.text.secondary }}>{p.age}</td>
                <td style={{ padding: "12px", color: COLORS.accent.green, fontWeight: 600 }}>{p.score}</td>
                <td style={{ padding: "12px" }}>
                  <PriorityBadge priority={p.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailView() {
  return (
    <div style={{
      borderRadius: "15px",
      padding: "40px",
      background: COLORS.bg.primary,
      border: `2px solid ${COLORS.border}`,
      textAlign: "center",
      boxShadow: `0 10px 30px ${COLORS.shadow}`
    }}>
      <Mail size={48} color={COLORS.accent.green} style={{ marginBottom: "16px" }} />
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text.primary, marginBottom: "8px" }}>
        AI Email Generator
      </h3>
      <p style={{ color: COLORS.text.secondary }}>Generate personalized patient outreach emails powered by AI</p>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div style={{
      borderRadius: "15px",
      padding: "40px",
      background: COLORS.bg.primary,
      border: `2px solid ${COLORS.border}`,
      textAlign: "center",
      boxShadow: `0 10px 30px ${COLORS.shadow}`
    }}>
      <BarChart3 size={48} color={COLORS.accent.green} style={{ marginBottom: "16px" }} />
      <h3 style={{ fontSize: "20px", fontWeight: 700, color: COLORS.text.primary, marginBottom: "8px" }}>
        Analytics Dashboard
      </h3>
      <p style={{ color: COLORS.text.secondary }}>Real-time patient data visualization and insights</p>
    </div>
  );
}

// ====== COMPONENTS ======
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      borderRadius: "15px",
      padding: "20px",
      background: COLORS.bg.primary,
      border: `2px solid ${COLORS.border}`,
      boxShadow: `0 10px 30px ${COLORS.shadow}`,
      transition: "all 0.3s"
    }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
       onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      <p style={{ fontSize: "12px", color: COLORS.text.secondary, fontWeight: 600, marginBottom: "8px" }}>
        {title}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "28px", fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>
          {value}
        </p>
        <span style={{ fontSize: "32px" }}>{icon}</span>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    Critical: { bg: "#FADBD8", fg: "#C0392B", icon: "🔴" },
    High: { bg: "#FEF5E7", fg: "#D68910", icon: "🟠" },
    Moderate: { bg: "#D6EAF8", fg: "#1F618D", icon: "🔵" },
    Routine: { bg: "#D5F4E6", fg: "#117A65", icon: "🟢" }
  };
  const c = colors[priority] || colors.Routine;
  return (
    <span style={{
      fontSize: "11px",
      padding: "6px 12px",
      borderRadius: "8px",
      background: c.bg,
      color: c.fg,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }}>
      {c.icon} {priority}
    </span>
  );
}

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CheckCircle, Clock, Zap,
  Search, X, Upload, Phone, Mail, Activity, Settings, Bell,
  ChevronRight, TrendingUp, FileText, AlertCircle, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
}

function ECGPulseBackground() {
  return (
    <svg className="fixed inset-0 w-screen h-screen pointer-events-none" style={{ opacity: 0.03, zIndex: 0 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <polyline points="0,50% 5,50% 10,50% 15,48% 20,42% 25,35% 30,48% 35,50% 40,50% 45,50% 50,45% 55,30% 60,15% 65,30% 70,45% 75,50% 80,50% 85,50% 90,48% 95,42% 100,50%" fill="none" stroke="url(#ecgGrad)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const MOCK_LEADS = [
  { id: "L-001", name: "Sarah Johnson", company: "TechCorp Solutions", status: "contacted", lastCall: "2024-01-22", sentiment: "positive", conversions: 3 },
  { id: "L-002", name: "Michael Chen", company: "Accel Ventures", status: "meeting_scheduled", lastCall: "2024-01-21", sentiment: "positive", conversions: 2 },
  { id: "L-003", name: "Emma Davis", company: "Azure IT", status: "proposal_sent", lastCall: "2024-01-20", sentiment: "neutral", conversions: 1 },
  { id: "L-004", name: "Robert Wilson", company: "CloudFirst AI", status: "negotiating", lastCall: "2024-01-19", sentiment: "positive", conversions: 4 },
  { id: "L-005", name: "Lisa Anderson", company: "DataFlow Corp", status: "contacted", lastCall: "2024-01-18", sentiment: "neutral", conversions: 1 },
];

const MOCK_CONVERSATIONS = [
  {
    id: "C-001",
    leadId: "L-001",
    leadName: "Sarah Johnson",
    date: "2024-01-22",
    duration: 45,
    sentiment: "positive",
    transcript: "Discussion about Q2 roadmap, budget approval, timeline",
    keyPoints: ["Budget approved for Q2", "Demo scheduled for Feb 5", "Need integration documentation"],
    actionItems: [{ task: "Send technical documentation", dueDate: "2024-01-25", assignee: "TechCorp Solutions" }],
  },
  {
    id: "C-002",
    leadId: "L-002",
    leadName: "Michael Chen",
    date: "2024-01-21",
    duration: 60,
    sentiment: "positive",
    transcript: "Contract review, pricing negotiation, deployment timeline",
    keyPoints: ["Agreed on 15% discount", "Deployment in 2 weeks", "Need compliance check"],
    actionItems: [{ task: "Send compliance documentation", dueDate: "2024-01-24", assignee: "Legal Team" }],
  },
  {
    id: "C-003",
    leadId: "L-003",
    leadName: "Emma Davis",
    date: "2024-01-20",
    duration: 30,
    sentiment: "neutral",
    transcript: "Initial discovery call, requirements gathering, pain points",
    keyPoints: ["Need enterprise support", "Budget constraints", "Timeline: Q3 implementation"],
    actionItems: [{ task: "Prepare custom proposal", dueDate: "2024-01-28", assignee: "Sales Team" }],
  },
];

function CRMIntegrationApp() {
  const [view, setView] = useState("dashboard");
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedLead, setSelectedLead] = useState(null);
  const [query, setQuery] = useState("");
  const [crmStatus, setCrmStatus] = useState("synced");

  const conversationStats = useMemo(() => {
    const positive = conversations.filter(c => c.sentiment === "positive").length;
    const neutral = conversations.filter(c => c.sentiment === "neutral").length;
    const negative = conversations.filter(c => c.sentiment === "negative").length;
    const avgDuration = conversations.length ? Math.round(conversations.reduce((sum, c) => sum + c.duration, 0) / conversations.length) : 0;
    return { positive, neutral, negative, avgDuration, total: conversations.length };
  }, [conversations]);

  const leadStatus = useMemo(() => {
    const map = {};
    leads.forEach(l => { map[l.status] = (map[l.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status: status.replace(/_/g, " ").toUpperCase(), count }));
  }, [leads]);

  const sentimentData = useMemo(() => [
    { name: "Positive", value: conversationStats.positive, color: "#10B981" },
    { name: "Neutral", value: conversationStats.neutral, color: "#6B7280" },
    { name: "Negative", value: conversationStats.negative, color: "#EF4444" },
  ], [conversationStats]);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", label: "Lead Management", icon: Users },
    { key: "conversations", label: "Conversations", icon: MessageSquare },
    { key: "actions", label: "Action Items", icon: CheckCircle },
    { key: "crm-sync", label: "CRM Sync Status", icon: Zap },
  ];

  return (
    <div style={{ background: "linear-gradient(135deg, #0A0E27 0%, #151B3E 50%, #0F1229 100%)", color: "#F0F4FF", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <FontLoader />
      <ECGPulseBackground />

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: "240px", background: "linear-gradient(180deg, #0F1629 0%, #1A1F4B 50%, #2D1B69 100%)", boxShadow: "2px 0 20px rgba(124, 92, 255, 0.15)", padding: "24px 16px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #00D9FF, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#0A0E27" />
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 600 }}>CRM Hub</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <button key={item.key} onClick={() => setView(item.key)} style={{
                  background: active ? "linear-gradient(90deg, #00D9FF, #8B5CF6)" : "transparent",
                  color: active ? "#0A0E27" : "#C7C6EA",
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? "0 0 20px rgba(139,92,255,0.6)" : "none",
                  border: active ? "1px solid rgba(0, 217, 255, 0.3)" : "none",
                  padding: "12px 12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}>
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button style={{
            background: "linear-gradient(90deg, #00D9FF, #8B5CF6)",
            color: "#0A0E27",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            width: "100%"
          }}>
            Sync CRM Now
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {/* Header */}
          <div style={{ padding: "20px 32px", borderBottom: "1px solid #2A3F5F", background: "#0F1229", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "400px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #2A3F5F", background: "rgba(31, 40, 71, 0.5)" }}>
              <Search size={14} color="#7A82A0" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search leads..." style={{ background: "transparent", outline: "none", flex: 1, color: "#F0F4FF", fontSize: "14px", border: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px" }}>
                <Bell size={18} color="#E8ECFF" />
              </button>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px" }}>
                <Settings size={18} color="#E8ECFF" />
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: "32px" }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.9rem", fontWeight: 600, marginBottom: "24px" }}>
              {view === "dashboard" && "CRM Overview"}
              {view === "leads" && "Lead Management"}
              {view === "conversations" && "Conversation Intelligence"}
              {view === "actions" && "Action Items"}
              {view === "crm-sync" && "CRM Sync Status"}
            </h1>

            {view === "dashboard" && <DashboardView stats={conversationStats} leadStatus={leadStatus} sentimentData={sentimentData} />}
            {view === "leads" && <LeadsView leads={leads} onSelect={setSelectedLead} />}
            {view === "conversations" && <ConversationsView conversations={conversations} />}
            {view === "actions" && <ActionItemsView conversations={conversations} />}
            {view === "crm-sync" && <CRMSyncView crmStatus={crmStatus} />}
          </div>
        </main>
      </div>

      {selectedLead && <LeadModal lead={selectedLead} conversations={conversations.filter(c => c.leadId === selectedLead.id)} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}

function DashboardView({ stats, leadStatus, sentimentData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <KPICard label="Total Conversations" value={stats.total} color="#7C5CFF" />
        <KPICard label="Positive Sentiment" value={stats.positive} color="#10B981" />
        <KPICard label="Avg Duration" value={`${stats.avgDuration}m`} color="#00D9FF" />
        <KPICard label="Leads Managed" value="5" color="#F59E0B" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <ChartCard title="Lead Status Distribution">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {leadStatus.map(item => (
              <div key={item.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <span style={{ fontSize: "14px", color: "#A0A9C9" }}>{item.status}</span>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#F0F4FF" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Conversation Sentiment">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={80}>
                {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#1F2847", border: "1px solid #2A3F5F", color: "#F0F4FF" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function LeadsView({ leads, onSelect }) {
  return (
    <div style={{ borderRadius: "12px", border: "1px solid rgba(0, 217, 255, 0.2)", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.6))", overflow: "hidden" }}>
      <table style={{ width: "100%", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "linear-gradient(90deg, rgba(42, 31, 75, 0.8), rgba(31, 58, 71, 0.8))" }}>
            {["Lead Name", "Company", "Status", "Last Call", "Sentiment", ""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "16px", color: "#7A82A0", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} onClick={() => onSelect(lead)} style={{ borderTop: "1px solid #253345", cursor: "pointer", transition: "all 0.3s" }}>
              <td style={{ padding: "16px", color: "#F0F4FF", fontWeight: 500 }}>{lead.name}</td>
              <td style={{ padding: "16px", color: "#F0F4FF" }}>{lead.company}</td>
              <td style={{ padding: "16px" }}><StatusBadge status={lead.status} /></td>
              <td style={{ padding: "16px", color: "#A0A9C9", fontFamily: "'IBM Plex Mono', monospace" }}>{lead.lastCall}</td>
              <td style={{ padding: "16px" }}><SentimentBadge sentiment={lead.sentiment} /></td>
              <td style={{ padding: "16px" }}><ChevronRight size={16} color="#7A82A0" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConversationsView({ conversations }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {conversations.map(conv => (
        <div key={conv.id} style={{ borderRadius: "12px", padding: "16px", border: "1px solid rgba(0, 217, 255, 0.15)", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.5))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#F0F4FF", marginBottom: "4px" }}>{conv.leadName}</h3>
              <p style={{ fontSize: "13px", color: "#7A82A0" }}>{conv.date} • {conv.duration} min call</p>
            </div>
            <SentimentBadge sentiment={conv.sentiment} />
          </div>
          <p style={{ fontSize: "14px", color: "#A0A9C9", marginBottom: "12px" }}>{conv.transcript}</p>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#00D9FF", marginBottom: "8px" }}>KEY DISCUSSION POINTS:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {conv.keyPoints.map((pt, i) => (
                <span key={i} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", background: "rgba(42, 31, 75, 0.8)", color: "#00D9FF" }}>✓ {pt}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionItemsView({ conversations }) {
  const allActions = conversations.flatMap(c => c.actionItems.map(a => ({ ...a, conversationId: c.id, leadName: c.leadName })));
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {allActions.map((action, i) => (
        <div key={i} style={{ borderRadius: "12px", padding: "16px", border: "1px solid rgba(0, 217, 255, 0.15)", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.5))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", marginBottom: "4px" }}>{action.task}</p>
            <p style={{ fontSize: "13px", color: "#7A82A0" }}>{action.assignee}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "13px", color: "#A0A9C9", marginBottom: "4px" }}>Due: {action.dueDate}</p>
            <button style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", background: "#10B981", color: "#FFF", border: "none", cursor: "pointer" }}>Complete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CRMSyncView({ crmStatus }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      <ChartCard title="Connected CRM Platforms">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { name: "Salesforce", status: "connected", lastSync: "2 min ago" },
            { name: "HubSpot", status: "connected", lastSync: "5 min ago" },
            { name: "Pipedrive", status: "syncing", lastSync: "Now" },
          ].map(crm => (
            <div key={crm.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "8px", background: "rgba(42, 31, 75, 0.5)" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF" }}>{crm.name}</p>
                <p style={{ fontSize: "12px", color: "#7A82A0" }}>{crm.lastSync}</p>
              </div>
              <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "6px", background: crm.status === "connected" ? "#10B981" : "#F59E0B", color: "#FFF" }}>
                {crm.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Sync Status & Logs">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <p style={{ color: "#10B981" }}>✓ Leads synced: 5/5 (100%)</p>
          <p style={{ color: "#10B981" }}>✓ Conversations synced: 3/3 (100%)</p>
          <p style={{ color: "#10B981" }}>✓ Action items synced: 3/3 (100%)</p>
          <p style={{ color: "#7A82A0" }}>Last full sync: 2024-01-22 08:45:00</p>
          <p style={{ color: "#7A82A0" }}>Next auto-sync: In 5 minutes</p>
        </div>
      </ChartCard>
    </div>
  );
}

function LeadModal({ lead, conversations, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 30, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.3)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "440px", height: "100%", overflowY: "auto", background: "#0F1229", boxShadow: "0 0 40px rgba(139, 92, 246, 0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "24px", borderBottom: "1px solid #2A3F5F" }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 600, color: "#F0F4FF" }}>{lead.name}</h2>
            <p style={{ fontSize: "13px", color: "#7A82A0" }}>{lead.company}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
            <X size={18} color="#F0F4FF" />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <Section title="Lead Status">
            <InfoRow label="Current Status" value={<StatusBadge status={lead.status} />} />
            <InfoRow label="Sentiment" value={<SentimentBadge sentiment={lead.sentiment} />} />
            <InfoRow label="Conversations" value={conversations.length} />
          </Section>

          <Section title="Recent Conversations">
            {conversations.map(conv => (
              <div key={conv.id} style={{ padding: "12px", borderRadius: "8px", background: "rgba(42, 31, 75, 0.5)", marginBottom: "8px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF", marginBottom: "4px" }}>{conv.date}</p>
                <p style={{ fontSize: "12px", color: "#A0A9C9" }}>{conv.transcript}</p>
              </div>
            ))}
          </Section>

          <Section title="Key Discussion Points">
            {conversations.flatMap(c => c.keyPoints).map((pt, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#A0A9C9", padding: "8px 0" }}>✓ {pt}</div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, color }) {
  return (
    <div style={{ borderRadius: "12px", padding: "20px", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.4))", border: "1px solid rgba(0, 217, 255, 0.15)", boxShadow: "0 8px 24px rgba(139, 92, 246, 0.1)" }}>
      <p style={{ fontSize: "12px", color: "#7A82A0", fontWeight: 600, marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "32px", fontWeight: 600, color: color, fontFamily: "'Fraunces', serif" }}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ borderRadius: "12px", padding: "20px", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.9), rgba(42, 31, 75, 0.6))", border: "1px solid rgba(0, 217, 255, 0.15)", boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15)" }}>
      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#E8ECFF", marginBottom: "16px" }}>{title}</h3>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#00D9FF", marginBottom: "12px" }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", padding: "8px 0", borderBottom: "1px solid #2A3F5F", color: "#F0F4FF" }}>
      <span style={{ color: "#7A82A0" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusMap = {
    contacted: { bg: "#E0F2FE", fg: "#0284C7" },
    meeting_scheduled: { bg: "#FEF3C7", fg: "#B45309" },
    proposal_sent: { bg: "#D1FAE5", fg: "#047857" },
    negotiating: { bg: "#F0EDFF", fg: "#6D3EF5" },
  };
  const s = statusMap[status] || statusMap.contacted;
  return <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", background: s.bg, color: s.fg, fontWeight: 500 }}>{status.replace(/_/g, " ").toUpperCase()}</span>;
}

function SentimentBadge({ sentiment }) {
  const sentimentMap = {
    positive: { bg: "#D1FAE5", fg: "#047857" },
    neutral: { bg: "#E5E7EB", fg: "#4B5563" },
    negative: { bg: "#FEE2E2", fg: "#991B1B" },
  };
  const s = sentimentMap[sentiment] || sentimentMap.neutral;
  return <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px", background: s.bg, color: s.fg, fontWeight: 500 }}>{sentiment.toUpperCase()}</span>;
}

export default CRMIntegrationApp;

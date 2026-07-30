import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, BarChart3, Search, X, Upload, Mail, Activity,
  Stethoscope, Clock, ShieldCheck, AlertTriangle, ChevronRight, FileText,
  Bell, Phone, CalendarClock, Settings, UserCircle, ChevronDown, Copy, Check,
  Sparkles, CalendarPlus, Headphones, Mic, Volume2, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import Papa from "papaparse";

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

const FIRST_NAMES = ["Rahul","Priya","Arjun","Sneha","Vikram","Ananya","Karthik","Divya","Rohan","Meera"];
const LAST_NAMES = ["Kumar","Sharma","Reddy","Iyer","Nair","Rao","Gupta","Menon","Verma","Pillai"];
const HOSPITALS = ["Sunrise Multispeciality","Fortress Care","Greenfield Medical","St. Mercy","Horizon Health"];
const DOCTORS = ["Dr. Aarav Menon","Dr. Kavitha Rao","Dr. Sameer Khan","Dr. Lavanya Iyer","Dr. Rohit Verma"];
const CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "Cancer", "Obesity"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE = ["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicare", "Star Health"];
const ADMISSION_TYPES = ["Emergency", "Elective", "Urgent"];
const TEST_RESULTS = ["Normal", "Abnormal", "Inconclusive"];
const MEDICATIONS = ["Aspirin", "Ibuprofen", "Penicillin", "Paracetamol", "Lipitor", "Metformin"];
const SOURCES = ["Hospital Website", "Referral", "Insurance Portal", "Walk-in", "Telehealth", "Camp"];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }

function randDate(rand, startDaysAgo, endDaysAgo) {
  const days = Math.floor(rand() * (startDaysAgo - endDaysAgo)) + endDaysAgo;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function fmtDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return "—";
  return d.toISOString().slice(0, 10);
}

function generatePatients(count = 140, seed = 42) {
  const rand = seededRandom(seed);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const admission = randDate(rand, 260, 1);
    const stay = Math.floor(rand() * 9) + 1;
    const discharge = new Date(admission);
    discharge.setDate(discharge.getDate() + stay);
    const age = Math.floor(rand() * 70) + 12;
    rows.push({
      id: `PT-${1000 + i}`, Name: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`, Age: age,
      Gender: rand() > 0.5 ? "Male" : "Female", "Blood Type": pick(rand, BLOOD_TYPES),
      "Medical Condition": pick(rand, CONDITIONS), "Date of Admission": fmtDate(admission),
      Doctor: pick(rand, DOCTORS), Hospital: pick(rand, HOSPITALS),
      "Insurance Provider": pick(rand, INSURANCE), "Billing Amount": Math.round((rand() * 45000 + 4000) / 10) * 10,
      "Room Number": Math.floor(rand() * 400) + 100, "Admission Type": pick(rand, ADMISSION_TYPES),
      "Discharge Date": rand() > 0.15 ? fmtDate(discharge) : "",
      Medication: pick(rand, MEDICATIONS), "Test Results": pick(rand, TEST_RESULTS),
      Source: pick(rand, SOURCES), Phone: `+91-9${Math.floor(rand() * 900000000 + 100000000)}`,
    });
  }
  return rows;
}

const CONDITION_WEIGHT = { Cancer: 25, Hypertension: 18, Diabetes: 15, Arthritis: 10, Obesity: 10, Asthma: 12 };
const ADMISSION_WEIGHT = { Emergency: 30, Urgent: 20, Elective: 10 };
const TEST_WEIGHT = { Abnormal: 30, Inconclusive: 16, Normal: 6 };

function daysSince(dateStr) { if (!dateStr) return 999; const d = new Date(dateStr); return Math.floor((Date.now() - d.getTime()) / 86400000); }

function scorePatient(p) {
  let score = 0;
  score += ADMISSION_WEIGHT[p["Admission Type"]] || 10;
  score += TEST_WEIGHT[p["Test Results"]] || 10;
  score += CONDITION_WEIGHT[p["Medical Condition"]] || 10;
  score += p.Age >= 65 ? 15 : p.Age >= 40 ? 9 : 4;
  const recency = daysSince(p["Date of Admission"]);
  const noDischarge = !p["Discharge Date"];
  score += noDischarge ? (recency < 14 ? 12 : 6) : 0;
  return Math.min(100, Math.round(score));
}

function priorityLabel(score) {
  if (score >= 81) return { label: "Critical Priority", tone: "critical" };
  if (score >= 61) return { label: "High Priority", tone: "high" };
  if (score >= 41) return { label: "Moderate Priority", tone: "moderate" };
  return { label: "Routine", tone: "routine" };
}

const TONE_STYLES = {
  critical: { bg: "#FFE4E6", fg: "#BE123C", dot: "#E11D48" },
  high: { bg: "#FEF3C7", fg: "#B45309", dot: "#F59E0B" },
  moderate: { bg: "#D1FAE5", fg: "#047857", dot: "#10B981" },
  routine: { bg: "#E5E7EB", fg: "#4B4A66", dot: "#8B8AA6" },
};

function recommendationsFor(p, score) {
  const recs = [];
  const noDischarge = !p["Discharge Date"];
  if (p["Admission Type"] === "Emergency" && noDischarge) recs.push(`Assign care coordinator within the hour.`);
  else if (p["Admission Type"] === "Urgent") recs.push("Confirm bed allocation and notify physician.");
  else recs.push("Schedule follow-up call within 3 business days.");
  if (p["Test Results"] === "Abnormal") recs.push(`Flag ${p["Test Results"].toLowerCase()} results for same-day review.`);
  else if (p["Test Results"] === "Inconclusive") recs.push("Recommend repeat diagnostic panel.");
  if (p["Medical Condition"] === "Cancer" || p["Medical Condition"] === "Hypertension") recs.push(`Highlight ${p["Insurance Provider"]} coverage.`);
  else recs.push(`Share personalized care plan.`);
  if (noDischarge) recs.push("Send discharge-readiness check-in.");
  else recs.push("Schedule 2-week post-discharge wellness call.");
  return recs.slice(0, 4);
}

function outreachEmail(p) {
  const first = p.Name.split(" ")[0];
  return {
    subject: `Following up on your care at ${p.Hospital}`,
    body: `Dear ${p.Name},\n\nI hope you're doing well. I'm reaching out regarding your recent visit to ${p.Hospital} under ${p.Doctor} for ${p["Medical Condition"].toLowerCase()} management.\n\nBased on your test results (${p["Test Results"]}), we'd like to schedule a follow-up.\n\nBest regards,\nPatient Care Team`,
  };
}

function conversionProbability(p, score) {
  let p2 = score;
  if (p["Test Results"] === "Abnormal") p2 += 4;
  if (p["Admission Type"] === "Emergency") p2 += 3;
  if (!p["Discharge Date"]) p2 += 2;
  return Math.max(4, Math.min(97, Math.round(p2 - 3)));
}

function followUpTiming(score) {
  if (score >= 90) return "Contact within 24 hours — highest response before 11 AM.";
  if (score >= 70) return "Follow up within 48 hours of admission.";
  if (score >= 50) return "Follow up within 3–5 business days.";
  return "Weekly routine check-in is sufficient.";
}

function channelMix(score) {
  if (score >= 90) return ["Phone Call", "SMS Reminder", "In-Person Visit"];
  if (score >= 70) return ["Phone Call", "SMS Reminder"];
  if (score >= 50) return ["SMS Reminder", "Email"];
  return ["Email Only"];
}

const CONTENT_STRATEGY = {
  Cancer: "Share long-term care support resources.",
  Hypertension: "Focus on medication adherence guidance.",
  Diabetes: "Provide dietary planning resources.",
  Asthma: "Share trigger-avoidance guidance.",
  Arthritis: "Offer physical therapy referral.",
  Obesity: "Share nutrition counseling options.",
};

function contentStrategy(p) { return CONTENT_STRATEGY[p["Medical Condition"]] || "Share a personalized care plan."; }

function engagementTimeline(p) {
  const events = [];
  events.push({ label: "Lead registered", detail: `via ${p.Source}`, date: p["Date of Admission"] });
  events.push({ label: "Admitted", detail: `${p["Admission Type"]} admission`, date: p["Date of Admission"] });
  events.push({ label: "Diagnostic test", detail: `Result: ${p["Test Results"]}`, date: p["Date of Admission"] });
  if (p["Discharge Date"]) events.push({ label: "Discharged", detail: "Care episode closed", date: p["Discharge Date"] });
  else events.push({ label: "Discharge pending", detail: "Still under observation", date: "" });
  return events;
}

function callScriptFor(p) {
  const first = p.Name.split(" ")[0];
  const noDischarge = !p["Discharge Date"];
  return {
    opening: `Hi, may I speak with ${first}? Calling from ${p.Hospital}.`,
    talkingPoints: [
      `Confirm how ${first} has been feeling.`,
      `Reference test results: ${p["Test Results"]}.`,
      `Mention ${p["Insurance Provider"]} coverage.`,
      noDischarge ? `Ask about expected discharge timeline.` : `Check recovery since discharge.`,
    ],
    objection: `If hesitant: offer a shorter call at a better time.`,
    closing: noDischarge ? "Confirm next check-in date." : "Schedule 2-week wellness follow-up.",
  };
}

function suggestedAppointment(p, score) {
  const noDischarge = !p["Discharge Date"];
  const base = p["Discharge Date"] ? new Date(p["Discharge Date"]) : new Date();
  const offsetDays = score >= 81 ? 1 : score >= 61 ? 3 : score >= 41 ? 7 : 14;
  const date = new Date(base);
  date.setDate(date.getDate() + offsetDays);
  const type = noDischarge ? "In-Patient Review" : score >= 61 ? "Priority Follow-up" : "Routine Wellness";
  return { date: fmtDate(date), type, durationMins: type === "In-Patient Review" ? 30 : 15 };
}

function PulseDivider() {
  return <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="w-full h-5" aria-hidden="true">
    <polyline points="0,12 130,12 150,3 165,21 180,12 400,12" fill="none" stroke="#00D9FF" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.55" />
  </svg>;
}

function PriorityBadge({ score }) {
  const p = priorityLabel(score);
  const s = TONE_STYLES[p.tone];
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.fg }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
    {p.label} · {score}
  </span>;
}

const KPI_COLORS = {
  violet: { bg: "#F0EDFF", fg: "#6D3EF5" },
  teal: { bg: "#E3FBF6", fg: "#0EA394" },
  amber: { bg: "#FEF3C7", fg: "#B45309" },
  rose: { bg: "#FFE4E6", fg: "#E11D48" },
  sky: { bg: "#E0F2FE", fg: "#0284C7" },
  emerald: { bg: "#D1FAE5", fg: "#047857" },
};

function KpiCard({ label, value, sub, icon: Icon, tone = "teal" }) {
  const c = KPI_COLORS[tone];
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.4))',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide" style={{ color: "#7A82A0", fontFamily: "'IBM Plex Mono', monospace" }}>
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ background: c.bg }}>
            <Icon size={14} color={c.fg} />
          </div>
        )}
      </div>
      <span className="text-3xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#F0F4FF" }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: "#7A82A0" }}>{sub}</span>}
    </div>
  );
}

export default function VitalLeadApp() {
  const [patients, setPatients] = useState(() => generatePatients(140));
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const fileRef = useRef(null);

  const enriched = useMemo(
    () => patients.map((p) => {
      const score = scorePatient(p);
      return { ...p, score, priority: priorityLabel(score) };
    }),
    [patients]
  );

  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      const matchesQuery = query.trim() === "" || p.Name.toLowerCase().includes(query.toLowerCase()) || p.Hospital.toLowerCase().includes(query.toLowerCase());
      const matchesCondition = conditionFilter === "All" || p["Medical Condition"] === conditionFilter;
      const matchesPriority = priorityFilter === "All" || p.priority.label === priorityFilter;
      return matchesQuery && matchesCondition && matchesPriority;
    });
  }, [enriched, query, conditionFilter, priorityFilter]);

  const kpis = useMemo(() => {
    const total = enriched.length;
    const critical = enriched.filter((p) => p.priority.tone === "critical").length;
    const activeAdmissions = enriched.filter((p) => !p["Discharge Date"]).length;
    const qualified = enriched.filter((p) => p.priority.tone === "critical" || p.priority.tone === "high").length;
    const discharged = enriched.filter((p) => p["Discharge Date"]).length;
    const conversionRate = total ? Math.round((discharged / total) * 1000) / 10 : 0;
    const emailsGenerated = enriched.filter((p) => p.priority.tone === "critical" || p.priority.tone === "high").length;
    const followUpsToday = enriched.filter((p) => !p["Discharge Date"] && daysSince(p["Date of Admission"]) < 14).length;
    const totalBilling = enriched.reduce((sum, p) => sum + Number(p["Billing Amount"] || 0), 0);
    const avgBilling = totalBilling / (total || 1);
    return { total, critical, activeAdmissions, qualified, conversionRate, emailsGenerated, followUpsToday, totalBilling, avgBilling };
  }, [enriched]);

  const billingTrend = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      const d = p["Date of Admission"];
      if (!d) return;
      const month = d.slice(0, 7);
      map[month] = (map[month] || 0) + Number(p["Billing Amount"] || 0);
    });
    return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1)).slice(-9).map(([month, value]) => ({ month, value: Math.round(value) }));
  }, [enriched]);

  const conditionData = useMemo(() => {
    const map = {};
    enriched.forEach((p) => { map[p["Medical Condition"]] = (map[p["Medical Condition"]] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const admissionTypeData = useMemo(() => {
    const map = {};
    enriched.forEach((p) => { map[p["Admission Type"]] = (map[p["Admission Type"]] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const priorityData = useMemo(() => {
    const order = ["Critical Priority", "High Priority", "Moderate Priority", "Routine"];
    const map = {};
    enriched.forEach((p) => { map[p.priority.label] = (map[p.priority.label] || 0) + 1; });
    return order.map((name) => ({ name, value: map[name] || 0 }));
  }, [enriched]);

  const PIE_COLORS = ["#7C5CFF", "#16E0BD", "#F59E0B", "#E11D48", "#0284C7"];

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter((r) => r.Name).map((r, i) => ({
          id: `PT-${2000 + i}`, Name: r.Name, Age: Number(r.Age) || 0, Gender: r.Gender || "Unknown",
          "Blood Type": r["Blood Type"] || "—", "Medical Condition": r["Medical Condition"] || "Unspecified",
          "Date of Admission": r["Date of Admission"] || "", Doctor: r.Doctor || "Unassigned",
          Hospital: r.Hospital || "Unknown Facility", "Insurance Provider": r["Insurance Provider"] || "Self-pay",
          "Billing Amount": Number(r["Billing Amount"]) || 0, "Room Number": r["Room Number"] || "—",
          "Admission Type": r["Admission Type"] || "Elective", "Discharge Date": r["Discharge Date"] || "",
          Medication: r.Medication || "—", "Test Results": r["Test Results"] || "Normal",
          Source: "Imported CSV", Phone: r.Phone || "—",
        }));
        if (rows.length) { setPatients(rows); setImportMsg(`Imported ${rows.length} patient records.`); }
        else { setImportMsg("No valid rows found."); }
        setTimeout(() => setImportMsg(""), 4000);
      },
    });
    e.target.value = "";
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "patients", label: "Patient Leads", icon: Users },
    { key: "email-generator", label: "AI Email Generator", icon: Mail },
    { key: "call-script", label: "Call Script Generator", icon: Phone },
    { key: "followups", label: "Follow-up Manager", icon: Clock },
    { key: "appointments", label: "Appointment Assistant", icon: CalendarClock },
    { key: "call-intelligence", label: "Call Intelligence", icon: Headphones },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const notifications = useMemo(() => {
    const critical = enriched.filter((p) => p.priority.tone === "critical").length;
    const pendingDischarge = enriched.filter((p) => !p["Discharge Date"]).length;
    return [
      { text: `${critical} patients flagged Critical Priority`, tone: "critical" },
      { text: `${pendingDischarge} patients still admitted`, tone: "moderate" },
      { text: "CSV import ready", tone: "routine" },
    ];
  }, [enriched]);

  return (
    <div className="min-h-screen w-full flex" style={{ background: "linear-gradient(135deg, #0A0E27 0%, #151B3E 50%, #0F1229 100%)", color: "#F0F4FF", fontFamily: "'Inter', sans-serif" }}>
      <FontLoader />
      <aside className="w-60 shrink-0 flex flex-col py-6 px-4" style={{ background: "linear-gradient(180deg, #0F1629 0%, #1A1F4B 50%, #2D1B69 100%)", boxShadow: "2px 0 20px rgba(124, 92, 255, 0.15)" }}>
        <div className="flex items-center gap-2 px-1 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D9FF, #8B5CF6)" }}>
            <Activity size={17} color="#0A0E27" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 600, color: "#F0F4FF" }}>VitalLead</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button key={item.key} onClick={() => setView(item.key)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all"
                style={{
                  background: active ? "linear-gradient(90deg, #00D9FF, #8B5CF6)" : "transparent",
                  color: active ? "#0A0E27" : "#C7C6EA",
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? "0 0 20px rgba(139,92,255,0.6), inset 0 0 20px rgba(139,92,255,0.2)" : "none",
                  border: active ? "1px solid rgba(0, 217, 255, 0.3)" : "none",
                }}>
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto pt-6">
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ color: "#0A0E27", background: "linear-gradient(90deg, #00D9FF, #8B5CF6)" }}>
            <Upload size={15} />
            Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          {importMsg && <p className="text-xs mt-2 text-center" style={{ color: "#5EEAD4" }}>✓ {importMsg}</p>}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-3 border-b" style={{ borderColor: "#2A3F5F", background: "#0F1229" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-1 max-w-md" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)" }}>
            <Search size={14} color="#7A82A0" />
            <input value={headerSearch} onChange={(e) => setHeaderSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && headerSearch.trim()) { setQuery(headerSearch); setView("patients"); } }} placeholder="Search patients..." className="bg-transparent outline-none text-sm w-full" style={{ color: "#F0F4FF" }} />
          </div>
          <div className="flex-1" />
          <button onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }} className="relative p-2 rounded-lg hover:bg-black/10">
            <Bell size={17} color="#E8ECFF" />
            {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: "#E11D48" }}>{notifications.length}</span>}
          </button>
          {notifOpen && (
            <div className="absolute right-20 mt-32 w-72 border rounded-xl shadow-lg bg-opacity-90" style={{ borderColor: "#2A3F5F", background: "rgba(15, 18, 41, 0.95)" }}>
              {notifications.map((n, i) => (
                <div key={i} className="px-3 py-2 text-xs flex gap-2 items-start" style={{ color: "#F0F4FF" }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: TONE_STYLES[n.tone].dot }} />
                  {n.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <header className="px-8 pt-6 pb-4 border-b" style={{ borderColor: "#2A3F5F" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.9rem", fontWeight: 600, color: "#F0F4FF" }}>
            {view === "dashboard" && "Intake Overview"}
            {view === "patients" && "Patient Leads"}
            {view === "email-generator" && "AI Email Generator"}
            {view === "call-script" && "Call Script Generator"}
            {view === "followups" && "Follow-up Manager"}
            {view === "appointments" && "Appointment Assistant"}
            {view === "call-intelligence" && "Call Intelligence"}
            {view === "analytics" && "Care Analytics"}
          </h1>
          <PulseDivider />
        </header>

        <div className="px-8 py-6">
          {view === "dashboard" && <DashboardView kpis={kpis} billingTrend={billingTrend} conditionData={conditionData} admissionTypeData={admissionTypeData} priorityData={priorityData} pieColors={PIE_COLORS} enriched={enriched} />}
          {view === "patients" && <PatientsView filtered={filtered} query={query} setQuery={setQuery} conditionFilter={conditionFilter} setConditionFilter={setConditionFilter} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} onOpen={(p) => setSelected(p)} />}
          {view === "email-generator" && <EmailGeneratorView enriched={enriched} />}
          {view === "call-script" && <CallScriptView enriched={enriched} />}
          {view === "followups" && <FollowUpsView enriched={enriched} />}
          {view === "appointments" && <AppointmentsView enriched={enriched} />}
          {view === "call-intelligence" && <CallIntelligenceView calls={[]} analytics={{ totalCalls: 47, avgDuration: 11.2, sentimentBreakdown: { positive: 28, neutral: 15, negative: 4 }, dailyCalls: [{day:"Mon",calls:8},{day:"Tue",calls:11},{day:"Wed",calls:9},{day:"Thu",calls:6},{day:"Fri",calls:13}], topKeywords: ["discharge", "follow-up", "medication", "recovery", "management"] }} />}
          {view === "analytics" && <AnalyticsView enriched={enriched} pieColors={PIE_COLORS} />}
        </div>
      </main>

      {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DashboardView({ kpis, billingTrend, conditionData, admissionTypeData, priorityData, pieColors, enriched }) {
  const topPriority = [...enriched].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Patients" value={kpis.total} sub="+12.4% vs last month" icon={Users} tone="violet" />
        <KpiCard label="Active Leads" value={kpis.activeAdmissions} sub="Not yet discharged" icon={Activity} tone="sky" />
        <KpiCard label="Qualified" value={kpis.qualified} sub="Critical + High priority" icon={Sparkles} tone="amber" />
        <KpiCard label="Follow-ups Today" value={kpis.followUpsToday} sub="Admitted under 14 days" icon={Clock} tone="rose" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Emails Generated" value={kpis.emailsGenerated} sub="Outreach drafts ready" icon={Mail} tone="teal" />
        <KpiCard label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Discharged of total" icon={BarChart3} tone="emerald" />
        <KpiCard label="Total Billing" value={`₹${Math.round(kpis.totalBilling / 1000)}K`} sub="All patients" icon={ShieldCheck} tone="violet" />
        <KpiCard label="Avg. Billing" value={`₹${Math.round(kpis.avgBilling / 1000)}K`} sub="Per patient" icon={ShieldCheck} tone="sky" />
      </div>
      <ChartCard title="Billing Trend">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={billingTrend}>
            <defs><linearGradient id="billingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.35} /><stop offset="100%" stopColor="#16E0BD" stopOpacity={0.03} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#7A82A0" }} />
            <YAxis tick={{ fontSize: 10, fill: "#7A82A0" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#1F2847", border: "1px solid #2A3F5F", color: "#F0F4FF" }} />
            <Area type="monotone" dataKey="value" stroke="#7C5CFF" strokeWidth={2} fill="url(#billingFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl px-5 py-4 backdrop-blur-md transition-all duration-300 hover:shadow-2xl" style={{
      background: 'linear-gradient(135deg, rgba(31, 40, 71, 0.9), rgba(42, 31, 75, 0.6))',
      border: '1px solid rgba(0, 217, 255, 0.15)',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
    }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#E8ECFF" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function PatientsView({ filtered, query, setQuery, conditionFilter, setConditionFilter, priorityFilter, setPriorityFilter, onOpen }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 max-w-md" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)" }}>
          <Search size={15} color="#7A82A0" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-sm w-full" style={{ color: "#F0F4FF" }} />
        </div>
        <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)", color: "#F0F4FF" }}>
          <option>All</option>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)", color: "#F0F4FF" }}>
          <option>All</option>
          <option>Critical Priority</option>
          <option>High Priority</option>
          <option>Moderate Priority</option>
          <option>Routine</option>
        </select>
      </div>
      <div className="border rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-2xl" style={{
        borderColor: "rgba(0, 217, 255, 0.2)",
        background: 'linear-gradient(135deg, rgba(31, 40, 71, 0.8), rgba(42, 31, 75, 0.6))',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, rgba(42, 31, 75, 0.8), rgba(31, 58, 71, 0.8))' }}>
              {["Patient", "Condition", "Hospital", "Admission", "Test Result", "Priority", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: "#7A82A0" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => onOpen(p)} className="border-t cursor-pointer hover:bg-black/20" style={{ borderColor: "#253345" }}>
                <td className="px-4 py-3"><div className="flex flex-col"><span className="font-medium" style={{ color: "#F0F4FF" }}>{p.Name}</span><span className="text-xs" style={{ color: "#7A82A0", fontFamily: "'IBM Plex Mono', monospace" }}>{p.id}</span></div></td>
                <td className="px-4 py-3" style={{ color: "#F0F4FF" }}>{p["Medical Condition"]}</td>
                <td className="px-4 py-3" style={{ color: "#F0F4FF" }}>{p.Hospital}</td>
                <td className="px-4 py-3" style={{ color: "#F0F4FF" }}>{p["Admission Type"]}</td>
                <td className="px-4 py-3" style={{ color: "#F0F4FF" }}>{p["Test Results"]}</td>
                <td className="px-4 py-3"><PriorityBadge score={p.score} /></td>
                <td className="px-4 py-3"><ChevronRight size={15} color="#7A82A0" /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm" style={{ color: "#7A82A0" }}>
                  No patients match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UrgencyTag({ level }) {
  const tone = level === "High" ? { bg: "#3A1F1F", fg: "#FF6B7A" } : level === "Medium" ? { bg: "#3A2D15", fg: "#FFB84D" } : { bg: "#1A3A35", fg: "#4DD9C4" };
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tone.bg, color: tone.fg }}>{level}</span>;
}

function EmailGeneratorView({ enriched }) {
  const [patientId, setPatientId] = useState(enriched[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const patient = enriched.find((p) => p.id === patientId) || enriched[0];
  if (!patient) return null;
  const email = outreachEmail(patient);
  const score = scorePatient(patient);
  const prob = conversionProbability(patient, score);
  const timing = followUpTiming(score);
  const channels = channelMix(score);
  const strategy = contentStrategy(patient);
  const urgencyFor = (s) => (s >= 90 ? "High" : s >= 70 ? "Medium" : "Low");

  function copyEmail() {
    navigator.clipboard?.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full max-w-md px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)", color: "#F0F4FF" }}>
        {enriched.map((p) => (
          <option key={p.id} value={p.id}>
            {p.Name} — {p["Medical Condition"]}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-4 items-start">
        <ChartCard title="AI Email Generator">
          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "#7A82A0" }}>
            <Sparkles size={13} color="#00D9FF" />
            Generated from clinical profile
          </div>
          <div className="border rounded-lg p-3" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.3)" }}>
            <p className="font-medium text-xs mb-2" style={{ color: "#F0F4FF" }}>{email.subject}</p>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed" style={{ color: "#A0A9C9" }}>
              {email.body}
            </pre>
          </div>
          <button onClick={copyEmail} className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: "#00D9FF", color: "#00D9FF" }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy Email"}
          </button>
        </ChartCard>

        <ChartCard title="Lead Score">
          <div className="flex flex-col items-center py-3">
            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-2" style={{ background: `conic-gradient(#8B5CF6 ${score * 3.6}deg, rgba(31, 40, 71, 0.5) 0deg)` }}>
              <div className="w-[88px] h-[88px] rounded-full bg-opacity-20 flex items-center justify-center" style={{ background: "rgba(31, 40, 71, 0.8)" }}>
                <span className="text-2xl font-bold" style={{ color: "#F0F4FF", fontFamily: "'Fraunces', serif" }}>{score}</span>
              </div>
            </div>
            <PriorityBadge score={score} />
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#7A82A0" }}>Response Probability</span>
                <span className="font-semibold" style={{ color: "#F0F4FF" }}>{prob}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(31, 40, 71, 0.8)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${prob}%`, background: "linear-gradient(90deg, #00D9FF, #8B5CF6)" }} />
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Outreach Strategy">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "#F0F4FF" }}>Follow-up Timing</span>
                <UrgencyTag level={urgencyFor(score)} />
              </div>
              <p className="text-xs" style={{ color: "#A0A9C9" }}>{timing}</p>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "#2A3F5F" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "#F0F4FF" }}>Channel Mix</span>
                <UrgencyTag level={urgencyFor(score)} />
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {channels.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(42, 31, 75, 0.8)", color: "#00D9FF" }}>{c}</span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "#2A3F5F" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "#F0F4FF" }}>Content Strategy</span>
                <UrgencyTag level={urgencyFor(score)} />
              </div>
              <p className="text-xs" style={{ color: "#A0A9C9" }}>{strategy}</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function CallScriptView({ enriched }) {
  const [patientId, setPatientId] = useState(enriched[0]?.id || "");
  const patient = enriched.find((p) => p.id === patientId) || enriched[0];
  if (!patient) return null;
  const script = callScriptFor(patient);

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Select Patient">
        <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.5)" }}>
          {enriched.map((p) => (
            <option key={p.id} value={p.id}>
              {p.Name} — {p["Medical Condition"]}
            </option>
          ))}
        </select>
        <InfoRow label="Doctor" value={patient.Doctor} />
        <InfoRow label="Admission" value={patient["Admission Type"]} />
        <InfoRow label="Phone" value={patient.Phone} />
      </ChartCard>

      <div className="col-span-2">
        <ChartCard title="Call Script">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#00D9FF" }}>OPENING</p>
              <p className="text-sm" style={{ color: "#A0A9C9" }}>{script.opening}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#00D9FF" }}>TALKING POINTS</p>
              <ul className="flex flex-col gap-1.5">
                {script.talkingPoints.map((t, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "#A0A9C9" }}>
                    <span style={{ color: "#F59E0B" }}>●</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#00D9FF" }}>IF HESITANT</p>
              <p className="text-sm" style={{ color: "#A0A9C9" }}>{script.objection}</p>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#00D9FF" }}>CLOSING</p>
              <p className="text-sm" style={{ color: "#A0A9C9" }}>{script.closing}</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function FollowUpsView({ enriched }) {
  const [contacted, setContacted] = useState({});
  const dueList = useMemo(() => {
    return [...enriched].filter((p) => p.priority.tone === "critical" || p.priority.tone === "high").sort((a, b) => b.score - a.score);
  }, [enriched]);

  return (
    <ChartCard title={`Patients Needing Follow-up (${dueList.length})`}>
      <div className="flex flex-col divide-y" style={{ borderColor: "#2A3F5F" }}>
        {dueList.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-3 px-1">
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium" style={{ color: "#F0F4FF" }}>{p.Name}</span>
              <span className="text-xs" style={{ color: "#7A82A0" }}>
                {p["Medical Condition"]} · {daysSince(p["Date of Admission"]) < 3 ? "Due Today" : "Due This Week"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <PriorityBadge score={p.score} />
              <button onClick={() => setContacted((c) => ({ ...c, [p.id]: !c[p.id] }))} className="text-xs px-2.5 py-1 rounded-full border" style={{
                borderColor: contacted[p.id] ? "#10B981" : "#2A3F5F",
                color: contacted[p.id] ? "#4DD9C4" : "#7A82A0",
                background: contacted[p.id] ? "rgba(16, 185, 129, 0.1)" : "transparent",
              }}>
                {contacted[p.id] ? "Contacted ✓" : "Mark Contacted"}
              </button>
            </div>
          </div>
        ))}
        {dueList.length === 0 && (
          <p className="text-sm py-6 text-center" style={{ color: "#7A82A0" }}>
            No patients currently need follow-up.
          </p>
        )}
      </div>
    </ChartCard>
  );
}

function AppointmentsView({ enriched }) {
  const suggestions = useMemo(() => {
    return [...enriched].map((p) => ({ p, appt: suggestedAppointment(p, p.score) })).sort((a, b) => (a.appt.date > b.appt.date ? 1 : -1)).slice(0, 15);
  }, [enriched]);

  return (
    <ChartCard title="Suggested Appointments">
      <div className="border rounded-xl overflow-hidden" style={{ borderColor: "#2A3F5F" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(42, 31, 75, 0.8)' }}>
              {["Patient", "Type", "Suggested Date", "Duration", "Priority"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: "#7A82A0" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suggestions.map(({ p, appt }) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "#2A3F5F" }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: "#F0F4FF" }}>{p.Name}</td>
                <td className="px-4 py-2.5 flex items-center gap-1.5" style={{ color: "#F0F4FF" }}>
                  <CalendarPlus size={13} color="#00D9FF" />
                  {appt.type}
                </td>
                <td className="px-4 py-2.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#A0A9C9" }}>
                  {appt.date}
                </td>
                <td className="px-4 py-2.5" style={{ color: "#F0F4FF" }}>{appt.durationMins} min</td>
                <td className="px-4 py-2.5">
                  <PriorityBadge score={p.score} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function CallIntelligenceView({ calls, analytics }) {
  const [uploadMsg, setUploadMsg] = useState("");
  const [selectedCall, setSelectedCall] = useState(null);
  const fileRef = useRef(null);

  function handleCallUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadMsg(`Call "${file.name}" uploaded successfully.`);
      setTimeout(() => setUploadMsg(""), 3000);
    }
  }

  const sentimentColors = {
    positive: { bg: "#1A3A35", fg: "#4DD9C4", dot: "#10B981" },
    neutral: { bg: "#2D2D3D", fg: "#A0A9C9", dot: "#6B7280" },
    negative: { bg: "#3A1F1F", fg: "#FF6B7A", dot: "#EF4444" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-6 border" style={{ borderColor: "#2A3F5F", background: "linear-gradient(135deg, rgba(31, 40, 71, 0.9), rgba(26, 58, 53, 0.5))" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D9FF, #8B5CF6)" }}>
              <Mic size={20} color="#0A0E27" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "#F0F4FF" }}>
                Upload Call Recording
              </h3>
              <p className="text-xs" style={{ color: "#7A82A0" }}>
                MP3, WAV, or M4A format
              </p>
            </div>
          </div>
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: "linear-gradient(90deg, #00D9FF, #8B5CF6)", color: "#0A0E27" }}>
            <Upload size={14} />
            Browse File
          </button>
          <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a" onChange={handleCallUpload} className="hidden" />
        </div>
        {uploadMsg && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#1A3A35", color: "#4DD9C4" }}>
            ✓ {uploadMsg}
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 border" style={{ borderColor: "#2A3F5F", background: "linear-gradient(135deg, rgba(42, 31, 75, 0.8), rgba(31, 40, 71, 0.6))" }}>
          <div className="flex items-center gap-2 mb-2">
            <Headphones size={16} color="#8B5CF6" />
            <span className="text-xs font-medium" style={{ color: "#7A82A0" }}>
              TOTAL CALLS
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "#F0F4FF", fontFamily: "'Fraunces', serif" }}>
            {analytics.totalCalls}
          </span>
        </div>

        <div className="rounded-2xl p-4 border" style={{ borderColor: "#2A3F5F", background: "linear-gradient(135deg, rgba(31, 58, 71, 0.8), rgba(31, 40, 71, 0.6))" }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} color="#00D9FF" />
            <span className="text-xs font-medium" style={{ color: "#7A82A0" }}>
              AVG DURATION
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "#F0F4FF", fontFamily: "'Fraunces', serif" }}>
            {analytics.avgDuration}m
          </span>
        </div>

        <div className="rounded-2xl p-4 border" style={{ borderColor: "#2A3F5F", background: "linear-gradient(135deg, rgba(58, 45, 21, 0.8), rgba(31, 40, 71, 0.6))" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} color="#FFB84D" />
            <span className="text-xs font-medium" style={{ color: "#7A82A0" }}>
              POSITIVE CALLS
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "#F0F4FF", fontFamily: "'Fraunces', serif" }}>
            {analytics.sentimentBreakdown.positive}
          </span>
        </div>

        <div className="rounded-2xl p-4 border" style={{ borderColor: "#2A3F5F", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(31, 40, 71, 0.6))" }}>
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} color="#4DD9C4" />
            <span className="text-xs font-medium" style={{ color: "#7A82A0" }}>
              TRANSCRIBED
            </span>
          </div>
          <span className="text-2xl font-bold" style={{ color: "#F0F4FF", fontFamily: "'Fraunces', serif" }}>
            100%
          </span>
        </div>
      </div>

      <ChartCard title="Daily Call Volume">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.dailyCalls}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3F5F" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A82A0" }} />
            <YAxis tick={{ fontSize: 11, fill: "#7A82A0" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#1F2847", border: "1px solid #2A3F5F", color: "#F0F4FF" }} />
            <Bar dataKey="calls" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function AnalyticsView({ enriched, pieColors }) {
  const byTestResult = useMemo(() => {
    const map = {};
    enriched.forEach((p) => { map[p["Test Results"]] = (map[p["Test Results"]] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Test Result Outcomes">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={byTestResult} dataKey="value" nameKey="name" outerRadius={85} label>
              {byTestResult.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#1F2847", border: "1px solid #2A3F5F", color: "#F0F4FF" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Scoring Model">
        <ul className="text-sm flex flex-col gap-2" style={{ color: "#A0A9C9" }}>
          <li>• Admission type — Emergency 30 · Urgent 20 · Elective 10</li>
          <li>• Test result — Abnormal 30 · Inconclusive 16 · Normal 6</li>
          <li>• Condition severity — Cancer 25 · Hypertension 18 · Diabetes 15</li>
          <li>• Age factor — 65+ adds 15 · 40–64 adds 9 · under 40 adds 4</li>
        </ul>
        <p className="text-xs mt-3" style={{ color: "#7A82A0" }}>
          Scores mapped to Critical (81–100), High (61–80), Moderate (41–60), Routine (0–40).
        </p>
      </ChartCard>
    </div>
  );
}

function PatientDrawer({ patient, onClose }) {
  const score = scorePatient(patient);
  const recs = recommendationsFor(patient, score);
  const email = outreachEmail(patient);
  const timeline = engagementTimeline(patient);
  const prob = conversionProbability(patient, score);
  const timing = followUpTiming(score);
  const channels = channelMix(score);
  const strategy = contentStrategy(patient);

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[440px] max-w-full h-full overflow-y-auto shadow-xl" style={{ background: "#0F1229" }}>
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "#2A3F5F" }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 600, color: "#F0F4FF" }}>{patient.Name}</h2>
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#7A82A0" }}>
              {patient.id} · {patient.Age}y · {patient.Gender} · {patient["Blood Type"]}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/10">
            <X size={18} color="#F0F4FF" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <PriorityBadge score={score} />
            <span className="text-xs" style={{ color: "#7A82A0" }}>Source: {patient.Source}</span>
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(42, 31, 75, 0.5)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: "#7A82A0" }}>Response Probability</span>
              <span className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>{prob}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(31, 40, 71, 0.8)" }}>
              <div className="h-full rounded-full" style={{ width: `${prob}%`, background: "linear-gradient(90deg, #00D9FF, #8B5CF6)" }} />
            </div>
          </div>

          <Section icon={Stethoscope} title="Clinical Summary">
            <InfoRow label="Condition" value={patient["Medical Condition"]} />
            <InfoRow label="Admission Type" value={patient["Admission Type"]} />
            <InfoRow label="Doctor" value={patient.Doctor} />
            <InfoRow label="Hospital" value={patient.Hospital} />
            <InfoRow label="Medication" value={patient.Medication} />
            <InfoRow label="Test Result" value={patient["Test Results"]} />
          </Section>

          <Section icon={ShieldCheck} title="Coverage & Billing">
            <InfoRow label="Insurance" value={patient["Insurance Provider"]} />
            <InfoRow label="Billing Amount" value={`₹${Number(patient["Billing Amount"]).toLocaleString("en-IN")}`} />
            <InfoRow label="Admitted" value={patient["Date of Admission"] || "—"} />
            <InfoRow label="Discharged" value={patient["Discharge Date"] || "Not yet discharged"} />
          </Section>

          <Section icon={AlertTriangle} title="AI Recommendations">
            <ul className="flex flex-col gap-2">
              {recs.map((r, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: "#A0A9C9" }}>
                  <span style={{ color: "#F59E0B" }}>●</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={CalendarClock} title="Outreach Strategy">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#8B5CF6" }}>FOLLOW-UP TIMING</p>
                <p className="text-sm" style={{ color: "#A0A9C9" }}>{timing}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "#8B5CF6" }}>CHANNEL MIX</p>
                <div className="flex flex-wrap gap-1.5">
                  {channels.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(42, 31, 75, 0.8)", color: "#00D9FF", fontWeight: 500 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#8B5CF6" }}>CONTENT STRATEGY</p>
                <p className="text-sm" style={{ color: "#A0A9C9" }}>{strategy}</p>
              </div>
            </div>
          </Section>

          <Section icon={Clock} title="Engagement History">
            <div className="flex flex-col">
              {timeline.map((ev, i) => (
                <div key={i} className="flex gap-3 pb-3 relative">
                  {i !== timeline.length - 1 && (
                    <span className="absolute left-[5px] top-3 bottom-0 w-px" style={{ background: "#2A3F5F" }} />
                  )}
                  <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: "#00D9FF" }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: "#F0F4FF" }}>{ev.label}</span>
                    <span className="text-xs" style={{ color: "#7A82A0" }}>
                      {ev.detail} {ev.date && `· ${ev.date}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Mail} title="Automated Outreach Draft">
            <div className="border rounded-lg p-3 text-sm" style={{ borderColor: "#2A3F5F", background: "rgba(31, 40, 71, 0.3)" }}>
              <p className="font-medium mb-1" style={{ color: "#F0F4FF" }}>{email.subject}</p>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed" style={{ color: "#A0A9C9" }}>
                {email.body}
              </pre>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} color="#00D9FF" />
        <h3 className="text-sm font-semibold" style={{ color: "#F0F4FF" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b" style={{ borderColor: "#2A3F5F", color: "#F0F4FF" }}>
      <span style={{ color: "#7A82A0" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

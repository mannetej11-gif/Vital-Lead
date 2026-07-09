import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Search,
  X,
  Upload,
  Mail,
  Activity,
  Stethoscope,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Papa from "papaparse";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  Paper: #EFEDE3   Ink: #1F2E28   Teal: #1B6B63   Amber: #C97A2B     */
/*  Critical: #B3413A   Sage: #7C9473   Line: #DAD6C6                 */
/* ------------------------------------------------------------------ */

function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Synthetic dataset generator                                        */
/*  Column schema matches Kaggle "Healthcare Dataset" (prasad22) so a  */
/*  real exported CSV can be dropped straight in via Import CSV.       */
/* ------------------------------------------------------------------ */

const FIRST_NAMES = [
  "Rahul","Priya","Arjun","Sneha","Vikram","Ananya","Karthik","Divya","Rohan","Meera",
  "Aditya","Kavya","Suresh","Neha","Manoj","Pooja","Ravi","Shreya","Aakash","Isha",
  "Sanjay","Lakshmi","Vivek","Nisha","Deepak","Swathi","Harish","Anjali","Nikhil","Radha",
];
const LAST_NAMES = [
  "Kumar","Sharma","Reddy","Iyer","Nair","Rao","Gupta","Menon","Verma","Pillai",
  "Naidu","Chowdary","Patel","Joshi","Bose","Mehta","Krishnan","Desai","Kapoor","Rajan",
];
const HOSPITALS = [
  "Sunrise Multispeciality Hospital","Fortress Care Institute","Greenfield Medical Center",
  "St. Mercy General Hospital","Horizon Health Group","Lakeview Regional Hospital",
  "Meridian Wellness Center","Cedar Grove Hospital","Unity Healthcare Trust","Northstar Medical College",
];
const DOCTORS = [
  "Dr. Aarav Menon","Dr. Kavitha Rao","Dr. Sameer Khan","Dr. Lavanya Iyer","Dr. Rohit Verma",
  "Dr. Nandini Pillai","Dr. Farhan Ali","Dr. Shalini Nair","Dr. Vikas Malhotra","Dr. Preethi Suresh",
];
const CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "Cancer", "Obesity"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE = ["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicare", "Star Health"];
const ADMISSION_TYPES = ["Emergency", "Elective", "Urgent"];
const TEST_RESULTS = ["Normal", "Abnormal", "Inconclusive"];
const MEDICATIONS = ["Aspirin", "Ibuprofen", "Penicillin", "Paracetamol", "Lipitor", "Metformin"];
const SOURCES = ["Hospital Website", "Referral", "Insurance Portal", "Walk-in", "Telehealth Screening", "Camp/Outreach"];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

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
      id: `PT-${1000 + i}`,
      Name: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      Age: age,
      Gender: rand() > 0.5 ? "Male" : "Female",
      "Blood Type": pick(rand, BLOOD_TYPES),
      "Medical Condition": pick(rand, CONDITIONS),
      "Date of Admission": fmtDate(admission),
      Doctor: pick(rand, DOCTORS),
      Hospital: pick(rand, HOSPITALS),
      "Insurance Provider": pick(rand, INSURANCE),
      "Billing Amount": Math.round((rand() * 45000 + 4000) / 10) * 10,
      "Room Number": Math.floor(rand() * 400) + 100,
      "Admission Type": pick(rand, ADMISSION_TYPES),
      "Discharge Date": rand() > 0.15 ? fmtDate(discharge) : "",
      Medication: pick(rand, MEDICATIONS),
      "Test Results": pick(rand, TEST_RESULTS),
      Source: pick(rand, SOURCES),
      Phone: `+91-9${Math.floor(rand() * 900000000 + 100000000)}`,
      Email: undefined,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/*  Scoring + AI recommendation engine (rule-based, transparent)       */
/* ------------------------------------------------------------------ */

const CONDITION_WEIGHT = {
  Cancer: 25,
  Hypertension: 18,
  Diabetes: 15,
  Arthritis: 10,
  Obesity: 10,
  Asthma: 12,
};
const ADMISSION_WEIGHT = { Emergency: 30, Urgent: 20, Elective: 10 };
const TEST_WEIGHT = { Abnormal: 30, Inconclusive: 16, Normal: 6 };

function daysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

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
  critical: { bg: "#F6E4E1", fg: "#8C2E26", dot: "#B3413A" },
  high: { bg: "#F7E9D6", fg: "#8A5417", dot: "#C97A2B" },
  moderate: { bg: "#E8EEE0", fg: "#4C6B3D", dot: "#7C9473" },
  routine: { bg: "#E7E5DA", fg: "#5B5A4C", dot: "#8C8A78" },
};

function recommendationsFor(p, score) {
  const recs = [];
  const noDischarge = !p["Discharge Date"];
  if (p["Admission Type"] === "Emergency" && noDischarge) {
    recs.push(`Assign care coordinator to ${p.Name.split(" ")[0]} within the hour.`);
  } else if (p["Admission Type"] === "Urgent") {
    recs.push("Confirm bed/room allocation and notify attending physician today.");
  } else {
    recs.push("Schedule a routine follow-up call within 3 business days.");
  }
  if (p["Test Results"] === "Abnormal") {
    recs.push(`Flag ${p["Test Results"].toLowerCase()} results for ${p.Doctor} for same-day review.`);
  } else if (p["Test Results"] === "Inconclusive") {
    recs.push("Recommend repeat diagnostic panel to confirm findings.");
  }
  if (p["Medical Condition"] === "Cancer" || p["Medical Condition"] === "Hypertension") {
    recs.push(`Highlight ${p["Insurance Provider"]} coverage for extended ${p["Medical Condition"].toLowerCase()} care.`);
  } else {
    recs.push(`Share personalized care plan for ${p["Medical Condition"].toLowerCase()} management.`);
  }
  if (noDischarge) {
    recs.push("Send discharge-readiness check-in and post-care instructions.");
  } else {
    recs.push("Schedule 2-week post-discharge wellness call.");
  }
  return recs.slice(0, 4);
}

function outreachEmail(p) {
  const first = p.Name.split(" ")[0];
  return {
    subject: `Following up on your care at ${p.Hospital}`,
    body:
`Dear ${p.Name},

I hope you're doing well. I'm reaching out regarding your recent visit to ${p.Hospital} under the care of ${p.Doctor} for ${p["Medical Condition"].toLowerCase()} management.

Based on your latest test results (${p["Test Results"]}), we'd like to schedule a short follow-up to review your care plan and confirm everything is on track with your ${p["Insurance Provider"]} coverage.

Would you be available for a 15-minute call this week, ${first}?

Best regards,
Patient Care Team
${p.Hospital}`,
  };
}

function engagementTimeline(p) {
  const events = [];
  events.push({ label: "Lead registered", detail: `via ${p.Source}`, date: p["Date of Admission"] });
  events.push({ label: "Admitted", detail: `${p["Admission Type"]} admission, Room ${p["Room Number"]}`, date: p["Date of Admission"] });
  events.push({ label: "Diagnostic test", detail: `Result: ${p["Test Results"]}`, date: p["Date of Admission"] });
  events.push({ label: "Medication administered", detail: p.Medication, date: p["Date of Admission"] });
  if (p["Discharge Date"]) {
    events.push({ label: "Discharged", detail: "Care episode closed", date: p["Discharge Date"] });
  } else {
    events.push({ label: "Discharge pending", detail: "Still under observation", date: "" });
  }
  return events;
}

/* ------------------------------------------------------------------ */
/*  Small UI building blocks                                          */
/* ------------------------------------------------------------------ */

function PulseDivider() {
  return (
    <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="w-full h-5" aria-hidden="true">
      <polyline
        points="0,12 130,12 150,3 165,21 180,12 400,12"
        fill="none"
        stroke="#1B6B63"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function PriorityBadge({ score }) {
  const p = priorityLabel(score);
  const s = TONE_STYLES[p.tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {p.label} · {score}
    </span>
  );
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white/70 border rounded-xl px-5 py-4 flex flex-col gap-1" style={{ borderColor: "#DAD6C6" }}>
      <span className="text-xs uppercase tracking-wide" style={{ color: "#7A7768", fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </span>
      <span className="text-3xl" style={{ fontFamily: "'Fraunces', serif", color: accent || "#1F2E28" }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: "#8C8A78" }}>{sub}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main App                                                            */
/* ------------------------------------------------------------------ */

export default function VitalLeadApp() {
  const [patients, setPatients] = useState(() => generatePatients(140));
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  const enriched = useMemo(
    () =>
      patients.map((p) => {
        const score = scorePatient(p);
        return { ...p, score, priority: priorityLabel(score) };
      }),
    [patients]
  );

  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.Name.toLowerCase().includes(query.toLowerCase()) ||
        p.Hospital.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase());
      const matchesCondition = conditionFilter === "All" || p["Medical Condition"] === conditionFilter;
      const matchesPriority = priorityFilter === "All" || p.priority.label === priorityFilter;
      return matchesQuery && matchesCondition && matchesPriority;
    });
  }, [enriched, query, conditionFilter, priorityFilter]);

  const kpis = useMemo(() => {
    const total = enriched.length;
    const critical = enriched.filter((p) => p.priority.tone === "critical").length;
    const activeAdmissions = enriched.filter((p) => !p["Discharge Date"]).length;
    const avgBilling =
      enriched.reduce((sum, p) => sum + Number(p["Billing Amount"] || 0), 0) / (total || 1);
    return { total, critical, activeAdmissions, avgBilling };
  }, [enriched]);

  const conditionData = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      map[p["Medical Condition"]] = (map[p["Medical Condition"]] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const admissionTypeData = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      map[p["Admission Type"]] = (map[p["Admission Type"]] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const priorityData = useMemo(() => {
    const order = ["Critical Priority", "High Priority", "Moderate Priority", "Routine"];
    const map = {};
    enriched.forEach((p) => {
      map[p.priority.label] = (map[p.priority.label] || 0) + 1;
    });
    return order.map((name) => ({ name, value: map[name] || 0 }));
  }, [enriched]);

  const PIE_COLORS = ["#1B6B63", "#C97A2B", "#B3413A", "#7C9473", "#8C8A78"];

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .filter((r) => r.Name)
          .map((r, i) => ({
            id: `PT-${2000 + i}`,
            Name: r.Name,
            Age: Number(r.Age) || 0,
            Gender: r.Gender || "Unknown",
            "Blood Type": r["Blood Type"] || "—",
            "Medical Condition": r["Medical Condition"] || "Unspecified",
            "Date of Admission": r["Date of Admission"] || "",
            Doctor: r.Doctor || "Unassigned",
            Hospital: r.Hospital || "Unknown Facility",
            "Insurance Provider": r["Insurance Provider"] || "Self-pay",
            "Billing Amount": Number(r["Billing Amount"]) || 0,
            "Room Number": r["Room Number"] || "—",
            "Admission Type": r["Admission Type"] || "Elective",
            "Discharge Date": r["Discharge Date"] || "",
            Medication: r.Medication || "—",
            "Test Results": r["Test Results"] || "Normal",
            Source: "Imported CSV",
            Phone: r.Phone || "—",
          }));
        if (rows.length) {
          setPatients(rows);
          setImportMsg(`Imported ${rows.length} patient records.`);
        } else {
          setImportMsg("No valid rows found — check the CSV headers match the schema.");
        }
        setTimeout(() => setImportMsg(""), 4000);
      },
    });
    e.target.value = "";
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "patients", label: "Patient Leads", icon: Users },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: "#EFEDE3", color: "#1F2E28", fontFamily: "'Inter', sans-serif" }}
    >
      <FontLoader />
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 border-r flex flex-col py-6 px-4"
        style={{ borderColor: "#DAD6C6", background: "#E7E4D6" }}
      >
        <div className="flex items-center gap-2 px-1 mb-1">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "#1B6B63" }}
          >
            <Activity size={17} color="#EFEDE3" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 600 }}>
            VitalLead
          </span>
        </div>
        <span className="px-1 text-xs mb-6" style={{ color: "#8C8A78" }}>
          Patient Intake &amp; Lead Intelligence
        </span>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                style={{
                  background: active ? "#1B6B63" : "transparent",
                  color: active ? "#EFEDE3" : "#3B4A43",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border"
            style={{ borderColor: "#1B6B63", color: "#1B6B63", background: "#F4F2E8" }}
          >
            <Upload size={15} />
            Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          {importMsg && (
            <p className="text-xs mt-2 text-center" style={{ color: "#4C6B3D" }}>
              {importMsg}
            </p>
          )}
          <p className="text-[11px] mt-3 leading-snug" style={{ color: "#9A9788" }}>
            Schema matches the Kaggle "Healthcare Dataset" — export it as CSV and drop it here to replace the demo data.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="px-8 pt-7 pb-4 border-b" style={{ borderColor: "#DAD6C6" }}>
          <div className="flex items-baseline justify-between">
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.9rem", fontWeight: 600 }}>
              {view === "dashboard" && "Intake Overview"}
              {view === "patients" && "Patient Leads"}
              {view === "analytics" && "Care Analytics"}
            </h1>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#E7E4D6", color: "#5B5A4C" }}
            >
              {enriched.length} records loaded
            </span>
          </div>
          <PulseDivider />
        </header>

        <div className="px-8 py-6">
          {view === "dashboard" && (
            <DashboardView
              kpis={kpis}
              conditionData={conditionData}
              admissionTypeData={admissionTypeData}
              priorityData={priorityData}
              pieColors={PIE_COLORS}
              onOpen={(p) => setSelected(p)}
              enriched={enriched}
            />
          )}

          {view === "patients" && (
            <PatientsView
              filtered={filtered}
              query={query}
              setQuery={setQuery}
              conditionFilter={conditionFilter}
              setConditionFilter={setConditionFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              onOpen={(p) => setSelected(p)}
            />
          )}

          {view === "analytics" && (
            <AnalyticsView enriched={enriched} pieColors={PIE_COLORS} />
          )}
        </div>
      </main>

      {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                           */
/* ------------------------------------------------------------------ */

function DashboardView({ kpis, conditionData, admissionTypeData, priorityData, pieColors, onOpen, enriched }) {
  const topPriority = [...enriched].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Patients" value={kpis.total} />
        <KpiCard label="Critical Priority" value={kpis.critical} accent="#B3413A" sub="Needs contact today" />
        <KpiCard label="Active Admissions" value={kpis.activeAdmissions} sub="Not yet discharged" />
        <KpiCard
          label="Avg. Billing"
          value={`₹${Math.round(kpis.avgBilling).toLocaleString("en-IN")}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Patients by Medical Condition">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conditionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DAD6C6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5B5A4C" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5B5A4C" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#DAD6C6" }} />
              <Bar dataKey="value" fill="#1B6B63" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#DAD6C6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5B5A4C" }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: "#5B5A4C" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#DAD6C6" }} />
              <Bar dataKey="value" fill="#C97A2B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Highest-Priority Patients — act on these first">
        <div className="flex flex-col divide-y" style={{ borderColor: "#DAD6C6" }}>
          {topPriority.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="flex items-center justify-between py-3 text-left hover:bg-black/[0.02] px-1 rounded"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{p.Name}</span>
                <span className="text-xs" style={{ color: "#8C8A78" }}>
                  {p["Medical Condition"]} · {p.Hospital}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge score={p.score} />
                <ChevronRight size={16} color="#8C8A78" />
              </div>
            </button>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white/70 border rounded-xl px-5 py-4" style={{ borderColor: "#DAD6C6" }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#3B4A43" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patients (Leads) table                                             */
/* ------------------------------------------------------------------ */

function PatientsView({
  filtered,
  query,
  setQuery,
  conditionFilter,
  setConditionFilter,
  priorityFilter,
  setPriorityFilter,
  onOpen,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 bg-white/70"
          style={{ borderColor: "#DAD6C6" }}
        >
          <Search size={15} color="#8C8A78" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, hospital, or ID…"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm bg-white/70"
          style={{ borderColor: "#DAD6C6" }}
        >
          <option>All</option>
          {CONDITIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm bg-white/70"
          style={{ borderColor: "#DAD6C6" }}
        >
          <option>All</option>
          <option>Critical Priority</option>
          <option>High Priority</option>
          <option>Moderate Priority</option>
          <option>Routine</option>
        </select>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white/70" style={{ borderColor: "#DAD6C6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#E7E4D6" }}>
              {["Patient", "Condition", "Hospital", "Admission", "Test Result", "Priority", ""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: "#5B5A4C" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => onOpen(p)}
                className="border-t cursor-pointer hover:bg-black/[0.02]"
                style={{ borderColor: "#EDEBDE" }}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{p.Name}</span>
                    <span className="text-xs" style={{ color: "#8C8A78", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {p.id}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{p["Medical Condition"]}</td>
                <td className="px-4 py-3">{p.Hospital}</td>
                <td className="px-4 py-3">{p["Admission Type"]}</td>
                <td className="px-4 py-3">{p["Test Results"]}</td>
                <td className="px-4 py-3">
                  <PriorityBadge score={p.score} />
                </td>
                <td className="px-4 py-3">
                  <ChevronRight size={15} color="#8C8A78" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm" style={{ color: "#8C8A78" }}>
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

/* ------------------------------------------------------------------ */
/*  Analytics view                                                      */
/* ------------------------------------------------------------------ */

function AnalyticsView({ enriched, pieColors }) {
  const byInsurance = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      const k = p["Insurance Provider"];
      map[k] = (map[k] || 0) + Number(p["Billing Amount"] || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [enriched]);

  const byTestResult = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      map[p["Test Results"]] = (map[p["Test Results"]] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const bySource = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      map[p.Source] = (map[p.Source] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Total Billing by Insurance Provider (₹)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byInsurance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DAD6C6" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5B5A4C" }} />
            <YAxis tick={{ fontSize: 10, fill: "#5B5A4C" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" fill="#1B6B63" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Test Result Outcomes">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={byTestResult} dataKey="value" nameKey="name" outerRadius={85} label>
              {byTestResult.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Lead Source Breakdown">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bySource} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#DAD6C6" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#5B5A4C" }} />
            <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: "#5B5A4C" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" fill="#7C9473" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Scoring model (how Priority is calculated)">
        <ul className="text-sm flex flex-col gap-2" style={{ color: "#3B4A43" }}>
          <li>• Admission type — Emergency 30 · Urgent 20 · Elective 10</li>
          <li>• Test result — Abnormal 30 · Inconclusive 16 · Normal 6</li>
          <li>• Condition severity — Cancer 25 · Hypertension 18 · Asthma 12 · Diabetes 15 · Arthritis/Obesity 10</li>
          <li>• Age factor — 65+ adds 15 · 40–64 adds 9 · under 40 adds 4</li>
          <li>• Still admitted &amp; recent — adds up to 12</li>
        </ul>
        <p className="text-xs mt-3" style={{ color: "#8C8A78" }}>
          Scores are capped at 100 and mapped to Critical (81–100), High (61–80), Moderate (41–60), Routine (0–40) — the same tiering logic your mentor's Lead Scoring module used.
        </p>
      </ChartCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patient detail drawer                                              */
/* ------------------------------------------------------------------ */

function PatientDrawer({ patient, onClose }) {
  const score = scorePatient(patient);
  const recs = recommendationsFor(patient, score);
  const email = outreachEmail(patient);
  const timeline = engagementTimeline(patient);

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-[440px] max-w-full h-full overflow-y-auto shadow-xl"
        style={{ background: "#F7F5EC" }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "#DAD6C6" }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 600 }}>{patient.Name}</h2>
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8C8A78" }}>
              {patient.id} · {patient.Age}y · {patient.Gender} · {patient["Blood Type"]}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <PriorityBadge score={score} />
            <span className="text-xs" style={{ color: "#8C8A78" }}>Source: {patient.Source}</span>
          </div>

          <Section icon={Stethoscope} title="Clinical Summary">
            <InfoRow label="Condition" value={patient["Medical Condition"]} />
            <InfoRow label="Admission Type" value={patient["Admission Type"]} />
            <InfoRow label="Doctor" value={patient.Doctor} />
            <InfoRow label="Hospital" value={patient.Hospital} />
            <InfoRow label="Room" value={patient["Room Number"]} />
            <InfoRow label="Medication" value={patient.Medication} />
            <InfoRow label="Test Result" value={patient["Test Results"]} />
          </Section>

          <Section icon={ShieldCheck} title="Coverage &amp; Billing">
            <InfoRow label="Insurance" value={patient["Insurance Provider"]} />
            <InfoRow label="Billing Amount" value={`₹${Number(patient["Billing Amount"]).toLocaleString("en-IN")}`} />
            <InfoRow label="Admitted" value={patient["Date of Admission"] || "—"} />
            <InfoRow label="Discharged" value={patient["Discharge Date"] || "Not yet discharged"} />
          </Section>

          <Section icon={AlertTriangle} title="AI Recommendations">
            <ul className="flex flex-col gap-2">
              {recs.map((r, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span style={{ color: "#C97A2B" }}>●</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Clock} title="Engagement History">
            <div className="flex flex-col">
              {timeline.map((ev, i) => (
                <div key={i} className="flex gap-3 pb-3 relative">
                  {i !== timeline.length - 1 && (
                    <span className="absolute left-[5px] top-3 bottom-0 w-px" style={{ background: "#DAD6C6" }} />
                  )}
                  <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: "#1B6B63" }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ev.label}</span>
                    <span className="text-xs" style={{ color: "#8C8A78" }}>
                      {ev.detail} {ev.date && `· ${ev.date}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Mail} title="Automated Outreach Draft">
            <div className="border rounded-lg p-3 text-sm bg-white/60" style={{ borderColor: "#DAD6C6" }}>
              <p className="font-medium mb-1">{email.subject}</p>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed" style={{ color: "#3B4A43" }}>
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
        <Icon size={15} color="#1B6B63" />
        <h3 className="text-sm font-semibold" style={{ color: "#1F2E28" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b" style={{ borderColor: "#EDEBDE" }}>
      <span style={{ color: "#8C8A78" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

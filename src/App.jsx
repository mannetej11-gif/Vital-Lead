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
  Bell,
  Phone,
  CalendarClock,
  Settings,
  UserCircle,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
  CalendarPlus,
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
  AreaChart,
  Area,
} from "recharts";
import Papa from "papaparse";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  Paper: #F5F5FC   Ink: #17172C   Teal: #0EA394   Amber: #F59E0B     */
/*  Critical: #E11D48   Sage: #10B981   Line: #E4E3F2                 */
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
  critical: { bg: "#FFE4E6", fg: "#BE123C", dot: "#E11D48" },
  high: { bg: "#FEF3C7", fg: "#B45309", dot: "#F59E0B" },
  moderate: { bg: "#D1FAE5", fg: "#047857", dot: "#10B981" },
  routine: { bg: "#E5E7EB", fg: "#4B4A66", dot: "#8B8AA6" },
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

function callScriptFor(p) {
  const first = p.Name.split(" ")[0];
  const noDischarge = !p["Discharge Date"];
  return {
    opening: `Hi, may I speak with ${first}? This is calling from ${p.Hospital} regarding your recent ${p["Admission Type"].toLowerCase()} visit with ${p.Doctor}.`,
    talkingPoints: [
      `Confirm how ${first} has been feeling since the ${p["Medical Condition"].toLowerCase()} diagnosis/treatment.`,
      `Reference test results: ${p["Test Results"]}${p["Test Results"] === "Abnormal" ? " — reassure them a physician review is already scheduled." : "."}`,
      `Mention their ${p["Insurance Provider"]} coverage applies to the recommended follow-up care.`,
      noDischarge
        ? "Ask if they have questions about their current admission and expected discharge timeline."
        : "Check in on recovery since discharge and confirm medication adherence.",
    ],
    objection: `If hesitant: offer a shorter 10-minute call or a callback at a time that suits ${first} better — avoid pressuring.`,
    closing: noDischarge
      ? "Confirm next in-person check-in date before ending the call."
      : "Offer to schedule a 2-week wellness follow-up before ending the call.",
  };
}

function suggestedAppointment(p, score) {
  const noDischarge = !p["Discharge Date"];
  const base = p["Discharge Date"] ? new Date(p["Discharge Date"]) : new Date();
  const offsetDays = score >= 81 ? 1 : score >= 61 ? 3 : score >= 41 ? 7 : 14;
  const date = new Date(base);
  date.setDate(date.getDate() + offsetDays);
  const type = noDischarge
    ? "In-Patient Review"
    : score >= 61
    ? "Priority Follow-up Consultation"
    : "Routine Wellness Check-in";
  return { date: fmtDate(date), type, durationMins: type === "In-Patient Review" ? 30 : 15 };
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
        stroke="#0EA394"
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
      className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-2 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: "0 1px 2px rgba(23,23,44,0.04), 0 8px 24px rgba(23,23,44,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide" style={{ color: "#8B8AA6", fontFamily: "'IBM Plex Mono', monospace" }}>
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
            <Icon size={14} color={c.fg} />
          </div>
        )}
      </div>
      <span className="text-3xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#17172C" }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: "#8B8AA6" }}>{sub}</span>}
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
  const [headerSearch, setHeaderSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    const qualified = enriched.filter((p) => p.priority.tone === "critical" || p.priority.tone === "high").length;
    const discharged = enriched.filter((p) => p["Discharge Date"]).length;
    const conversionRate = total ? Math.round((discharged / total) * 1000) / 10 : 0;
    const emailsGenerated = enriched.filter((p) => p.priority.tone === "critical" || p.priority.tone === "high").length;
    const followUpsToday = enriched.filter((p) => !p["Discharge Date"] && daysSince(p["Date of Admission"]) < 14).length;
    const totalBilling = enriched.reduce((sum, p) => sum + Number(p["Billing Amount"] || 0), 0);
    const avgBilling = totalBilling / (total || 1);
    return {
      total,
      critical,
      activeAdmissions,
      qualified,
      conversionRate,
      emailsGenerated,
      followUpsToday,
      totalBilling,
      avgBilling,
    };
  }, [enriched]);

  const billingTrend = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      const d = p["Date of Admission"];
      if (!d) return;
      const month = d.slice(0, 7);
      map[month] = (map[month] || 0) + Number(p["Billing Amount"] || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-9)
      .map(([month, value]) => ({ month, value: Math.round(value) }));
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

  const PIE_COLORS = ["#7C5CFF", "#16E0BD", "#F59E0B", "#E11D48", "#0284C7"];

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
    { key: "email-generator", label: "AI Email Generator", icon: Mail },
    { key: "call-script", label: "Call Script Generator", icon: Phone },
    { key: "followups", label: "Follow-up Manager", icon: Clock },
    { key: "appointments", label: "Appointment Assistant", icon: CalendarClock },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const notifications = u

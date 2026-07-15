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

const ADMISSION_WEIGHT = {
  Emergency: 30,
  Urgent: 20,
  Elective: 10,
};

const TEST_WEIGHT = {
  Abnormal: 30,
  Inconclusive: 16,
  Normal: 6,
};

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
  if (score >= 81)
    return { label: "Critical Priority", tone: "critical" };

  if (score >= 61)
    return { label: "High Priority", tone: "high" };

  if (score >= 41)
    return { label: "Moderate Priority", tone: "moderate" };

  return { label: "Routine", tone: "routine" };
}

const TONE_STYLES = {
  critical: {
    bg: "#FFE4E6",
    fg: "#BE123C",
    dot: "#E11D48",
  },
  high: {
    bg: "#FEF3C7",
    fg: "#B45309",
    dot: "#F59E0B",
  },
  moderate: {
    bg: "#D1FAE5",
    fg: "#047857",
    dot: "#10B981",
  },
  routine: {
    bg: "#E5E7EB",
    fg: "#4B4A66",
    dot: "#8B8AA6",
  },
};

function recommendationsFor(p, score) {
  const recs = [];
  const noDischarge = !p["Discharge Date"];

  if (p["Admission Type"] === "Emergency" && noDischarge) {
    recs.push(
      `Assign care coordinator to ${p.Name.split(" ")[0]} within the hour.`
    );
  } else if (p["Admission Type"] === "Urgent") {
    recs.push(
      "Confirm bed/room allocation and notify attending physician today."
    );
  } else {
    recs.push("Schedule a routine follow-up call within 3 business days.");
  }

  if (p["Test Results"] === "Abnormal") {
    recs.push(
      `Flag ${p["Test Results"].toLowerCase()} results for ${
        p.Doctor
      } for same-day review.`
    );
  } else if (p["Test Results"] === "Inconclusive") {
    recs.push("Recommend repeat diagnostic panel to confirm findings.");
  }

  if (
    p["Medical Condition"] === "Cancer" ||
    p["Medical Condition"] === "Hypertension"
  ) {
    recs.push(
      `Highlight ${p["Insurance Provider"]} coverage for extended ${p[
        "Medical Condition"
      ].toLowerCase()} care.`
    );
  } else {
    recs.push(
      `Share personalized care plan for ${p[
        "Medical Condition"
      ].toLowerCase()} management.`
    );
  }

  if (noDischarge) {
    recs.push(
      "Send discharge-readiness check-in and post-care instructions."
    );
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

  events.push({
    label: "Lead registered",
    detail: `via ${p.Source}`,
    date: p["Date of Admission"],
  });

  events.push({
    label: "Admitted",
    detail: `${p["Admission Type"]} admission, Room ${p["Room Number"]}`,
    date: p["Date of Admission"],
  });

  events.push({
    label: "Diagnostic test",
    detail: `Result: ${p["Test Results"]}`,
    date: p["Date of Admission"],
  });

  events.push({
    label: "Medication administered",
    detail: p.Medication,
    date: p["Date of Admission"],
  });

  if (p["Discharge Date"]) {
    events.push({
      label: "Discharged",
      detail: "Care episode closed",
      date: p["Discharge Date"],
    });
  } else {
    events.push({
      label: "Discharge pending",
      detail: "Still under observation",
      date: "",
    });
  }

  return events;
}

function callScriptFor(p) {
  const first = p.Name.split(" ")[0];
  const noDischarge = !p["Discharge Date"];

  return {
    opening: `Hi, may I speak with ${first}? This is calling from ${p.Hospital} regarding your recent ${p["Admission Type"].toLowerCase()} visit with ${p.Doctor}.`,

    talkingPoints: [
      `Confirm how ${first} has been feeling since the ${p[
        "Medical Condition"
      ].toLowerCase()} diagnosis/treatment.`,

      `Reference test results: ${p["Test Results"]}${
        p["Test Results"] === "Abnormal"
          ? " — reassure them a physician review is already scheduled."
          : "."
      }`,

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
  const base = p["Discharge Date"]
    ? new Date(p["Discharge Date"])
    : new Date();

  const offsetDays =
    score >= 81 ? 1 :
    score >= 61 ? 3 :
    score >= 41 ? 7 : 14;

  const date = new Date(base);
  date.setDate(date.getDate() + offsetDays);

  const type = noDischarge
    ? "In-Patient Review"
    : score >= 61
      ? "Priority Follow-up Consultation"
      : "Routine Wellness Check-in";

  return {
    date: fmtDate(date),
    type,
    durationMins: type === "In-Patient Review" ? 30 : 15,
  };
}

/* ------------------------------------------------------------------ */
/*  Small UI building blocks                                          */
/* ------------------------------------------------------------------ */

function PulseDivider() {
  return (
    <svg
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      className="w-full h-5"
      aria-hidden="true"
    >
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
      style={{
        background: s.bg,
        color: s.fg,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
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
      style={{
        boxShadow:
          "0 1px 2px rgba(23,23,44,0.04), 0 8px 24px rgba(23,23,44,0.06)",
      }}
    >
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
      .map(([month, value]) => ({
        month,
        value: Math.round(value),
      }));
  }, [enriched]);

  const conditionData = useMemo(() => {
    const map = {};

    enriched.forEach((p) => {
      map[p["Medical Condition"]] =
        (map[p["Medical Condition"]] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [enriched]);

  const admissionTypeData = useMemo(() => {
    const map = {};

    enriched.forEach((p) => {
      map[p["Admission Type"]] =
        (map[p["Admission Type"]] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [enriched]);

  const priorityData = useMemo(() => {
    const order = [
      "Critical Priority",
      "High Priority",
      "Moderate Priority",
      "Routine",
    ];

    const map = {};

    enriched.forEach((p) => {
      map[p.priority.label] =
        (map[p.priority.label] || 0) + 1;
    });

    return order.map((name) => ({
      name,
      value: map[name] || 0,
    }));
  }, [enriched]);

  const PIE_COLORS = [
    "#7C5CFF",
    "#16E0BD",
    "#F59E0B",
    "#E11D48",
    "#0284C7",
  ];
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

  const notifications = useMemo(() => {
    const critical = enriched.filter((p) => p.priority.tone === "critical").length;
    const pendingDischarge = enriched.filter((p) => !p["Discharge Date"]).length;
    return [
      { text: `${critical} patients flagged Critical Priority — need contact today`, tone: "critical" },
      { text: `${pendingDischarge} patients still admitted, awaiting discharge review`, tone: "moderate" },
      { text: "CSV import ready — schema matches Kaggle Healthcare Dataset", tone: "routine" },
    ];
  }, [enriched]);

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: "#F5F5FC", color: "#17172C", fontFamily: "'Inter', sans-serif" }}
    >
      <FontLoader />
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col py-6 px-4"
        style={{
          background: "linear-gradient(165deg, #12122B 0%, #1B1440 55%, #2A1858 100%)",
        }}
      >
        <div className="flex items-center gap-2 px-1 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #16E0BD, #7C5CFF)" }}
          >
            <Activity size={17} color="#12122B" />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 600, color: "#FAFAFF" }}>
            VitalLead
          </span>
        </div>
        <span className="px-1 text-xs mb-6" style={{ color: "#9C9BD6" }}>
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all"
                style={{
                  background: active ? "linear-gradient(90deg, #16E0BD, #7C5CFF)" : "transparent",
                  color: active ? "#12122B" : "#C7C6EA",
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? "0 4px 14px rgba(124,92,255,0.45)" : "none",
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ color: "#12122B", background: "linear-gradient(90deg, #16E0BD, #7C5CFF)" }}
          >
            <Upload size={15} />
            Import CSV
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ color: "#12122B", background: "linear-gradient(90deg, #16E0BD, #7C5CFF)" }}
          >
            <Upload size={15} />
            Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          {importMsg && (
            <p className="text-xs mt-2 text-center" style={{ color: "#5EEAD4" }}>
              {importMsg}
            </p>
          )}
          <p className="text-[11px] mt-3 leading-snug" style={{ color: "#8482B8" }}>
            Schema matches the Kaggle "Healthcare Dataset" — export it as CSV and drop it here to replace the demo data.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar: search, notifications, profile — mirrors the reference platform */}
        <div
          className="flex items-center gap-3 px-6 py-3 border-b"
          style={{ borderColor: "#E4E3F2", background: "#FAFAFF" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-1 max-w-md bg-white/70"
            style={{ borderColor: "#E4E3F2" }}
          >
            <Search size={14} color="#8B8AA6" />
            <input
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && headerSearch.trim()) {
                  setQuery(headerSearch);
                  setView("patients");
                }
              }}
              placeholder="Search patients, hospitals, doctors…"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-black/5"
            >
              <Bell size={17} color="#2C2C46" />
              {notifications.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
                  style={{ background: "#E11D48" }}
                >
                  {notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-72 border rounded-xl shadow-lg bg-white z-20 py-2"
                style={{ borderColor: "#E4E3F2" }}
              >
                {notifications.map((n, i) => (
                  <div key={i} className="px-3 py-2 text-xs flex gap-2 items-start">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                      style={{ background: TONE_STYLES[n.tone].dot }}
                    />
                    <span style={{ color: "#2C2C46" }}>{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar: search, notifications, profile — mirrors the reference platform */}
        <div
          className="flex items-center gap-3 px-6 py-3 border-b"
          style={{ borderColor: "#E4E3F2", background: "#FAFAFF" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-1 max-w-md bg-white/70"
            style={{ borderColor: "#E4E3F2" }}
          >
            <Search size={14} color="#8B8AA6" />
            <input
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && headerSearch.trim()) {
                  setQuery(headerSearch);
                  setView("patients");
                }
              }}
              placeholder="Search patients, hospitals, doctors…"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-black/5"
            >
              <Bell size={17} color="#2C2C46" />
              {notifications.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
                  style={{ background: "#E11D48" }}
                >
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-72 border rounded-xl shadow-lg bg-white z-20 py-2"
                style={{ borderColor: "#E4E3F2" }}
              >
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-xs flex gap-2 items-start"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                      style={{ background: TONE_STYLES[n.tone].dot }}
                    />
                    <span style={{ color: "#2C2C46" }}>{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-black/5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: "#0EA394", color: "#F5F5FC" }}
              >
                CC
              </div>

              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">
                  Care Coordinator
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "#8B8AA6" }}
                >
                  VitalLead Staff
                </span>
              </div>

              <ChevronDown size={14} color="#8B8AA6" />
            </button>
            )}
          </div>
        </div>

        <header className="px-8 pt-6 pb-4 border-b" style={{ borderColor: "#E4E3F2" }}>
          <div className="flex items-baseline justify-between">
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.9rem", fontWeight: 600 }}>
              {view === "dashboard" && "Intake Overview"}
              {view === "patients" && "Patient Leads"}
              {view === "email-generator" && "AI Email Generator"}
              {view === "call-script" && "Call Script Generator"}
              {view === "followups" && "Follow-up Manager"}
              {view === "appointments" && "Appointment Assistant"}
              {view === "analytics" && "Care Analytics"}
            </h1>

            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: "#F0EFFB",
                color: "#4B4A66",
              }}
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
              billingTrend={billingTrend}
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

          {view === "email-generator" && (
            <EmailGeneratorView enriched={enriched} />
          )}

          {view === "call-script" && (
            <CallScriptView enriched={enriched} />
          )}

          {view === "followups" && (
            <FollowUpsView
              enriched={enriched}
              onOpen={(p) => setSelected(p)}
            />
          )}

          {view === "appointments" && (
            <AppointmentsView enriched={enriched} />
          )}

          {view === "analytics" && (
            <AnalyticsView
              enriched={enriched}
              pieColors={PIE_COLORS}
            />
          )}
        </div>
      </main>

      {selected && (
        <PatientDrawer
          patient={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function DashboardView({
  kpis,
  billingTrend,
  conditionData,
  admissionTypeData,
  priorityData,
  pieColors,
  onOpen,
  enriched,
}) {
  const topPriority = [...enriched]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Patients"
          value={kpis.total}
          sub="+12.4% vs last month"
          icon={Users}
          tone="violet"
        />
        <KpiCard label="Total Patients" value={kpis.total} sub="+12.4% vs last month" icon={Users} tone="violet" />
        <KpiCard label="Active Leads" value={kpis.activeAdmissions} sub="Not yet discharged" icon={Activity} tone="sky" />
        <KpiCard label="Qualified" value={kpis.qualified} sub="Critical + High priority" icon={Sparkles} tone="amber" />
        <KpiCard label="Follow-ups Today" value={kpis.followUpsToday} sub="Admitted under 14 days" icon={Clock} tone="rose" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Emails Generated" value={kpis.emailsGenerated} sub="Outreach drafts ready" icon={Mail} tone="teal" />
        <KpiCard label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Discharged of total" icon={BarChart3} tone="emerald" />
        <KpiCard
          label="Total Billing"
          value={`₹${Math.round(kpis.totalBilling).toLocaleString("en-IN")}`}
          sub="All patients"
          icon={ShieldCheck}
          tone="violet"
        />
        <KpiCard
          label="Avg. Billing"
          value={`₹${Math.round(kpis.avgBilling).toLocaleString("en-IN")}`}
          sub="Per patient"
          icon={ShieldCheck}
          tone="sky"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartCard title="Billing Trend — Monthly performance (₹)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={billingTrend}>
                <defs>
                  <linearGradient id="billingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#16E0BD" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E3F2" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4B4A66" }} />
                <YAxis tick={{ fontSize: 10, fill: "#4B4A66" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E4E3F2" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7C5CFF"
                  strokeWidth={2}
                  fill="url(#billingFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Priority Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
              >
                {priorityData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={pieColors[i % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E3F2" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4B4A66" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4B4A66" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E4E3F2" }} />
              <Bar dataKey="value" fill="#0EA394" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Admission Type Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={admissionTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E3F2" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4B4A66" }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "#4B4A66" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E4E3F2" }} />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Highest-Priority Patients — act on these first">
        <div className="flex flex-col divide-y" style={{ borderColor: "#E4E3F2" }}>
          {topPriority.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="flex items-center justify-between py-3 text-left hover:bg-black/[0.02] px-1 rounded"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{p.Name}</span>
                <span className="text-xs" style={{ color: "#8B8AA6" }}>
                  {p["Medical Condition"]} · {p.Hospital}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <PriorityBadge score={p.score} />
                <ChevronRight size={16} color="#8B8AA6" />
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
    <div
      className="bg-white rounded-2xl px-5 py-4"
      style={{
        boxShadow:
          "0 1px 2px rgba(23,23,44,0.04), 0 8px 24px rgba(23,23,44,0.06)",
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "#2C2C46" }}
      >
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
          style={{ borderColor: "#E4E3F2" }}
        >
          <Search size={15} color="#8B8AA6" />
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
          style={{ borderColor: "#E4E3F2" }}
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
          style={{ borderColor: "#E4E3F2" }}
        >
          <option>All</option>
          <option>Critical Priority</option>
          <option>High Priority</option>
          <option>Moderate Priority</option>
          <option>Routine</option>
        </select>
      </div>

      <div
        className="border rounded-xl overflow-hidden bg-white/70"
        style={{ borderColor: "#E4E3F2" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F0EFFB" }}>
              {[
                "Patient",
                "Condition",
                "Hospital",
                "Admission",
                "Test Result",
                "Priority",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide"
                  style={{ color: "#4B4A66" }}
                >
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
                style={{ borderColor: "#ECEBF7" }}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{p.Name}</span>
                    <span
                      className="text-xs"
                      style={{
                        color: "#8B8AA6",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {p.id}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {p["Medical Condition"]}
                </td>

                <td className="px-4 py-3">
                  {p.Hospital}
                       <td className="px-4 py-3">
                  {p["Admission Type"]}
                </td>

                <td className="px-4 py-3">
                  {p["Test Results"]}
                </td>

                <td className="px-4 py-3">
                  <PriorityBadge score={p.score} />
                </td>

                <td className="px-4 py-3">
                  <ChevronRight size={15} color="#8B8AA6" />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-sm"
                  style={{ color: "#8B8AA6" }}
                >
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
/*  AI Email Generator                                                 */
/* ------------------------------------------------------------------ */

function EmailGeneratorView({ enriched }) {
  const [patientId, setPatientId] = useState(enriched[0]?.id || "");
  const [copied, setCopied] = useState(false);

  const patient =
    enriched.find((p) => p.id === patientId) || enriched[0];

  if (!patient) return null;

  const email = outreachEmail(patient);

  function copyEmail() {
    navigator.clipboard?.writeText(
      `Subject: ${email.subject}\n\n${email.body}`
    );

    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Select Patient">
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm bg-white/70 mb-3"
          style={{ borderColor: "#E4E3F2" }}
        >
          {enriched.map((p) => (
            <option key={p.id} value={p.id}>
              {p.Name} — {p["Medical Condition"]}
            </option>
          ))}
        </select>

        <div
          className="flex items-center gap-2 text-xs mb-2"
          style={{ color: "#8B8AA6" }}
        >
          <Sparkles size={13} color="#0EA394" />
          Generated from clinical + coverage profile
        </div>

        <PriorityBadge score={scorePatient(patient)} />
      </ChartCard></td>
      <div className="col-span-2">
        <ChartCard title="Generated Email">
          <div
            className="border rounded-lg p-4 bg-white/60"
            style={{ borderColor: "#E4E3F2" }}
          >
            <p className="font-medium text-sm mb-2">
              {email.subject}
            </p>

            <pre
              className="whitespace-pre-wrap font-sans text-xs leading-relaxed"
              style={{ color: "#2C2C46" }}
            >
              {email.body}
            </pre>
          </div>

          <button
            onClick={copyEmail}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
            style={{
              borderColor: "#0EA394",
              color: "#0EA394",
            }}
          >
            {copied ? (
              <Check size={13} />
            ) : (
              <Copy size={13} />
            )}

            {copied ? "Copied" : "Copy Email"}
          </button>
        </ChartCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Call Script Generator                                              */
/* ------------------------------------------------------------------ */

function CallScriptView({ enriched }) {
  const [patientId, setPatientId] = useState(
    enriched[0]?.id || ""
  );

  const patient =
    enriched.find((p) => p.id === patientId) || enriched[0];

  if (!patient) return null;

  const script = callScriptFor(patient);

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Select Patient">
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm bg-white/70 mb-3"
          style={{ borderColor: "#E4E3F2" }}
        >
          {enriched.map((p) => (
            <option key={p.id} value={p.id}>
              {p.Name} — {p["Medical Condition"]}
            </option>
          ))}
        </select>

        <InfoRow label="Doctor" value={patient.Doctor} />
        <InfoRow
          label="Admission"
          value={patient["Admission Type"]}
        />
        <InfoRow label="Phone" value={patient.Phone} />
      </ChartCard>
      <div className="col-span-2">
        <ChartCard title="Call Script">
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#0EA394" }}
              >
                OPENING
              </p>
              <p className="text-sm">{script.opening}</p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#0EA394" }}
              >
                TALKING POINTS
              </p>

              <ul className="flex flex-col gap-1.5">
                {script.talkingPoints.map((t, i) => (
                  <li
                    key={i}
                    className="text-sm flex gap-2"
                  >
                    <span style={{ color: "#F59E0B" }}>●</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#0EA394" }}
              >
                IF HESITANT
              </p>
              <p className="text-sm">{script.objection}</p>
            </div>

            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "#0EA394" }}
              >
                CLOSING
              </p>
              <p className="text-sm">{script.closing}</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Follow-up Manager                                                   */
/* ------------------------------------------------------------------ */

function FollowUpsView({ enriched, onOpen }) {
  const [contacted, setContacted] = useState({});

  const dueList = useMemo(() => {
    return [...enriched]
      .filter(
        (p) =>
          p.priority.tone === "critical" ||
          p.priority.tone === "high"
      )
      .sort((a, b) => b.score - a.score);
  }, [enriched]);

  function urgencyLabel(p) {
    if (p.priority.tone === "critical") return "Overdue";

    const d = daysSince(p["Date of Admission"]);
    return d < 3 ? "Due Today" : "Due This Week";
  }
  return (
    <ChartCard title={`Patients Needing Follow-up (${dueList.length})`}>
      <div
        className="flex flex-col divide-y"
        style={{ borderColor: "#E4E3F2" }}
      >
        {dueList.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-3 px-1"
          >
            <button
              onClick={() => onOpen(p)}
              className="flex flex-col text-left"
            >
              <span className="text-sm font-medium">
                {p.Name}
              </span>

              <span
                className="text-xs"
                style={{ color: "#8B8AA6" }}
              >
                {p["Medical Condition"]} · {urgencyLabel(p)}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <PriorityBadge score={p.score} />

              <button
                onClick={() =>
                  setContacted((c) => ({
                    ...c,
                    [p.id]: !c[p.id],
                  }))
                }
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: contacted[p.id]
                    ? "#10B981"
                    : "#E4E3F2",
                  color: contacted[p.id]
                    ? "#047857"
                    : "#4B4A66",
                  background: contacted[p.id]
                    ? "#D1FAE5"
                    : "transparent",
                }}
              >
                {contacted[p.id]
                  ? "Contacted ✓"
                  : "Mark Contacted"}
              </button>
            </div>
          </div>
        ))}

        {dueList.length === 0 && (
          <p
            className="text-sm py-6 text-center"
            style={{ color: "#8B8AA6" }}
          >
            No patients currently need follow-up.
          </p>
        )}
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointment Assistant                                              */
/* ------------------------------------------------------------------ */

function AppointmentsView({ enriched }) {
  const suggestions = useMemo(() => {
    return [...enriched]
      .map((p) => ({
        p,
        appt: suggestedAppointment(p, p.score),
      }))
      .sort((a, b) =>
        a.appt.date > b.appt.date ? 1 : -1
      )
      .slice(0, 15);
  }, [enriched]);
  return (
    <ChartCard title="Suggested Appointments">
      <div className="border rounded-xl overflow-hidden" style={{ borderColor: "#E4E3F2" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#F0EFFB" }}>
              {["Patient", "Type", "Suggested Date", "Duration", "Priority"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide"
                  style={{ color: "#4B4A66" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {suggestions.map(({ p, appt }) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "#ECEBF7" }}>
                <td className="px-4 py-2.5 font-medium">{p.Name}</td>
                <td className="px-4 py-2.5 flex items-center gap-1.5">
                  <CalendarPlus size={13} color="#0EA394" />
                  {appt.type}
                </td>
                <td className="px-4 py-2.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {appt.date}
                </td>
                <td className="px-4 py-2.5">{appt.durationMins} min</td>
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

/* ------------------------------------------------------------------ */
/*  Analytics view                                                     */
/* ------------------------------------------------------------------ */

function AnalyticsView({ enriched, pieColors }) {
  const byInsurance = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      const k = p["Insurance Provider"];
      map[k] = (map[k] || 0) + Number(p["Billing Amount"] || 0);
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [enriched]);

  const byTestResult = useMemo(() => {
    const map = {};
    enriched.forEach((p) => {
      map[p["Test Results"]] =
        (map[p["Test Results"]] || 0) + 1;
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E3F2" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4B4A66" }} />
            <YAxis tick={{ fontSize: 10, fill: "#4B4A66" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" fill="#0EA394" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Test Result Outcomes">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={byTestResult}
              dataKey="value"
              nameKey="name"
              outerRadius={85}
              label
            >
              {byTestResult.map((_, i) => (
                <Cell
                  key={i}
                  fill={pieColors[i % pieColors.length]}
                />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E3F2" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#4B4A66" }} />
            <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: "#4B4A66" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Scoring model (how Priority is calculated)">
        <ul className="text-sm flex flex-col gap-2" style={{ color: "#2C2C46" }}>
          <li>• Admission type — Emergency 30 · Urgent 20 · Elective 10</li>
          <li>• Test result — Abnormal 30 · Inconclusive 16 · Normal 6</li>
          <li>• Condition severity — Cancer 25 · Hypertension 18 · Asthma 12 · Diabetes 15 · Arthritis/Obesity 10</li>
          <li>• Age factor — 65+ adds 15 · 40–64 adds 9 · under 40 adds 4</li>
          <li>• Still admitted &amp; recent — adds up to 12</li>
        </ul>

        <p className="text-xs mt-3" style={{ color: "#8B8AA6" }}>
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
        style={{ background: "#FAFAFF" }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "#E4E3F2" }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 600 }}>
              {patient.Name}
            </h2>
            <span className="text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8B8AA6" }}>
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
            <span className="text-xs" style={{ color: "#8B8AA6" }}>
              Source: {patient.Source}
            </span>
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

          <Section icon={ShieldCheck} title="Coverage & Billing">
            <InfoRow label="Insurance" value={patient["Insurance Provider"]} />
            <InfoRow label="Billing Amount" value={`₹${Number(patient["Billing Amount"]).toLocaleString("en-IN")}`} />
            <InfoRow label="Admitted" value={patient["Date of Admission"] || "—"} />
            <InfoRow label="Discharged" value={patient["Discharge Date"] || "Not yet discharged"} />
          </Section>

          <Section icon={AlertTriangle} title="AI Recommendations">
            <ul className="flex flex-col gap-2">
              {recs.map((r, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span style={{ color: "#F59E0B" }}>●</span>
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
                    <span
                      className="absolute left-[5px] top-3 bottom-0 w-px"
                      style={{ background: "#E4E3F2" }}
                    />
                  )}

                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ background: "#0EA394" }}
                  />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ev.label}</span>
                    <span className="text-xs" style={{ color: "#8B8AA6" }}>
                      {ev.detail} {ev.date && `· ${ev.date}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Mail} title="Automated Outreach Draft">
            <div
              className="border rounded-lg p-3 text-sm bg-white/60"
              style={{ borderColor: "#E4E3F2" }}
            >
              <p className="font-medium mb-1">{email.subject}</p>

              <pre
                className="whitespace-pre-wrap font-sans text-xs leading-relaxed"
                style={{ color: "#2C2C46" }}
              >
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
        <Icon size={15} color="#0EA394" />
        <h3
          className="text-sm font-semibold"
          style={{ color: "#17172C" }}
        >
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      className="flex justify-between text-sm py-1 border-b"
      style={{ borderColor: "#ECEBF7" }}
    >
      <span style={{ color: "#8B8AA6" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

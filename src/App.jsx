import React, { useState, useEffect, useMemo } from "react";
import {
  Shield, ShieldAlert, ShieldCheck, Activity, GitCompare, FlaskConical,
  CheckCircle2, XCircle, AlertTriangle, ListChecks, FileText, Settings,
  ChevronRight, ChevronDown, Play, Info, Clock, Database, Cpu, Hash,
  RefreshCw, Download, Copy, ArrowLeftRight, TrendingUp, Minus, Eye, X,
  Terminal, Radar as RadarIcon, Users, Scale, Fingerprint, ClipboardList,
  ArrowUpRight, Zap, LayoutGrid
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LineChart, Line
} from "recharts";

/* ============================================================================
   DESIGN TOKENS
   Void near-black + glass surfaces, electric violet / cyan accent pair,
   monospace-led technical type system. See design rationale in README notes
   embedded at bottom of file.
=============================================================================*/
const T = {
  void: "#08070C",
  surface: "#0E0D16",
  surface2: "#141320",
  glass: "rgba(255,255,255,0.035)",
  glassHover: "rgba(255,255,255,0.06)",
  hairline: "rgba(255,255,255,0.09)",
  hairlineStrong: "rgba(255,255,255,0.16)",
  violet: "#9B6BFF",
  violetSoft: "rgba(155,107,255,0.14)",
  violetLine: "rgba(155,107,255,0.45)",
  cyan: "#2FE6E0",
  cyanSoft: "rgba(47,230,224,0.12)",
  text: "#EDEBF5",
  textDim: "#8B899F",
  textFaint: "#514F63",
  green: "#3ED598",
  greenSoft: "rgba(62,213,152,0.13)",
  amber: "#F2B94D",
  amberSoft: "rgba(242,185,77,0.13)",
  red: "#FF6B6B",
  redSoft: "rgba(255,107,107,0.13)",
};

const mono = { fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace" };
const sans = { fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" };

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    ::selection { background: ${T.violetSoft}; color: ${T.text}; }
    @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    @keyframes countIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .jg-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
    .jg-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .jg-scrollbar::-webkit-scrollbar-thumb { background: ${T.hairlineStrong}; border-radius: 4px; }
    .jg-fade-up { animation: rise 0.45s ease both; }
  `}</style>
);

/* ============================================================================
   MOCK DATA — clearly labeled DEMO DATA throughout; shaped so a real API
   response could be dropped in without restructuring components.
=============================================================================*/
const RUBRIC = ["Correctness", "Faithfulness", "Completeness", "Instruction Following", "Tone", "Safety"];

const radarData = [
  { criterion: "Correctness", score: 92 },
  { criterion: "Faithfulness", score: 88 },
  { criterion: "Completeness", score: 79 },
  { criterion: "Instr. Follow.", score: 90 },
  { criterion: "Tone", score: 85 },
  { criterion: "Safety", score: 96 },
];

const overviewMetrics = [
  { key: "reliability", label: "Judge Reliability", value: 89, icon: Shield, hint: "composite score" },
  { key: "position", label: "Position Stability", value: 93, icon: ArrowLeftRight, hint: "order agreement rate" },
  { key: "human", label: "Human Agreement", value: 87, icon: Users, hint: "\u03BA = 0.76 vs gold" },
  { key: "adversarial", label: "Adversarial Resistance", value: 88, icon: ShieldAlert, hint: "not fooled rate" },
];

const auditLog = [
  { id: "c_8f2a1", ts: "13:41:02", provider: "anthropic", model: "claude-sonnet-4-6", type: "judge", latency: 812, in: 641, out: 214, status: "ok" },
  { id: "c_7e01c", ts: "13:40:58", provider: "openai", model: "gpt-4.1", type: "generator", latency: 1180, in: 220, out: 340, status: "ok" },
  { id: "c_6d90b", ts: "13:40:41", provider: "anthropic", model: "claude-sonnet-4-6", type: "judge", latency: 940, in: 655, out: 201, status: "retry" },
  { id: "c_5c8fa", ts: "13:40:22", provider: "anthropic", model: "claude-sonnet-4-6", type: "judge", latency: 776, in: 630, out: 198, status: "ok" },
  { id: "c_4b71e", ts: "13:40:05", provider: "openai", model: "gpt-4.1-mini", type: "generator", latency: 640, in: 210, out: 265, status: "ok" },
  { id: "c_3a662", ts: "13:39:47", provider: "anthropic", model: "claude-sonnet-4-6", type: "judge", latency: 1020, in: 648, out: 227, status: "ok" },
  { id: "c_29f51", ts: "13:39:12", provider: "anthropic", model: "claude-sonnet-4-6", type: "judge", latency: 690, in: 601, out: 190, status: "malformed" },
];

const auditDetail = {
  system: "JUDGE_TASK: pointwise\nYou are a strict, careful evaluator of AI system outputs...\n\nRUBRIC:\n### correctness\nDefinition: The factual content of the answer is accurate...",
  user: "INPUT/QUESTION:\nWhat is the capital of Australia?\n\nANSWER TO JUDGE:\nThe capital of Australia is Canberra, not Sydney...",
  raw: '{"criteria_scores":{"correctness":{"score":5,"rationale":"States Canberra, the correct capital, and preempts the common Sydney error."}}, "overall_score":4.8,"pass":true}',
  parsed: { correctness: 5, faithfulness: 5, completeness: 4, instruction_following: 5, tone: 5, safety: 5, overall: 4.8, pass: true },
};

const testRetestRows = [
  { id: "q03", r1: "pass", r2: "pass", r3: "pass", stable: true },
  { id: "q08", r1: "pass", r2: "pass", r3: "pass", stable: true },
  { id: "q09", r1: "fail", r2: "fail", r3: "fail", stable: true },
  { id: "q11", r1: "fail", r2: "pass", r3: "fail", stable: false },
  { id: "q16", r1: "pass", r2: "pass", r3: "pass", stable: true },
  { id: "q17", r1: "fail", r2: "fail", r3: "pass", stable: false },
];

const scoreClusterData = [
  { score: "1", count: 3 },
  { score: "2", count: 6 },
  { score: "3", count: 11 },
  { score: "4", count: 34 },
  { score: "5", count: 46 },
];

const humanVsJudge = [
  { case: "q01", human: 5, judge: 5 },
  { case: "q02", human: 1, judge: 1 },
  { case: "q05", human: 5, judge: 4 },
  { case: "q08", human: 4, judge: 4 },
  { case: "q11", human: 1, judge: 2 },
  { case: "q13", human: 5, judge: 5 },
  { case: "q16", human: 5, judge: 5 },
  { case: "q20", human: 1, judge: 1 },
];

const abScenarios = {
  stable: {
    label: "Scenario 1 \u2014 stable",
    modelA: { name: "MODEL A", sub: "claude-sonnet-4-6 / prompt v2", score: 8.7 },
    modelB: { name: "MODEL B", sub: "gpt-4.1 / prompt v1", score: 8.1 },
    round1: { order: "A \u2192 B", winner: "A" },
    round2: { order: "B \u2192 A", winner: "A" },
    orderAgreement: true,
    flipRate: 4,
    aWins: 17, bWins: 2, ties: 1,
    confidence: 87,
    evidence: [
      { ok: true, label: "Position stable" },
      { ok: true, label: "Gold agreement strong" },
      { ok: true, label: "Test-retest consistent" },
      { ok: false, label: "Verbosity probe requires attention", warn: true },
    ],
    withheld: false,
  },
  flagged: {
    label: "Scenario 2 \u2014 flagged",
    modelA: { name: "MODEL A", sub: "claude-sonnet-4-6 / prompt v2", score: 7.9 },
    modelB: { name: "MODEL B", sub: "gpt-4.1 / prompt v1", score: 7.8 },
    round1: { order: "A \u2192 B", winner: "A" },
    round2: { order: "B \u2192 A", winner: "B" },
    orderAgreement: false,
    flipRate: 38,
    aWins: 10, bWins: 9, ties: 1,
    confidence: 41,
    evidence: [
      { ok: true, label: "Gold agreement strong" },
      { ok: false, label: "Position stability failed" },
      { ok: true, label: "Test-retest consistent" },
      { ok: false, label: "Verbosity probe requires attention", warn: true },
    ],
    withheld: true,
  },
};

const biasExperiments = [
  {
    key: "position",
    title: "POSITION BIAS",
    desc: "Reverse A/B ordering and measure flip rate.",
    icon: ArrowLeftRight,
    before: 21, after: 7, unit: "flip rate",
    methodology: "Every pairwise comparison is judged twice: once as (A, B) and once as (B, A). A 'flip' is when the declared winner changes purely because of slot order. We reconcile by requiring order-agreement; disagreement is scored as a tie rather than guessed.",
    raw: [
      { case: "q04", order1: "A", order2: "A", flipped: false },
      { case: "q07", order1: "A", order2: "B", flipped: true },
      { case: "q12", order1: "B", order2: "B", flipped: false },
      { case: "q15", order1: "A", order2: "A", flipped: false },
    ],
  },
  {
    key: "verbosity",
    title: "VERBOSITY BIAS",
    desc: "Compare a verbose-but-wrong answer against a terse-but-correct answer.",
    icon: FileText,
    stat: 40, unit: "padded answer preferred",
    methodology: "A real answer is padded with fluff that adds no new information, and compared against the unpadded original with slot order alternated. A well-calibrated judge should prefer the padded version at or below chance (\u226450%).",
    raw: [
      { case: "adv02", padded: "not preferred", verdict: "terse correct \u2014 win" },
      { case: "adv04", padded: "preferred", verdict: "padded won on completeness" },
      { case: "adv06", padded: "not preferred", verdict: "terse correct \u2014 win" },
    ],
  },
  {
    key: "sycophancy",
    title: "SYCOPHANCY",
    desc: "Test confidently-wrong answers against correct but less confident answers.",
    icon: Zap,
    stat: 12, unit: "fooled rate",
    methodology: "Adversarial probes pair a confidently worded, factually wrong answer against a terse, hedged, correct one. Judge prompts require every rationale to cite a specific span of the answer or say 'unsupported' \u2014 this measures whether tone alone can still buy a passing grade.",
    raw: [
      { case: "adv01", confident: "wrong", judged: "correctly failed" },
      { case: "adv03", confident: "wrong", judged: "correctly failed" },
      { case: "adv05", confident: "wrong", judged: "incorrectly passed" },
    ],
  },
  {
    key: "clustering",
    title: "SCORE CLUSTERING",
    desc: "Show score distribution across the 1\u20135 rubric.",
    icon: LayoutGrid,
    unit: "distribution",
    methodology: "Few-shot anchor examples for scores 1/3/5 are embedded in the rubric prompt to calibrate the scale. We plot the resulting score histogram \u2014 persistent clustering near 4\u20135 despite anchors is a signal to switch that criterion to pairwise comparison instead.",
    raw: scoreClusterData,
  },
];

const NAV = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "evaluate", label: "Evaluate", icon: FlaskConical },
  { key: "arena", label: "A/B Arena", icon: GitCompare },
  { key: "bias", label: "Bias Lab", icon: ShieldAlert },
  { key: "validation", label: "Judge Validation", icon: ListChecks },
  { key: "audit", label: "Audit Trail", icon: Terminal },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

/* ============================================================================
   PRIMITIVES
=============================================================================*/
function CountUp({ value, duration = 700, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{n}{suffix}</span>;
}

function Eyebrow({ children, color = T.violet }) {
  return (
    <div style={{ ...mono, color, fontSize: 11, letterSpacing: "0.16em" }} className="uppercase font-semibold flex items-center gap-2">
      <span style={{ width: 14, height: 1, background: color, display: "inline-block" }} />
      {children}
    </div>
  );
}

function GlassPanel({ children, style, className = "", glow }) {
  return (
    <div
      className={className}
      style={{
        background: T.glass,
        border: `1px solid ${T.hairline}`,
        backdropFilter: "blur(14px)",
        borderRadius: 6,
        position: "relative",
        boxShadow: glow ? `0 0 0 1px ${T.hairline}, 0 24px 60px -20px ${glow}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint, accent = T.violet }) {
  return (
    <GlassPanel style={{ padding: "18px 18px 16px" }} className="jg-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.1em", color: T.textDim }} className="uppercase">{label}</div>
        <Icon size={15} color={accent} strokeWidth={2} />
      </div>
      <div style={{ ...mono, fontSize: 32, fontWeight: 600, color: T.text, lineHeight: 1 }}>
        <CountUp value={value} suffix="%" />
      </div>
      <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginTop: 6 }}>{hint}</div>
      <div style={{ marginTop: 12, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: `linear-gradient(90deg, ${accent}, ${T.cyan})`, transition: "width 1s ease" }} />
      </div>
    </GlassPanel>
  );
}

function StatusPill({ ok, warn, label }) {
  const color = warn ? T.amber : ok ? T.green : T.red;
  const Icon = warn ? AlertTriangle : ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-center gap-2" style={{ ...sans, fontSize: 13, color: T.text }}>
      <Icon size={15} color={color} strokeWidth={2.2} />
      <span>{label}</span>
    </div>
  );
}

function SectionHeading({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-6 jg-fade-up">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon size={14} color={T.textDim} />}
        <h2 style={{ ...mono, color: T.text, fontSize: 13, letterSpacing: "0.08em" }} className="uppercase font-semibold">{title}</h2>
      </div>
      {subtitle && <p style={{ ...sans, color: T.textDim, fontSize: 13.5 }}>{subtitle}</p>}
    </div>
  );
}

/* ============================================================================
   TRUST GATE — signature component
=============================================================================*/
function TrustGate({ evidence, allowed, verdictLabel, sub }) {
  const color = allowed ? T.green : T.red;
  return (
    <GlassPanel
      glow={allowed ? "rgba(62,213,152,0.12)" : "rgba(255,107,107,0.14)"}
      style={{ padding: 0, overflow: "hidden" }}
      className="jg-fade-up"
    >
      <div style={{ position: "relative", overflow: "hidden", padding: "16px 20px", borderBottom: `1px solid ${T.hairline}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint size={15} color={color} />
            <span style={{ ...mono, fontSize: 12, letterSpacing: "0.14em", color: T.text }} className="uppercase font-semibold">Trust Gate</span>
          </div>
          <span
            style={{
              ...mono, fontSize: 10, letterSpacing: "0.1em", color,
              border: `1px solid ${color}55`, background: allowed ? T.greenSoft : T.redSoft,
              padding: "3px 8px", borderRadius: 3,
            }}
            className="uppercase"
          >
            {allowed ? "verdict allowed" : "verdict blocked"}
          </span>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div className="flex flex-col gap-2.5 mb-5">
          {evidence.map((e, i) => (
            <StatusPill key={i} ok={e.ok} warn={e.warn} label={e.label} />
          ))}
        </div>

        <div
          style={{
            border: `1px solid ${color}44`,
            background: `linear-gradient(180deg, ${allowed ? T.greenSoft : T.redSoft}, transparent)`,
            borderRadius: 4,
            padding: "14px 16px",
          }}
        >
          <div style={{ ...mono, color, fontSize: 18, fontWeight: 700, letterSpacing: "0.03em" }}>
            {verdictLabel}
          </div>
          <div style={{ ...sans, color: T.textDim, fontSize: 12.5, marginTop: 4 }}>{sub}</div>
        </div>
      </div>
    </GlassPanel>
  );
}

/* ============================================================================
   VERDICT TERMINAL
=============================================================================*/
function VerdictTerminal({ scenario }) {
  const { modelA, modelB, confidence, withheld } = scenario;
  return (
    <GlassPanel style={{ padding: 0, overflow: "hidden" }} glow="rgba(155,107,255,0.10)">
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.hairline}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, animation: "pulseDot 2s infinite" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.amber }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
        <span style={{ ...mono, color: T.textFaint, fontSize: 11, marginLeft: 6 }}>evaluation_verdict.term</span>
      </div>

      <div style={{ padding: "22px 24px" }}>
        <div className="grid grid-cols-3 items-center">
          <div>
            <div style={{ ...mono, fontSize: 10.5, color: T.textDim, letterSpacing: "0.1em" }} className="uppercase">{modelA.name}</div>
            <div style={{ ...mono, fontSize: 36, color: T.text, fontWeight: 700 }}>{modelA.score}<span style={{ fontSize: 16, color: T.textFaint }}>/10</span></div>
            <div style={{ ...sans, fontSize: 11, color: T.textFaint, marginTop: 2 }}>{modelA.sub}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span style={{ ...mono, color: T.textFaint, fontSize: 11 }}>VS</span>
            <ArrowLeftRight size={16} color={T.violet} style={{ marginTop: 6 }} />
          </div>
          <div className="text-right">
            <div style={{ ...mono, fontSize: 10.5, color: T.textDim, letterSpacing: "0.1em" }} className="uppercase">{modelB.name}</div>
            <div style={{ ...mono, fontSize: 36, color: T.text, fontWeight: 700 }}>{modelB.score}<span style={{ fontSize: 16, color: T.textFaint }}>/10</span></div>
            <div style={{ ...sans, fontSize: 11, color: T.textFaint, marginTop: 2 }}>{modelB.sub}</div>
          </div>
        </div>

        <div style={{ height: 1, background: T.hairline, margin: "20px 0" }} />

        {!withheld ? (
          <div className="flex items-center justify-between jg-fade-up">
            <div>
              <div style={{ ...mono, fontSize: 11, color: T.textDim, letterSpacing: "0.1em" }} className="uppercase">Winner</div>
              <div style={{ ...mono, fontSize: 22, color: T.green, fontWeight: 700 }}>{modelA.score > modelB.score ? modelA.name : modelB.name}</div>
            </div>
            <div className="text-right">
              <div style={{ ...mono, fontSize: 11, color: T.textDim, letterSpacing: "0.1em" }} className="uppercase">Confidence</div>
              <div style={{ ...mono, fontSize: 22, color: T.text, fontWeight: 700 }}><CountUp value={confidence} suffix="%" /></div>
            </div>
          </div>
        ) : (
          <div className="jg-fade-up" style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ ...mono, fontSize: 20, color: T.red, fontWeight: 700, letterSpacing: "0.04em" }}>VERDICT WITHHELD</div>
            <div style={{ ...sans, fontSize: 13, color: T.textDim, marginTop: 6 }}>
              Judge disagreement is too high. Human review recommended.
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

/* ============================================================================
   LOADING SEQUENCE (Evaluate page)
=============================================================================*/
function EvalLoadingSequence({ onDone }) {
  const steps = ["Parsing input", "Running judge", "Validating JSON", "Calculating score", "Recording audit trail"];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= steps.length) { const t = setTimeout(onDone, 350); return () => clearTimeout(t); }
    const t = setTimeout(() => setIdx((i) => i + 1), 420);
    return () => clearTimeout(t);
  }, [idx]);
  return (
    <div style={{ padding: "22px 4px" }}>
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3" style={{ padding: "7px 0", opacity: i <= idx ? 1 : 0.28, transition: "opacity 0.3s" }}>
          {i < idx ? <CheckCircle2 size={14} color={T.green} /> : i === idx ? <RefreshCw size={14} color={T.violet} style={{ animation: "spin 1s linear infinite" }} /> : <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1px solid ${T.hairlineStrong}` }} />}
          <span style={{ ...mono, fontSize: 12.5, color: i <= idx ? T.text : T.textFaint }}>{s}</span>
          {i < steps.length - 1 && <span style={{ color: T.textFaint }}>{i === idx ? "" : ""}</span>}
        </div>
      ))}
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

/* ============================================================================
   PAGE: OVERVIEW
=============================================================================*/
function PageOverview() {
  return (
    <div className="jg-fade-up">
      <div className="mb-8">
        <Eyebrow>Bias-aware LLM evaluation lab</Eyebrow>
        <h1 style={{ ...sans, color: T.text, fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 10, lineHeight: 1.1 }}>
          Can we trust the judge?
        </h1>
        <p style={{ ...sans, color: T.textDim, fontSize: 14.5, marginTop: 10, maxWidth: 620 }}>
          Evaluate model quality. Stress-test evaluator bias. Measure reliability before making a decision.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {overviewMetrics.map((m) => <MetricCard key={m.key} {...m} />)}
      </div>

      <div className="grid grid-cols-5 gap-5 mb-8">
        <GlassPanel style={{ padding: 22, gridColumn: "span 3" }}>
          <div className="flex items-center justify-between mb-1">
            <SectionHeading title="Reliability Radar" subtitle="Composite score across the six-criterion rubric, current judge configuration." icon={RadarIcon} />
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke={T.hairline} />
                <PolarAngleAxis dataKey="criterion" tick={{ fill: T.textDim, fontSize: 10.5, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="score" stroke={T.violet} fill={T.violet} fillOpacity={0.28} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <div style={{ gridColumn: "span 2" }} className="flex flex-col gap-5">
          <GlassPanel style={{ padding: 20 }}>
            <Eyebrow color={T.cyan}>Latest evaluation</Eyebrow>
            <div style={{ ...sans, color: T.text, fontSize: 13.5, marginTop: 10 }}>
              "Context: return policy allows returns within 30 days..." <span style={{ color: T.textFaint }}>(q19)</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span style={{ ...mono, fontSize: 26, color: T.green, fontWeight: 700 }}>4.8<span style={{ fontSize: 13, color: T.textFaint }}>/5</span></span>
              <span style={{ ...mono, fontSize: 11, color: T.green, background: T.greenSoft, border: `1px solid ${T.green}44`, padding: "3px 8px", borderRadius: 3 }} className="uppercase">passed</span>
            </div>
          </GlassPanel>

          <GlassPanel style={{ padding: 20 }}>
            <Eyebrow color={T.amber}>Bias status</Eyebrow>
            <div className="flex flex-col gap-2 mt-3">
              <StatusPill ok label="Position bias: 7% flip rate" />
              <StatusPill warn label="Verbosity: 40% padded preference" />
              <StatusPill ok label="Sycophancy: 12% fooled rate" />
            </div>
          </GlassPanel>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <GlassPanel style={{ padding: 20, gridColumn: "span 2" }}>
          <Eyebrow>A/B comparison summary</Eyebrow>
          <div className="flex items-center justify-between mt-4">
            <div>
              <div style={{ ...mono, fontSize: 20, color: T.text, fontWeight: 700 }}>MODEL A</div>
              <div style={{ ...sans, fontSize: 11.5, color: T.textFaint }}>17 wins &middot; 87% confidence</div>
            </div>
            <TrendingUp size={22} color={T.green} />
          </div>
        </GlassPanel>

        <GlassPanel style={{ padding: 20, gridColumn: "span 1" }}>
          <Eyebrow color={T.cyan}>Validation</Eyebrow>
          <div style={{ ...mono, fontSize: 24, color: T.text, fontWeight: 700, marginTop: 8 }}>0.76</div>
          <div style={{ ...sans, fontSize: 11, color: T.textFaint }}>Cohen's \u03BA vs gold</div>
        </GlassPanel>

        <GlassPanel style={{ padding: 20, gridColumn: "span 2" }}>
          <Eyebrow color={T.violet}>Recent audit events</Eyebrow>
          <div className="flex flex-col gap-2 mt-3">
            {auditLog.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between" style={{ ...mono, fontSize: 11 }}>
                <span style={{ color: T.textDim }}>{a.id}</span>
                <span style={{ color: T.textFaint }}>{a.type}</span>
                <span style={{ color: a.status === "ok" ? T.green : T.amber }}>{a.status}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: EVALUATE
=============================================================================*/
function PageEvaluate() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(true);
  const [expanded, setExpanded] = useState({ correctness: true });

  const criteria = [
    { key: "correctness", score: 9, rationale: "Answer correctly explains the concept of a hash table and its O(1) average lookup, matching the reference definition." },
    { key: "faithfulness", score: 9, rationale: "All claims are grounded in the given input; no invented details about performance characteristics." },
    { key: "completeness", score: 8, rationale: "Covers definition, mechanism, and lookup speed; omits collision handling, which is a minor gap." },
    { key: "instruction_following", score: 10, rationale: "Stays under the 100-word limit and uses the requested beginner-friendly analogy." },
    { key: "tone", score: 9, rationale: "Simple, approachable language appropriate for a beginner audience." },
    { key: "safety", score: 10, rationale: "No safety concerns present." },
  ];

  const run = () => { setDone(false); setRunning(true); };

  return (
    <div className="jg-fade-up">
      <SectionHeading title="Evaluate" subtitle="Score a single model output against the rubric with a live judge call." icon={FlaskConical} />

      <div className="grid grid-cols-2 gap-6">
        <GlassPanel style={{ padding: 22 }}>
          <Eyebrow>Input</Eyebrow>
          <textarea
            defaultValue="Explain what a hash table is to a beginner programmer."
            style={{ ...sans, width: "100%", background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, color: T.text, fontSize: 13, padding: 10, marginTop: 8, resize: "none" }}
            rows={2}
          />
          <Eyebrow color={T.cyan}>Expected answer <span style={{ color: T.textFaint, textTransform: "none", letterSpacing: 0 }}>(optional)</span></Eyebrow>
          <textarea
            defaultValue="A data structure mapping keys to values via a hash function for near O(1) lookup."
            style={{ ...sans, width: "100%", background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, color: T.text, fontSize: 13, padding: 10, marginTop: 8, resize: "none" }}
            rows={2}
          />
          <Eyebrow color={T.violet}>Model output</Eyebrow>
          <textarea
            defaultValue="A hash table is like a wall of labeled cubbyholes at a post office. To store a package (value), you compute which cubby it goes in from its address label (key) using a hash function. To retrieve it, you compute the same formula and go straight there instead of checking every cubby."
            style={{ ...sans, width: "100%", background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, color: T.text, fontSize: 13, padding: 10, marginTop: 8, resize: "none" }}
            rows={4}
          />
          <Eyebrow color={T.amber}>Evaluation criteria</Eyebrow>
          <div className="flex flex-wrap gap-2 mt-2 mb-5">
            {RUBRIC.map((c) => (
              <span key={c} style={{ ...mono, fontSize: 10.5, color: T.text, background: T.violetSoft, border: `1px solid ${T.violetLine}`, padding: "4px 9px", borderRadius: 3 }}>{c}</span>
            ))}
          </div>

          <button
            onClick={run}
            style={{ ...mono, background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, color: "#0A0812", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.05em", padding: "11px 18px", borderRadius: 4, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            className="uppercase"
          >
            <Play size={13} /> Run Evaluation
          </button>

          {running && !done && <EvalLoadingSequence onDone={() => { setRunning(false); setDone(true); }} />}
        </GlassPanel>

        <GlassPanel style={{ padding: 22 }} glow={done ? "rgba(155,107,255,0.10)" : undefined}>
          <div className="flex items-center justify-between mb-1">
            <Eyebrow color={T.green}>Judge verdict</Eyebrow>
            {done && <span style={{ ...mono, fontSize: 10.5, color: T.textDim }}>confidence: 92%</span>}
          </div>

          {!done ? (
            <div style={{ ...sans, color: T.textFaint, fontSize: 13, padding: "40px 0", textAlign: "center" }}>Awaiting evaluation run&hellip;</div>
          ) : (
            <div className="jg-fade-up">
              <div className="flex items-end gap-2 mt-3 mb-5">
                <span style={{ ...mono, fontSize: 38, color: T.text, fontWeight: 700 }}>9.2</span>
                <span style={{ ...mono, fontSize: 14, color: T.textFaint, marginBottom: 6 }}>/ 10 overall</span>
              </div>

              <div className="flex flex-col gap-2">
                {criteria.map((c) => (
                  <div key={c.key} style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, overflow: "hidden" }}>
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [c.key]: !e[c.key] }))}
                      style={{ width: "100%", background: T.glass, border: "none", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    >
                      <span style={{ ...sans, fontSize: 12.5, color: T.text, textTransform: "capitalize" }}>{c.key.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ ...mono, fontSize: 12.5, color: c.score >= 8 ? T.green : c.score >= 5 ? T.amber : T.red, fontWeight: 700 }}>{c.score}/10</span>
                        {expanded[c.key] ? <ChevronDown size={13} color={T.textFaint} /> : <ChevronRight size={13} color={T.textFaint} />}
                      </div>
                    </button>
                    {expanded[c.key] && (
                      <div style={{ padding: "0 12px 12px", ...sans, fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>
                        &ldquo;{c.rationale}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: A/B ARENA
=============================================================================*/
function PageArena() {
  const [scenarioKey, setScenarioKey] = useState("stable");
  const s = abScenarios[scenarioKey];

  return (
    <div className="jg-fade-up">
      <div className="flex items-center justify-between mb-1">
        <div>
          <Eyebrow color={T.cyan}>A/B Arena</Eyebrow>
          <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6 }}>Which model should ship?</h2>
        </div>
        <div className="flex gap-2">
          {Object.entries(abScenarios).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setScenarioKey(k)}
              style={{
                ...mono, fontSize: 11, padding: "7px 12px", borderRadius: 4, cursor: "pointer",
                background: scenarioKey === k ? T.violetSoft : "transparent",
                border: `1px solid ${scenarioKey === k ? T.violetLine : T.hairline}`,
                color: scenarioKey === k ? T.text : T.textDim,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-6">
        <div style={{ gridColumn: "span 2" }} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel style={{ padding: 18 }}>
              <Eyebrow>Model A answer</Eyebrow>
              <p style={{ ...sans, fontSize: 12.5, color: T.textDim, marginTop: 8, lineHeight: 1.55 }}>
                "The context doesn't include Q2 figures, so I can't determine whether Q3 was more or less profitable than Q2."
              </p>
            </GlassPanel>
            <GlassPanel style={{ padding: 18 }}>
              <Eyebrow color={T.cyan}>Model B answer</Eyebrow>
              <p style={{ ...sans, fontSize: 12.5, color: T.textDim, marginTop: 8, lineHeight: 1.55 }}>
                "Yes, Q3 was more profitable than Q2, continuing the company's strong upward trend."
              </p>
            </GlassPanel>
          </div>

          <GlassPanel style={{ padding: 22 }}>
            <Eyebrow color={T.amber}>Two-order experiment</Eyebrow>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 14 }}>
                <div style={{ ...mono, fontSize: 10.5, color: T.textFaint }} className="uppercase">Round 1</div>
                <div style={{ ...mono, fontSize: 15, color: T.text, marginTop: 4 }}>{s.round1.order}</div>
                <div style={{ ...mono, fontSize: 12.5, color: T.green, marginTop: 6 }}>Winner: {s.round1.winner}</div>
              </div>
              <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 14 }}>
                <div style={{ ...mono, fontSize: 10.5, color: T.textFaint }} className="uppercase">Round 2</div>
                <div style={{ ...mono, fontSize: 15, color: T.text, marginTop: 4 }}>{s.round2.order}</div>
                <div style={{ ...mono, fontSize: 12.5, color: s.orderAgreement ? T.green : T.red, marginTop: 6 }}>Winner: {s.round2.winner}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5" style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 14 }}>
              <span style={{ ...mono, fontSize: 12, letterSpacing: "0.08em", color: s.orderAgreement ? T.green : T.red }} className="uppercase font-semibold">
                Order agreement: {s.orderAgreement ? "PASS" : "FAIL"}
              </span>
              {!s.orderAgreement && (
                <span style={{ ...sans, fontSize: 12, color: T.red }}>Position bias detected \u2014 winner withheld.</span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { label: "A wins", v: s.aWins, c: T.green },
                { label: "B wins", v: s.bWins, c: T.cyan },
                { label: "Tie", v: s.ties, c: T.textDim },
                { label: "Flip rate", v: `${s.flipRate}%`, c: s.flipRate > 30 ? T.red : T.amber },
              ].map((x) => (
                <div key={x.label} style={{ textAlign: "center", border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "10px 4px" }}>
                  <div style={{ ...mono, fontSize: 16, color: x.c, fontWeight: 700 }}>{x.v}</div>
                  <div style={{ ...sans, fontSize: 10, color: T.textFaint, marginTop: 2 }}>{x.label}</div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <div className="grid grid-cols-3 gap-4">
            <GlassPanel style={{ padding: 16 }}>
              <div style={{ ...mono, fontSize: 10.5, color: T.textFaint }} className="uppercase">Judge 1</div>
              <div style={{ ...sans, fontSize: 12, color: T.text, marginTop: 4 }}>claude-sonnet-4-6</div>
            </GlassPanel>
            <GlassPanel style={{ padding: 16 }}>
              <div style={{ ...mono, fontSize: 10.5, color: T.textFaint }} className="uppercase">Judge 2</div>
              <div style={{ ...sans, fontSize: 12, color: T.text, marginTop: 4 }}>claude-sonnet-4-6 (order swap)</div>
            </GlassPanel>
            <GlassPanel style={{ padding: 16 }}>
              <div style={{ ...mono, fontSize: 10.5, color: T.textFaint }} className="uppercase">Reconciliation</div>
              <div style={{ ...sans, fontSize: 12, color: s.orderAgreement ? T.green : T.red, marginTop: 4 }}>{s.orderAgreement ? "Agreement required \u2014 met" : "Agreement required \u2014 not met"}</div>
            </GlassPanel>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <VerdictTerminal scenario={s} />
          <TrustGate
            evidence={s.evidence}
            allowed={!s.withheld}
            verdictLabel={s.withheld ? "HUMAN REVIEW REQUIRED" : `${s.modelA.score > s.modelB.score ? "MODEL A" : "MODEL B"} MAY SHIP`}
            sub={s.withheld ? "Evidence insufficient to declare a winner." : "All reliability checks cleared threshold."}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: BIAS LAB
=============================================================================*/
function ExperimentCard({ exp }) {
  const [openMethod, setOpenMethod] = useState(false);
  const [openRaw, setOpenRaw] = useState(false);
  const [ran, setRan] = useState(true);
  const Icon = exp.icon;

  return (
    <GlassPanel style={{ padding: 20 }} className="jg-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={15} color={T.violet} />
          <span style={{ ...mono, fontSize: 12, letterSpacing: "0.08em", color: T.text }} className="uppercase font-semibold">{exp.title}</span>
        </div>
      </div>
      <p style={{ ...sans, fontSize: 12.5, color: T.textDim, lineHeight: 1.5, marginBottom: 16 }}>{exp.desc}</p>

      {exp.key === "clustering" ? (
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exp.raw}>
              <CartesianGrid stroke={T.hairline} vertical={false} />
              <XAxis dataKey="score" tick={{ fill: T.textDim, fontSize: 10.5, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: T.hairline }} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {exp.raw.map((d, i) => <Cell key={i} fill={i >= 3 ? T.violet : T.cyan} fillOpacity={i >= 3 ? 0.9 : 0.5} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ ...sans, fontSize: 11, color: T.amber, marginTop: 4 }}>Scores cluster at 4\u20135 &mdash; anchors help but don't fully flatten the distribution.</div>
        </div>
      ) : exp.before !== undefined ? (
        <div className="grid grid-cols-2 gap-3">
          <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 12 }}>
            <div style={{ ...mono, fontSize: 10, color: T.textFaint }} className="uppercase">Before mitigation</div>
            <div style={{ ...mono, fontSize: 22, color: T.red, fontWeight: 700, marginTop: 4 }}>{exp.before}%</div>
          </div>
          <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 12 }}>
            <div style={{ ...mono, fontSize: 10, color: T.textFaint }} className="uppercase">After mitigation</div>
            <div style={{ ...mono, fontSize: 22, color: T.green, fontWeight: 700, marginTop: 4 }}>{exp.after}%</div>
          </div>
        </div>
      ) : (
        <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 14 }}>
          <div style={{ ...mono, fontSize: 26, color: exp.stat > 25 ? T.amber : T.green, fontWeight: 700 }}><CountUp value={exp.stat} suffix="%" /></div>
          <div style={{ ...sans, fontSize: 11, color: T.textFaint, marginTop: 2 }} className="capitalize">{exp.unit}</div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4" style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 12 }}>
        <button onClick={() => setRan(true)} style={{ ...mono, fontSize: 10.5, color: "#0A0812", background: T.cyan, border: "none", padding: "6px 11px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} className="uppercase font-semibold">
          <Play size={11} /> Run Test
        </button>
        <button onClick={() => setOpenMethod((o) => !o)} style={{ ...mono, fontSize: 10.5, color: T.textDim, background: "transparent", border: `1px solid ${T.hairline}`, padding: "6px 11px", borderRadius: 3, cursor: "pointer" }}>
          View methodology
        </button>
        <button onClick={() => setOpenRaw((o) => !o)} style={{ ...mono, fontSize: 10.5, color: T.textDim, background: "transparent", border: `1px solid ${T.hairline}`, padding: "6px 11px", borderRadius: 3, cursor: "pointer" }}>
          View raw results
        </button>
      </div>

      {openMethod && (
        <div className="jg-fade-up" style={{ marginTop: 12, background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 12, ...sans, fontSize: 12, color: T.textDim, lineHeight: 1.55 }}>
          {exp.methodology}
        </div>
      )}
      {openRaw && (
        <div className="jg-fade-up jg-scrollbar" style={{ marginTop: 12, background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 12, ...mono, fontSize: 10.5, color: T.textDim, maxHeight: 140, overflowY: "auto" }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(exp.raw, null, 2)}</pre>
        </div>
      )}
    </GlassPanel>
  );
}

function PageBiasLab() {
  return (
    <div className="jg-fade-up">
      <Eyebrow color={T.red}>Bias Lab</Eyebrow>
      <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 4 }}>Attack the evaluator before trusting it.</h2>
      <p style={{ ...sans, color: T.textDim, fontSize: 13, marginBottom: 24, maxWidth: 640 }}>
        Each experiment below deliberately tries to fool the judge along one known bias axis, then measures whether it worked.
      </p>
      <div className="grid grid-cols-2 gap-5">
        {biasExperiments.map((exp) => <ExperimentCard key={exp.key} exp={exp} />)}
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: JUDGE VALIDATION
=============================================================================*/
function PageValidation() {
  return (
    <div className="jg-fade-up">
      <Eyebrow color={T.cyan}>Judge Validation</Eyebrow>
      <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 20 }}>Who judges the judge?</h2>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <GlassPanel style={{ padding: 20 }}>
          <Eyebrow>Gold Agreement</Eyebrow>
          <div style={{ ...mono, fontSize: 30, color: T.text, fontWeight: 700, marginTop: 8 }}><CountUp value={87} suffix="%" /></div>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ ...sans, fontSize: 11.5, color: T.textFaint }}>Cohen's \u03BA</span>
            <span style={{ ...mono, fontSize: 13, color: T.green, fontWeight: 700 }}>0.76</span>
          </div>
        </GlassPanel>
        <GlassPanel style={{ padding: 20 }}>
          <Eyebrow color={T.cyan}>Test-Retest Consistency</Eyebrow>
          <div style={{ ...mono, fontSize: 30, color: T.text, fontWeight: 700, marginTop: 8 }}><CountUp value={92} suffix="%" /></div>
          <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginTop: 8 }}>stable verdicts across reruns</div>
        </GlassPanel>
        <GlassPanel style={{ padding: 20 }}>
          <Eyebrow color={T.amber}>Adversarial Resistance</Eyebrow>
          <div style={{ ...mono, fontSize: 30, color: T.text, fontWeight: 700, marginTop: 8 }}><CountUp value={88} suffix="%" /></div>
          <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginTop: 8 }}>probes not fooling the judge</div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <GlassPanel style={{ padding: 20, gridColumn: "span 2" }}>
          <Eyebrow>Human vs Judge</Eyebrow>
          <div style={{ height: 200, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={humanVsJudge}>
                <CartesianGrid stroke={T.hairline} vertical={false} />
                <XAxis dataKey="case" tick={{ fill: T.textFaint, fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: T.hairline }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="human" stroke={T.cyan} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="judge" stroke={T.violet} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, background: T.cyan, display: "inline-block", borderRadius: "50%" }} /><span style={{ ...sans, fontSize: 11, color: T.textDim }}>Human</span></div>
            <div className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, background: T.violet, display: "inline-block", borderRadius: "50%" }} /><span style={{ ...sans, fontSize: 11, color: T.textDim }}>Judge</span></div>
          </div>
        </GlassPanel>

        <GlassPanel style={{ padding: 20, gridColumn: "span 3" }}>
          <Eyebrow color={T.violet}>Test-retest table</Eyebrow>
          <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ ...mono, fontSize: 10, color: T.textFaint, textAlign: "left" }} className="uppercase">
                <th style={{ padding: "6px 4px", fontWeight: 500 }}>Case</th>
                <th style={{ padding: "6px 4px", fontWeight: 500 }}>Run 1</th>
                <th style={{ padding: "6px 4px", fontWeight: 500 }}>Run 2</th>
                <th style={{ padding: "6px 4px", fontWeight: 500 }}>Run 3</th>
                <th style={{ padding: "6px 4px", fontWeight: 500 }}>Stable?</th>
              </tr>
            </thead>
            <tbody>
              {testRetestRows.map((r) => (
                <tr key={r.id} style={{ borderTop: `1px solid ${T.hairline}` }}>
                  <td style={{ ...mono, fontSize: 11.5, color: T.text, padding: "8px 4px" }}>{r.id}</td>
                  {[r.r1, r.r2, r.r3].map((v, i) => (
                    <td key={i} style={{ ...mono, fontSize: 11.5, padding: "8px 4px", color: v === "pass" ? T.green : T.red }} className="capitalize">{v}</td>
                  ))}
                  <td style={{ padding: "8px 4px" }}>
                    {r.stable ? <CheckCircle2 size={14} color={T.green} /> : <XCircle size={14} color={T.red} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: AUDIT TRAIL
=============================================================================*/
function PageAudit() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="jg-fade-up">
      <Eyebrow color={T.violet}>Audit Trail</Eyebrow>
      <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 4 }}>Every LLM call, traceable.</h2>
      <p style={{ ...sans, color: T.textDim, fontSize: 13, marginBottom: 20 }}>Click a row to inspect the full prompt, raw response, and parsed verdict.</p>

      <GlassPanel style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ ...mono, fontSize: 10, color: T.textFaint, textAlign: "left", background: T.surface2 }} className="uppercase">
              {["Call ID", "Timestamp", "Provider", "Model", "Type", "Latency", "In Tok", "Out Tok", "Status"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLog.map((a) => (
              <tr key={a.id} onClick={() => setSelected(a)} style={{ borderTop: `1px solid ${T.hairline}`, cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.glassHover}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ ...mono, fontSize: 11.5, color: T.violet, padding: "10px 12px" }}>{a.id}</td>
                <td style={{ ...mono, fontSize: 11.5, color: T.textDim, padding: "10px 12px" }}>{a.ts}</td>
                <td style={{ ...sans, fontSize: 11.5, color: T.text, padding: "10px 12px" }}>{a.provider}</td>
                <td style={{ ...mono, fontSize: 11, color: T.textDim, padding: "10px 12px" }}>{a.model}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ ...mono, fontSize: 10, padding: "2px 7px", borderRadius: 3, background: a.type === "judge" ? T.violetSoft : T.cyanSoft, color: a.type === "judge" ? T.violet : T.cyan }} className="uppercase">{a.type}</span>
                </td>
                <td style={{ ...mono, fontSize: 11.5, color: T.textDim, padding: "10px 12px" }}>{a.latency}ms</td>
                <td style={{ ...mono, fontSize: 11.5, color: T.textFaint, padding: "10px 12px" }}>{a.in}</td>
                <td style={{ ...mono, fontSize: 11.5, color: T.textFaint, padding: "10px 12px" }}>{a.out}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ ...mono, fontSize: 10, color: a.status === "ok" ? T.green : a.status === "retry" ? T.amber : T.red }} className="uppercase">{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassPanel>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(4,3,8,0.7)", backdropFilter: "blur(3px)", zIndex: 50, display: "flex", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="jg-scrollbar" style={{ width: 480, height: "100%", background: T.surface, borderLeft: `1px solid ${T.hairlineStrong}`, padding: 24, overflowY: "auto", animation: "rise 0.25s ease" }}>
            <div className="flex items-center justify-between mb-5">
              <span style={{ ...mono, fontSize: 13, color: T.text }}>{selected.id}</span>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={16} color={T.textDim} /></button>
            </div>

            {[
              ["System Prompt", auditDetail.system],
              ["User Prompt", auditDetail.user],
              ["Raw Response", auditDetail.raw],
            ].map(([label, content]) => (
              <div key={label} className="mb-5">
                <Eyebrow color={T.cyan}>{label}</Eyebrow>
                <pre style={{ ...mono, fontSize: 10.5, color: T.textDim, background: T.surface2, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: 10, marginTop: 6, whiteSpace: "pre-wrap", maxHeight: 140, overflowY: "auto" }} className="jg-scrollbar">{content}</pre>
              </div>
            ))}

            <Eyebrow color={T.violet}>Parsed Verdict</Eyebrow>
            <div className="grid grid-cols-2 gap-2 mt-2 mb-5">
              {Object.entries(auditDetail.parsed).filter(([k]) => k !== "overall" && k !== "pass").map(([k, v]) => (
                <div key={k} style={{ border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "8px 10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ ...sans, fontSize: 11, color: T.textDim }} className="capitalize">{k}</span>
                  <span style={{ ...mono, fontSize: 11.5, color: T.text }}>{v}/5</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <Eyebrow>Token Usage</Eyebrow>
                <div style={{ ...mono, fontSize: 13, color: T.text, marginTop: 6 }}>{selected.in} in / {selected.out} out</div>
              </div>
              <div>
                <Eyebrow color={T.amber}>Latency</Eyebrow>
                <div style={{ ...mono, fontSize: 13, color: T.text, marginTop: 6 }}>{selected.latency}ms</div>
              </div>
            </div>

            <button style={{ ...mono, width: "100%", fontSize: 11.5, color: T.text, background: "transparent", border: `1px solid ${T.hairlineStrong}`, borderRadius: 4, padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} className="uppercase">
              <RefreshCw size={12} /> Replay call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   PAGE: REPORTS
=============================================================================*/
function PageReports() {
  const rows = [
    ["A/B Winner", "MODEL A", T.green],
    ["Position Bias (flip rate)", "7%", T.green],
    ["Verbosity Bias", "40% padded preference", T.amber],
    ["Sycophancy (fooled rate)", "12%", T.green],
    ["Gold Agreement", "87%", T.green],
    ["Cohen's Kappa", "0.76", T.green],
    ["Test-Retest Consistency", "92%", T.green],
    ["Adversarial Fooled Rate", "12%", T.green],
    ["Token Usage", "132,904 total", T.textDim],
    ["p50 / p95 Latency", "780ms / 1180ms", T.textDim],
  ];
  return (
    <div className="jg-fade-up">
      <Eyebrow>Reports</Eyebrow>
      <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 20 }}>Evaluation Summary</h2>

      <div className="grid grid-cols-5 gap-5">
        <GlassPanel style={{ padding: 0, gridColumn: "span 3", overflow: "hidden" }}>
          {rows.map(([label, value, color], i) => (
            <div key={label} className="flex items-center justify-between" style={{ padding: "13px 18px", borderTop: i ? `1px solid ${T.hairline}` : "none" }}>
              <span style={{ ...sans, fontSize: 13, color: T.textDim }}>{label}</span>
              <span style={{ ...mono, fontSize: 13, color, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </GlassPanel>

        <div style={{ gridColumn: "span 2" }} className="flex flex-col gap-4">
          <GlassPanel style={{ padding: 20 }}>
            <Eyebrow color={T.cyan}>Export</Eyebrow>
            <div className="flex flex-col gap-2 mt-3">
              <button style={{ ...mono, fontSize: 11.5, color: T.text, background: "transparent", border: `1px solid ${T.hairlineStrong}`, borderRadius: 4, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                <span className="flex items-center gap-2"><Download size={13} /> Export JSON</span>
              </button>
              <button style={{ ...mono, fontSize: 11.5, color: T.text, background: "transparent", border: `1px solid ${T.hairlineStrong}`, borderRadius: 4, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                <span className="flex items-center gap-2"><Download size={13} /> Export CSV</span>
              </button>
              <button style={{ ...mono, fontSize: 11.5, color: "#0A0812", background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, border: "none", borderRadius: 4, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontWeight: 700 }} className="uppercase">
                <FileText size={13} /> Generate Report
              </button>
            </div>
          </GlassPanel>
          <GlassPanel style={{ padding: 18 }}>
            <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, lineHeight: 1.5 }}>
              Reports are demo-data previews in this build. Wire the export actions to <span style={{ ...mono, color: T.textDim }}>reports/*.json</span> from the pipeline to make them real.
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE: SETTINGS
=============================================================================*/
function PageSettings() {
  const fields = [
    { label: "Judge provider", value: "anthropic" },
    { label: "Judge model", value: "claude-sonnet-4-6" },
    { label: "Generator provider", value: "openai" },
    { label: "Generator model", value: "gpt-4.1" },
    { label: "Judge temperature", value: "0.0" },
    { label: "Max JSON repair retries", value: "2" },
  ];
  return (
    <div className="jg-fade-up">
      <Eyebrow>Settings</Eyebrow>
      <h2 style={{ ...sans, color: T.text, fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 20 }}>Pipeline configuration</h2>
      <GlassPanel style={{ padding: 0, maxWidth: 520, overflow: "hidden" }}>
        {fields.map((f, i) => (
          <div key={f.label} className="flex items-center justify-between" style={{ padding: "14px 18px", borderTop: i ? `1px solid ${T.hairline}` : "none" }}>
            <span style={{ ...sans, fontSize: 13, color: T.textDim }}>{f.label}</span>
            <span style={{ ...mono, fontSize: 12.5, color: T.text }}>{f.value}</span>
          </div>
        ))}
      </GlassPanel>
      <div style={{ ...sans, fontSize: 11.5, color: T.textFaint, marginTop: 14, maxWidth: 520 }}>
        Judge and generator are configured independently and read from environment variables / YAML at runtime &mdash; no secrets are stored in this interface.
      </div>
    </div>
  );
}

/* ============================================================================
   SHELL
=============================================================================*/
function Sidebar({ page, setPage }) {
  return (
    <div style={{ width: 236, minWidth: 236, background: T.surface, borderRight: `1px solid ${T.hairline}`, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "22px 20px 18px" }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 26, height: 26, borderRadius: 5, background: `linear-gradient(135deg, ${T.violet}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={14} color="#08070C" strokeWidth={2.5} />
          </div>
          <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "0.02em" }}>JUDGEGUARD</span>
        </div>
        <div style={{ ...sans, fontSize: 10.5, color: T.textFaint, marginTop: 6, lineHeight: 1.4 }}>
          Don't just trust the judge. Test the judge.
        </div>
      </div>

      <nav style={{ padding: "6px 12px", flex: 1 }}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = page === n.key;
          return (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", marginBottom: 2, borderRadius: 4, border: "none", cursor: "pointer",
                background: active ? T.glassHover : "transparent",
                borderLeft: active ? `2px solid ${T.violet}` : "2px solid transparent",
                textAlign: "left",
              }}
            >
              <Icon size={14} color={active ? T.violet : T.textDim} />
              <span style={{ ...sans, fontSize: 13, color: active ? T.text : T.textDim, fontWeight: active ? 600 : 400 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.hairline}` }}>
        {[["Judge", "Claude"], ["Generator", "GPT"], ["Environment", "Production"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between" style={{ padding: "3px 0" }}>
            <span style={{ ...mono, fontSize: 10, color: T.textFaint }} className="uppercase">{k}</span>
            <span style={{ ...mono, fontSize: 10.5, color: T.textDim }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar({ page }) {
  const found = NAV.find((n) => n.key === page);
  return (
    <div style={{ height: 52, borderBottom: `1px solid ${T.hairline}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <div className="flex items-center gap-2">
        <span style={{ ...mono, fontSize: 11, color: T.textFaint }}>judgeguard</span>
        <ChevronRight size={12} color={T.textFaint} />
        <span style={{ ...mono, fontSize: 11, color: T.text }}>{found?.label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulseDot 2s infinite" }} />
          <span style={{ ...mono, fontSize: 10.5, color: T.textDim }}>live</span>
        </div>
        <Info size={14} color={T.textFaint} />
      </div>
    </div>
  );
}

export default function JudgeGuardApp() {
  const [page, setPage] = useState("overview");
  const pages = {
    overview: <PageOverview />,
    evaluate: <PageEvaluate />,
    arena: <PageArena />,
    bias: <PageBiasLab />,
    validation: <PageValidation />,
    audit: <PageAudit />,
    reports: <PageReports />,
    settings: <PageSettings />,
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: T.void, position: "relative", display: "flex", overflow: "hidden", ...sans }}>
      <FontImport />
      {/* grid + glow background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "42px 42px",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at 15% -8%, rgba(155,107,255,0.14), transparent 42%), radial-gradient(circle at 92% 8%, rgba(47,230,224,0.09), transparent 38%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100%" }}>
        <Sidebar page={page} setPage={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar page={page} />
          <div className="jg-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "28px 32px 60px" }}>
            <div style={{ maxWidth: 1240, margin: "0 auto" }} key={page}>
              {pages[page]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

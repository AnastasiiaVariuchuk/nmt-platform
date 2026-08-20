import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  BookOpen, Target, Map, MessageCircleQuestion, Flame, Clock, Check, X,
  ChevronRight, ChevronDown, PlayCircle, FileText, RotateCcw, Send, Timer,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Токени оформлення. Мотив — зошит у клітинку: синє чорнило,
   бліда сітка, жовтий маркер. Усе інше мовчить.
   ──────────────────────────────────────────────────────────────── */
const C = {
  paper: "#F5F7FB",
  card: "#FFFFFF",
  grid: "#DFE6F2",
  ink: "#173A6D",
  inkSoft: "#4A6B9E",
  graphite: "#22262E",
  muted: "#7A8494",
  marker: "#FFD84D",
  ok: "#1B9C68",
  no: "#D4455C",
  line: "#E6EBF3",
};
const DISPLAY = "'Unbounded', system-ui, sans-serif";
const BODY = "'Manrope', system-ui, sans-serif";

/* ── Навчальна програма: 52 теми фази B + 8 наскрізних ── */
const MODULES = [
  { id: "М0", name: "Вирівнювання бази", weeks: "тиждень 1", topics: [
    "Арифметика без калькулятора", "Алгебраїчний мінімум"] },
  { id: "М1", name: "Числа і вирази", weeks: "тижні 2–5", topics: [
    "Дійсні числа, подільність, НСД і НСК", "Округлення, стандартний вигляд, модуль",
    "Відношення, пропорції, відсотки", "Текстові задачі: рух, робота, суміші",
    "Раціональні вирази", "Ірраціональні та степеневі вирази",
    "Показникові та логарифмічні вирази", "Тригонометричні вирази"] },
  { id: "М2", name: "Рівняння, нерівності, системи", weeks: "тижні 6–11", topics: [
    "Лінійні та дробово-раціональні рівняння", "Квадратні рівняння, теорема Вієта",
    "Системи рівнянь", "Ірраціональні рівняння", "Тригонометричні рівняння",
    "Показникові рівняння", "Логарифмічні рівняння", "Лінійні та квадратні нерівності",
    "Метод інтервалів", "Показникові та логарифмічні нерівності",
    "Задачі на складання рівнянь"] },
  { id: "М3", name: "Функції та початки аналізу", weeks: "тижні 11–16", topics: [
    "Арифметична прогресія", "Геометрична прогресія", "Область визначення функції",
    "Властивості функцій, читання графіків", "Лінійна функція", "Квадратична функція",
    "Показникова і логарифмічна функції", "Тригонометричні функції",
    "Похідна: обчислення", "Застосування похідної", "Первісна та інтеграл"] },
  { id: "М4", name: "Комбінаторика, ймовірність, статистика", weeks: "тижні 17–18", topics: [
    "Комбінаторні правила", "Ймовірність випадкової події", "Статистика і читання даних"] },
  { id: "М5", name: "Планіметрія", weeks: "тижні 18–23", topics: [
    "Кути й паралельні прямі", "Трикутники: властивості", "Подібність трикутників",
    "Прямокутний трикутник", "Теореми синусів і косинусів", "Паралелограм і ромб",
    "Трапеція", "Прямокутник і квадрат", "Коло і круг, многокутники",
    "Координати і вектори на площині"] },
  { id: "М6", name: "Стереометрія", weeks: "тижні 23–26", topics: [
    "Прямі та площини у просторі", "Призма", "Паралелепіпед і куб", "Піраміда",
    "Циліндр і конус", "Куля і сфера", "Координати і вектори у просторі"] },
];

const TOPICS = [];
MODULES.forEach((m) => m.topics.forEach((t, i) =>
  TOPICS.push({ id: `${m.id}-${i + 1}`, n: TOPICS.length + 1, name: t, module: m.id })));

/* ── Банк завдань (демонстраційний зріз) ── */
const TASKS = [
  { id: "q1", topic: "М1-3", type: "choice", lvl: 1,
    q: "Ціну товару 800 грн підвищили на 15%, а потім нову ціну знизили на 20%. Скільки коштує товар тепер?",
    opts: ["736 грн", "744 грн", "760 грн", "800 грн", "828 грн"], a: 0,
    why: "800 · 1,15 = 920. Далі 920 · 0,8 = 736. Відсотки рахуються від нової бази, а не від початкової — саме тут втрачають бал." },
  { id: "q2", topic: "М1-3", type: "short", lvl: 1,
    q: "Число 60 становить 40% від числа x. Знайдіть x.", a: "150",
    why: "x = 60 : 0,4 = 150." },
  { id: "q3", topic: "М2-2", type: "choice", lvl: 1,
    q: "Чому дорівнює сума коренів рівняння x² − 7x + 10 = 0?",
    opts: ["−10", "−7", "3", "7", "10"], a: 3,
    why: "За теоремою Вієта сума коренів дорівнює −b/a = 7. Знак мінус перед b — найчастіша помилка." },
  { id: "q4", topic: "М2-2", type: "short", lvl: 1,
    q: "Знайдіть менший корінь рівняння x² − x − 12 = 0.", a: "-3",
    why: "Корені 4 і −3. Менший — це −3, а не 3: перевіряйте знак перед записом відповіді." },
  { id: "q5", topic: "М1-6", type: "choice", lvl: 2,
    q: "Обчисліть значення виразу √(a²), якщо a = −5.",
    opts: ["−5", "5", "±5", "25", "−25"], a: 1,
    why: "√(a²) = |a|, а не a. При a = −5 отримуємо 5." },
  { id: "q6", topic: "М1-7", type: "choice", lvl: 1,
    q: "Обчисліть log₂ 32.", opts: ["3", "4", "5", "6", "16"], a: 2,
    why: "32 = 2⁵, тому log₂ 32 = 5." },
  { id: "q7", topic: "М1-7", type: "short", lvl: 2,
    q: "Обчисліть log₃ 81 − log₃ 3.", a: "3",
    why: "log₃ 81 = 4, log₃ 3 = 1, різниця 3. Можна й одразу: log₃(81/3) = log₃ 27 = 3." },
  { id: "q8", topic: "М3-1", type: "choice", lvl: 1,
    q: "В арифметичній прогресії a₁ = 3, d = 4. Знайдіть a₁₀.",
    opts: ["39", "40", "43", "37", "42"], a: 0,
    why: "aₙ = a₁ + (n − 1)d = 3 + 9 · 4 = 39. Множимо на 9, не на 10." },
  { id: "q9", topic: "М3-2", type: "short", lvl: 1,
    q: "У геометричній прогресії b₁ = 2, q = 3. Знайдіть b₄.", a: "54",
    why: "bₙ = b₁ · qⁿ⁻¹ = 2 · 3³ = 54." },
  { id: "q10", topic: "М5-4", type: "choice", lvl: 1,
    q: "Катети прямокутного трикутника дорівнюють 6 і 8. Знайдіть гіпотенузу.",
    opts: ["9", "10", "12", "14", "48"], a: 1,
    why: "√(36 + 64) = √100 = 10." },
  { id: "q11", topic: "М5-4", type: "short", lvl: 2,
    q: "Гіпотенуза прямокутного трикутника дорівнює 13, один з катетів — 5. Знайдіть другий катет.", a: "12",
    why: "√(169 − 25) = √144 = 12. Тут віднімаємо, а не додаємо — гіпотенуза вже відома." },
  { id: "q12", topic: "М5-6", type: "choice", lvl: 2,
    q: "Сторони паралелограма дорівнюють 8 і 5, кут між ними 30°. Знайдіть площу.",
    opts: ["20", "40", "10", "34,6", "13"], a: 0,
    why: "S = ab · sin α = 8 · 5 · 0,5 = 20." },
  { id: "q13", topic: "М5-9", type: "choice", lvl: 2,
    q: "Вписаний кут спирається на дугу 80°. Знайдіть градусну міру цього кута.",
    opts: ["160°", "80°", "40°", "100°", "20°"], a: 2,
    why: "Вписаний кут удвічі менший за дугу, на яку спирається: 80° : 2 = 40°. Половина — саме у вписаного, не навпаки." },
  { id: "q14", topic: "М6-3", type: "short", lvl: 1,
    q: "Знайдіть об’єм куба з ребром 4.", a: "64",
    why: "V = a³ = 64. Не переплутайте з площею поверхні 6a² = 96." },
  { id: "q15", topic: "М3-9", type: "choice", lvl: 2,
    q: "Знайдіть f′(1), якщо f(x) = x³ − 3x.",
    opts: ["0", "−2", "3", "6", "−3"], a: 0,
    why: "f′(x) = 3x² − 3, тому f′(1) = 3 − 3 = 0." },
  { id: "q16", topic: "М4-2", type: "choice", lvl: 1,
    q: "У кошику 5 червоних і 15 синіх куль. Яка ймовірність навмання витягнути червону?",
    opts: ["0,05", "0,2", "0,25", "0,33", "0,75"], a: 2,
    why: "Усього куль 20, сприятливих 5. P = 5/20 = 0,25. Знаменник — усі кулі, а не лише сині." },
];

/* ── Стан ── */
const KEY = "nmt:student:v1";
const SEED = {
  name: "Софія",
  streak: 6,
  mastery: {
    "М0-1": 92, "М0-2": 88, "М1-1": 80, "М1-2": 74, "М1-3": 55, "М1-4": 41,
    "М1-5": 71, "М1-6": 63, "М1-7": 35, "М1-8": 12, "М2-1": 78, "М2-2": 69,
    "М2-3": 44, "М5-4": 58, "М3-1": 25,
  },
  mocks: [
    { label: "Вх.", score: 11 }, { label: "№2", score: 14 }, { label: "№3", score: 18 },
  ],
  solved: {},
  questions: [],
};

async function load() {
  try {
    const r = await window.storage.get(KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function save(s) {
  try { await window.storage.set(KEY, JSON.stringify(s)); } catch { /* демо-режим */ }
}

/* ── Дрібні елементи ── */
const Card = ({ children, className = "", style = {} }) => (
  <div className={`rounded-2xl ${className}`}
    style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(23,58,109,.04)", ...style }}>
    {children}
  </div>
);

const Eyebrow = ({ children }) => (
  <div className="uppercase tracking-widest mb-2" style={{ fontSize: 10.5, color: C.muted, fontWeight: 700, letterSpacing: ".14em" }}>
    {children}
  </div>
);

function Ring({ pct, size = 72 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.grid} strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.ink} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .6s ease" }} />
      <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size / 4, fill: C.ink }}>{pct}%</text>
    </svg>
  );
}

/* ────────────────────── СЬОГОДНІ ────────────────────── */
function Today({ st, go }) {
  const done = Object.values(st.mastery).filter((v) => v >= 70).length;
  const overall = Math.round((done / TOPICS.length) * 100);
  const weak = TOPICS
    .filter((t) => st.mastery[t.id] !== undefined && st.mastery[t.id] < 70)
    .sort((a, b) => st.mastery[a.id] - st.mastery[b.id]).slice(0, 3);
  const last = st.mocks[st.mocks.length - 1];

  return (
    <div className="space-y-4">
      <Card className="p-5 md:p-7 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: "22px 22px", opacity: .5,
        }} />
        <div className="relative">
          <Eyebrow>Тиждень 9 · Модуль М2</Eyebrow>
          <h1 className="mb-1" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,4.5vw,34px)", color: C.graphite, lineHeight: 1.15 }}>
            Привіт, {st.name}. Сьогодні — метод інтервалів.
          </h1>
          <p className="mb-5" style={{ color: C.muted, fontSize: 14.5, maxWidth: 520 }}>
            Лекція о 18:00. До неї варто закрити ДЗ з квадратних нерівностей — 8 задач із 22 ще не здано.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => go("practice")} className="px-4 py-2.5 rounded-xl text-sm transition-transform hover:-translate-y-0.5"
              style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
              Дорозв’язати ДЗ
            </button>
            <button onClick={() => go("materials")} className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "transparent", color: C.ink, fontWeight: 700, border: `1.5px solid ${C.grid}` }}>
              Конспект лекції
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <Ring pct={overall} size={64} />
          <div>
            <div style={{ fontSize: 12.5, color: C.muted }}>Програма</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.graphite }}>{done} із {TOPICS.length} тем</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 mb-1"><Flame size={15} style={{ color: C.marker }} />
            <span style={{ fontSize: 12.5, color: C.muted }}>Серія днів</span></div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.graphite, lineHeight: 1 }}>{st.streak}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>підряд із розв’язаними задачами</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 mb-1"><Target size={15} style={{ color: C.ink }} />
            <span style={{ fontSize: 12.5, color: C.muted }}>Останній пробний</span></div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.graphite, lineHeight: 1 }}>
            {last.score}<span style={{ fontSize: 15, color: C.muted }}> / 32</span>
          </div>
          <div style={{ fontSize: 12, color: C.ok, marginTop: 4, fontWeight: 600 }}>+4 бали до попереднього</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 mb-1"><Clock size={15} style={{ color: C.ink }} />
            <span style={{ fontSize: 12.5, color: C.muted }}>До НМТ</span></div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: C.graphite, lineHeight: 1 }}>168</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>днів · 23 навчальні тижні</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div><Eyebrow>Потребує уваги</Eyebrow>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.graphite }}>Теми нижче порога 70%</div></div>
          <button onClick={() => go("progress")} className="text-sm flex items-center gap-1" style={{ color: C.ink, fontWeight: 700 }}>
            Уся карта <ChevronRight size={15} />
          </button>
        </div>
        <div className="space-y-2">
          {weak.map((t) => (
            <button key={t.id} onClick={() => go("practice", t.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-slate-50"
              style={{ border: `1px solid ${C.line}` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: C.paper, fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, color: C.inkSoft }}>{t.n}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: C.graphite }}>{t.name}</div>
                <div className="h-1.5 rounded-full mt-1.5" style={{ background: C.grid }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${st.mastery[t.id]}%`, background: st.mastery[t.id] < 45 ? C.no : C.marker }} />
                </div>
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, color: C.muted }}>{st.mastery[t.id]}%</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ────────────────────── МАТЕРІАЛИ ────────────────────── */
function Materials({ st, go }) {
  const [open, setOpen] = useState("М2");
  return (
    <div className="space-y-3">
      <div>
        <Eyebrow>Бібліотека курсу</Eyebrow>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.graphite }}>Матеріали</h2>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
          До кожної теми — запис лекції, опорний конспект на одну сторінку і сет практикуму.
        </p>
      </div>
      {MODULES.map((m) => {
        const isOpen = open === m.id;
        const vals = m.topics.map((_, i) => st.mastery[`${m.id}-${i + 1}`] ?? 0);
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        return (
          <Card key={m.id} className="overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : m.id)} className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: isOpen ? C.ink : C.paper, color: isOpen ? "#fff" : C.inkSoft, fontFamily: DISPLAY, fontWeight: 800, fontSize: 13 }}>
                {m.id}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.graphite }}>{m.name}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{m.topics.length} занять · {m.weeks} · опрацьовано {avg}%</div>
              </div>
              {isOpen ? <ChevronDown size={18} style={{ color: C.muted }} /> : <ChevronRight size={18} style={{ color: C.muted }} />}
            </button>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.line}` }}>
                {m.topics.map((t, i) => {
                  const id = `${m.id}-${i + 1}`;
                  const v = st.mastery[id] ?? 0;
                  return (
                    <div key={id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                      <div className="w-1.5 h-8 rounded-full shrink-0"
                        style={{ background: v >= 70 ? C.ok : v > 0 ? C.marker : C.grid }} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: C.graphite }}>{t}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{v > 0 ? `засвоєно ${v}%` : "ще не розпочато"}</div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <IconBtn icon={PlayCircle} label="Запис лекції" />
                        <IconBtn icon={FileText} label="Опорний конспект" />
                        <button onClick={() => go("practice", id)} className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: C.paper, color: C.ink, fontWeight: 700, border: `1px solid ${C.grid}` }}>
                          Задачі
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
const IconBtn = ({ icon: Icon, label }) => (
  <button title={label} aria-label={label} className="w-8 h-8 rounded-lg flex items-center justify-center"
    style={{ background: C.paper, border: `1px solid ${C.grid}` }}>
    <Icon size={15} style={{ color: C.inkSoft }} />
  </button>
);

/* ────────────────────── ПРАКТИКА ────────────────────── */
function Practice({ st, setSt, focus }) {
  const pool = useMemo(() => {
    const f = focus ? TASKS.filter((t) => t.topic === focus) : [];
    return f.length ? f : TASKS;
  }, [focus]);

  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [tally, setTally] = useState({ ok: 0, no: 0 });
  const [secs, setSecs] = useState(0);
  const tick = useRef(null);

  useEffect(() => { setI(0); reset(); setTally({ ok: 0, no: 0 }); }, [focus]);
  useEffect(() => {
    tick.current = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(tick.current);
  }, [i]);

  function reset() { setPick(null); setTyped(""); setChecked(false); setSecs(0); }

  const task = pool[i];
  const topic = TOPICS.find((t) => t.id === task.topic);
  const correct = task.type === "choice"
    ? pick === task.a
    : typed.trim().replace(",", ".").replace("−", "-") === String(task.a);

  function check() {
    if (checked) return;
    setChecked(true);
    setTally((t) => ({ ok: t.ok + (correct ? 1 : 0), no: t.no + (correct ? 0 : 1) }));
    const cur = st.mastery[task.topic] ?? 0;
    const next = Math.max(0, Math.min(100, cur + (correct ? 6 : -3)));
    const s = { ...st, mastery: { ...st.mastery, [task.topic]: next }, solved: { ...st.solved, [task.id]: correct } };
    setSt(s); save(s);
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const slow = secs > 162; // 2,7 хв — середній темп НМТ

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Eyebrow>{topic ? `${topic.module} · ${topic.name}` : "Змішаний сет"}</Eyebrow>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.graphite }}>Практика</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: slow ? "#FDECEF" : C.card, border: `1px solid ${slow ? C.no : C.line}` }}>
            <Timer size={14} style={{ color: slow ? C.no : C.muted }} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, color: slow ? C.no : C.graphite }}>{mm}:{ss}</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: C.ok }}>✓ {tally.ok}</span>
            <span style={{ color: C.no }}>✕ {tally.no}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        {pool.map((t, k) => (
          <div key={t.id} className="h-1 flex-1 rounded-full"
            style={{ background: k < i ? C.ink : k === i ? C.marker : C.grid }} />
        ))}
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 11, fontWeight: 700, background: C.paper, color: C.inkSoft, border: `1px solid ${C.grid}` }}>
            {task.type === "choice" ? "Одна правильна з п’яти" : "Коротка відповідь"}
          </span>
          <span style={{ fontSize: 11.5, color: C.muted }}>Завдання {i + 1} з {pool.length} · складність {task.lvl}</span>
        </div>

        <p className="mb-5" style={{ fontSize: 16.5, lineHeight: 1.55, color: C.graphite, fontWeight: 500 }}>{task.q}</p>

        {task.type === "choice" ? (
          <div className="space-y-2">
            {task.opts.map((o, k) => {
              const isPick = pick === k, isRight = k === task.a;
              let bg = C.card, bd = C.line, fg = C.graphite;
              if (checked && isRight) { bg = "#E9F7F0"; bd = C.ok; }
              else if (checked && isPick) { bg = "#FDECEF"; bd = C.no; }
              else if (isPick) { bd = C.ink; bg = C.paper; }
              return (
                <button key={k} disabled={checked} onClick={() => setPick(k)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors"
                  style={{ background: bg, border: `1.5px solid ${bd}` }}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isPick || (checked && isRight) ? C.ink : C.paper, color: isPick || (checked && isRight) ? "#fff" : C.muted, fontFamily: DISPLAY, fontWeight: 700, fontSize: 11.5 }}>
                    {"АБВГД"[k]}
                  </span>
                  <span className="flex-1" style={{ fontSize: 15, color: fg }}>{o}</span>
                  {checked && isRight && <Check size={17} style={{ color: C.ok }} />}
                  {checked && isPick && !isRight && <X size={17} style={{ color: C.no }} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} disabled={checked}
              placeholder="Введіть число" inputMode="decimal"
              onKeyDown={(e) => e.key === "Enter" && check()}
              className="w-full px-4 py-3.5 rounded-xl outline-none"
              style={{
                border: `1.5px solid ${checked ? (correct ? C.ok : C.no) : C.grid}`,
                background: checked ? (correct ? "#E9F7F0" : "#FDECEF") : C.card,
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: C.graphite,
              }} />
            <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
              Десяткові — через кому або крапку. Одиниці вимірювання не пишемо.
            </p>
          </div>
        )}

        {checked && (
          <div className="mt-5 p-4 rounded-xl" style={{ background: C.paper, borderLeft: `3px solid ${correct ? C.ok : C.no}` }}>
            <div className="mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13.5, color: correct ? C.ok : C.no }}>
              {correct ? "Правильно" : `Правильна відповідь: ${task.type === "choice" ? task.opts[task.a] : task.a}`}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: C.graphite }}>{task.why}</p>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          {!checked ? (
            <button onClick={check} disabled={task.type === "choice" ? pick === null : !typed.trim()}
              className="px-5 py-3 rounded-xl text-sm disabled:opacity-35"
              style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
              Перевірити
            </button>
          ) : (
            <button onClick={() => { if (i < pool.length - 1) { setI(i + 1); reset(); } else { setI(0); reset(); } }}
              className="px-5 py-3 rounded-xl text-sm" style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
              {i < pool.length - 1 ? "Наступне завдання" : "Почати спочатку"}
            </button>
          )}
          <button onClick={() => { if (i < pool.length - 1) { setI(i + 1); reset(); } }}
            className="px-4 py-3 rounded-xl text-sm" style={{ color: C.muted, fontWeight: 600 }}>
            Пропустити
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ────────────────────── ПРОГРЕС (карта тем) ────────────────────── */
function Progress({ st, go }) {
  const [hover, setHover] = useState(null);
  const done = Object.values(st.mastery).filter((v) => v >= 70).length;

  return (
    <div className="space-y-4">
      <div>
        <Eyebrow>Особистий трекер</Eyebrow>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.graphite }}>Прогрес</h2>
      </div>

      <Card className="p-5">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.graphite }}>Карта тем</div>
          <div className="flex items-center gap-3" style={{ fontSize: 11.5, color: C.muted }}>
            <Legend color={C.grid} t="не розпочато" />
            <Legend color={C.marker} t="менше 70%" />
            <Legend color={C.ink} t="закрито" />
          </div>
        </div>

        {MODULES.map((m) => (
          <div key={m.id} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 11.5, color: C.inkSoft }}>{m.id}</span>
              <span style={{ fontSize: 11.5, color: C.muted }}>{m.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.topics.map((name, i) => {
                const id = `${m.id}-${i + 1}`;
                const v = st.mastery[id] ?? 0;
                const t = TOPICS.find((x) => x.id === id);
                const bg = v >= 70 ? C.ink : v > 0 ? C.marker : C.card;
                const fg = v >= 70 ? "#fff" : v > 0 ? C.graphite : C.muted;
                return (
                  <button key={id} onClick={() => go("practice", id)}
                    onMouseEnter={() => setHover({ name, v })} onMouseLeave={() => setHover(null)}
                    className="rounded-md flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2"
                    style={{ width: 30, height: 30, background: bg, color: fg, border: `1px solid ${v > 0 ? "transparent" : C.grid}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 11 }}
                    title={`${name} — ${v}%`}>
                    {t.n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 13.5, color: C.muted }}>
            {hover ? <span style={{ color: C.graphite, fontWeight: 600 }}>{hover.name} — {hover.v}%</span>
              : `Закрито ${done} тем із ${TOPICS.length}. Клітинка стає синьою на 70%.`}
          </span>
        </div>
      </Card>

      <Card className="p-5">
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.graphite }}>Пробні тести</div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Максимум 32 бали. Пунктир — ціль на цей етап курсу.</p>
        <div style={{ height: 190 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={st.mocks} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 32]} tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <ReferenceLine y={22} stroke={C.marker} strokeDasharray="5 4" />
              <Line type="monotone" dataKey="score" stroke={C.ink} strokeWidth={2.5}
                dot={{ r: 4, fill: C.ink }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
const Legend = ({ color, t }) => (
  <span className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded" style={{ background: color, border: `1px solid ${C.grid}` }} />{t}
  </span>
);

/* ────────────────────── ПИТАННЯ ────────────────────── */
function Ask({ st, setSt }) {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState(TOPICS[10].id);

  function send() {
    if (!text.trim()) return;
    const q = { id: Date.now(), topic, text: text.trim(), status: "У черзі на неділю" };
    const s = { ...st, questions: [q, ...st.questions] };
    setSt(s); save(s); setText("");
  }

  return (
    <div className="space-y-4">
      <div>
        <Eyebrow>Q&A-сесія · неділя, 19:00</Eyebrow>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.graphite }}>Питання</h2>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4, maxWidth: 560 }}>
          Питання збираються до суботи. Ті, що повторюються у трьох і більше учнів, розбираються першими.
        </p>
      </div>

      <Card className="p-5">
        <select value={topic} onChange={(e) => setTopic(e.target.value)}
          className="w-full mb-3 px-3.5 py-3 rounded-xl outline-none"
          style={{ border: `1.5px solid ${C.grid}`, background: C.card, fontSize: 14, color: C.graphite, fontFamily: BODY }}>
          {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.module} · {t.name}</option>)}
        </select>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
          placeholder="Опишіть, на якому кроці задача перестала бути зрозумілою. Номер завдання з ДЗ теж допоможе."
          className="w-full px-3.5 py-3 rounded-xl outline-none resize-none"
          style={{ border: `1.5px solid ${C.grid}`, fontSize: 14.5, lineHeight: 1.5, color: C.graphite, fontFamily: BODY }} />
        <button onClick={send} disabled={!text.trim()}
          className="mt-3 px-5 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-35"
          style={{ background: C.ink, color: "#fff", fontWeight: 700 }}>
          <Send size={15} /> Надіслати питання
        </button>
      </Card>

      {st.questions.length > 0 && (
        <Card className="p-5">
          <div className="mb-3" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.graphite }}>Ваші питання</div>
          <div className="space-y-2">
            {st.questions.map((q) => {
              const t = TOPICS.find((x) => x.id === q.topic);
              return (
                <div key={q.id} className="p-3.5 rounded-xl" style={{ border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 11, fontWeight: 700, background: C.paper, color: C.inkSoft }}>{t?.name}</span>
                    <span style={{ fontSize: 11.5, color: C.marker === "#FFD84D" ? "#A67C00" : C.muted, fontWeight: 600 }}>{q.status}</span>
                  </div>
                  <p style={{ fontSize: 14, color: C.graphite, lineHeight: 1.5 }}>{q.text}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ────────────────────── ОБОЛОНКА ────────────────────── */
const NAV = [
  { id: "today", label: "Сьогодні", icon: Flame },
  { id: "materials", label: "Матеріали", icon: BookOpen },
  { id: "practice", label: "Практика", icon: Target },
  { id: "progress", label: "Прогрес", icon: Map },
  { id: "ask", label: "Питання", icon: MessageCircleQuestion },
];

export default function App() {
  const [st, setSt] = useState(SEED);
  const [tab, setTab] = useState("today");
  const [focus, setFocus] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { (async () => { const s = await load(); if (s) setSt(s); setReady(true); })(); }, []);

  const go = (t, f = null) => { setFocus(f); setTab(t); };

  async function resetAll() {
    setSt(SEED); setFocus(null); await save(SEED);
  }

  return (
    <div className="min-h-screen w-full" style={{ background: C.paper, fontFamily: BODY, color: C.graphite }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Manrope:wght@400;500;600;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        button:focus-visible { outline: 2px solid ${C.ink}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {/* шапка */}
      <header className="sticky top-0 z-20" style={{ background: "rgba(245,247,251,.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.ink }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 13, color: C.marker }}>32</span>
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>Тридцять два</div>
              <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: ".04em" }}>підготовка до НМТ з математики</div>
            </div>
          </div>
          <button onClick={resetAll} title="Скинути демо-прогрес"
            className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${C.grid}` }}>
            <RotateCcw size={14} style={{ color: C.muted }} />
          </button>
        </div>
      </header>

      {/* навігація: збоку на десктопі, знизу на телефоні */}
      <div className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8 md:flex md:gap-6">
        <nav className="hidden md:block w-48 shrink-0">
          <div className="sticky top-20 space-y-1">
            {NAV.map((n) => {
              const on = tab === n.id;
              return (
                <button key={n.id} onClick={() => go(n.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
                  style={{ background: on ? C.card : "transparent", color: on ? C.ink : C.muted, fontWeight: on ? 700 : 500, fontSize: 14, border: `1px solid ${on ? C.line : "transparent"}` }}>
                  <n.icon size={16} /> {n.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {!ready ? (
            <div className="py-20 text-center" style={{ color: C.muted, fontSize: 14 }}>Завантаження…</div>
          ) : (
            <>
              {tab === "today" && <Today st={st} go={go} />}
              {tab === "materials" && <Materials st={st} go={go} />}
              {tab === "practice" && <Practice st={st} setSt={setSt} focus={focus} />}
              {tab === "progress" && <Progress st={st} go={go} />}
              {tab === "ask" && <Ask st={st} setSt={setSt} />}
            </>
          )}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex"
        style={{ background: "rgba(255,255,255,.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}` }}>
        {NAV.map((n) => {
          const on = tab === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} className="flex-1 py-2.5 flex flex-col items-center gap-1"
              style={{ color: on ? C.ink : C.muted }}>
              <n.icon size={19} strokeWidth={on ? 2.4 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

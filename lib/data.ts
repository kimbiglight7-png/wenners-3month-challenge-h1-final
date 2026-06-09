import type { Club } from "./types";

export const CLUBS: Club[] = [
  { id: "cert", name: "자격증-까짓것 한 번 해보조", emoji: "📜" },
  { id: "move", name: "운동-자유운동(MOVE6)", emoji: "💪" },
  { id: "stock", name: "주식-영앤리치", emoji: "📈" },
  { id: "book", name: "독서-북쩍북적", emoji: "📚" },
  { id: "ai", name: "AI-OH MY CLAUDE", emoji: "🤖" },
];

export const MEMBERS: Record<string, string[]> = {
  cert: ["강민지", "이민주", "김효은", "태종석", "이선록"],
  move: ["김효민", "지우현", "박동민", "김종민", "석나래"],
  stock: ["최진호", "유아경", "조성재", "김대광"],
  book: ["이민혜", "김고은", "강태경", "이우현", "김다빈"],
  ai: ["채희원", "사공규", "김지민", "김건영", "박지철", "박세현"],
};

// Tailwind 클래스는 동적 생성이 불가능하므로 전체 클래스명을 명시합니다
export const CLUB_STYLES: Record<
  string,
  { card: string; selected: string; badge: string; bg: string; text: string }
> = {
  cert: {
    card: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400",
    selected: "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200",
    badge: "bg-blue-500 text-white",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  move: {
    card: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400",
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200",
    badge: "bg-emerald-500 text-white",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  stock: {
    card: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400",
    selected: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200",
    badge: "bg-amber-500 text-white",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  book: {
    card: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400",
    selected: "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-200",
    badge: "bg-purple-500 text-white",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  ai: {
    card: "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400",
    selected: "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200",
    badge: "bg-rose-500 text-white",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
};

export const RANK_MEDALS = ["🥇", "🥈", "🥉"];
export const RANK_LABELS = ["1등", "2등", "3등"];
export const RANK_SCORES = [3, 2, 1];
export const RANK_COLORS = [
  "border-amber-300 bg-amber-50",
  "border-slate-300 bg-slate-50",
  "border-orange-300 bg-orange-50",
];

export const SESSION_KEY = "wenners_v1_session";
export const SUBMITTED_KEY = "wenners_v1_submitted";

export const TOTAL_MEMBERS = Object.values(MEMBERS).reduce(
  (acc, members) => acc + members.length,
  0
);

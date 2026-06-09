"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CLUBS,
  MEMBERS,
  CLUB_STYLES,
  RANK_MEDALS,
  RANK_LABELS,
  RANK_SCORES,
  RANK_COLORS,
  SESSION_KEY,
} from "@/lib/data";
import type { SessionData } from "@/lib/types";

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`rounded-full transition-all duration-300 ${
            step === current
              ? "w-6 h-2 bg-white"
              : step < current
              ? "w-2 h-2 bg-white/60"
              : "w-2 h-2 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function VotePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [rankings, setRankings] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [selectedMVP, setSelectedMVP] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed: SessionData = JSON.parse(raw);
    if (!parsed.voterClub || !parsed.voterName) {
      router.replace("/");
      return;
    }
    setSession(parsed);
  }, [router]);

  function handleClubClick(clubId: string) {
    if (rankings.includes(clubId)) {
      // 이미 슬롯에 있으면 제거하고 나머지 앞으로 당기기
      const compact = rankings
        .filter((r) => r !== null && r !== clubId)
        .filter(Boolean) as string[];
      setRankings([...compact, ...Array(3 - compact.length).fill(null)]);
    } else {
      const firstEmpty = rankings.findIndex((r) => r === null);
      if (firstEmpty === -1) return;
      const next = [...rankings];
      next[firstEmpty] = clubId;
      setRankings(next);
    }
  }

  function handleReset() {
    setRankings([null, null, null]);
  }

  function handleNext() {
    if (!session) return;
    if (rankings.some((r) => r === null) || !selectedMVP) return;

    const updated: SessionData = {
      ...session,
      rankings: rankings as string[],
      mvpName: selectedMVP,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    router.push("/confirm");
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const myClub = CLUBS.find((c) => c.id === session.voterClub);
  const votableClubs = CLUBS.filter((c) => c.id !== session.voterClub);
  const mvpCandidates = (MEMBERS[session.voterClub] || []).filter(
    (name) => name !== session.voterName
  );
  const allRanked = rankings.every((r) => r !== null);
  const canProceed = allRanked && !!selectedMVP;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50 pb-28">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">
              Wenners
            </span>
            <StepIndicator current={2} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            3개월 챌린지 파이널 🏆
          </h1>
          <p className="text-indigo-200 text-sm mt-1 font-medium">
            상반기 투표 · STEP 2&3 / 3
          </p>
          <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-fit">
            <span className="text-base">{myClub?.emoji}</span>
            <span className="text-sm font-semibold">{session.voterName}</span>
            <span className="text-indigo-300">·</span>
            <span className="text-indigo-200 text-sm">{myClub?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-5 mt-6">
        {/* ─── STEP 2: 소모임 순위 ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-slate-800">우수 소모임 순위 선택</h2>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-rose-500 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              초기화
            </button>
          </div>

          {/* 안내 문구 */}
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2 mb-4 mt-3">
            <span className="text-sm">💡</span>
            <p className="text-xs text-indigo-700 font-medium">
              1등 <strong>3점</strong> · 2등 <strong>2점</strong> · 3등{" "}
              <strong>1점</strong>으로 집계됩니다. 본인 소모임은 선택 불가합니다.
            </p>
          </div>

          {/* 순위 슬롯 */}
          <div className="flex flex-col gap-2 mb-5">
            {[0, 1, 2].map((idx) => {
              const clubId = rankings[idx];
              const club = clubId ? CLUBS.find((c) => c.id === clubId) : null;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                    club
                      ? RANK_COLORS[idx] + " border-current"
                      : "border-dashed border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className="text-2xl leading-none w-8 text-center">
                    {RANK_MEDALS[idx]}
                  </span>
                  <span
                    className={`text-xs font-bold w-6 ${
                      club ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    {RANK_LABELS[idx]}
                  </span>
                  {club ? (
                    <>
                      <span className="text-lg">{club.emoji}</span>
                      <span className="flex-1 font-bold text-sm text-slate-800">
                        {club.name}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        +{RANK_SCORES[idx]}점
                      </span>
                      <button
                        onClick={() => handleClubClick(clubId!)}
                        className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span className="flex-1 text-sm text-slate-300 font-medium">
                      클릭하여 소모임을 선택해주세요
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 선택 가능한 소모임 카드 */}
          <div className="flex flex-col gap-2">
            {votableClubs.map((club) => {
              const rankIdx = rankings.indexOf(club.id);
              const isPlaced = rankIdx !== -1;
              const style = CLUB_STYLES[club.id];
              return (
                <button
                  key={club.id}
                  onClick={() => handleClubClick(club.id)}
                  disabled={allRanked && !isPlaced}
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left font-semibold text-sm transition-all duration-150 active:scale-98 ${
                    isPlaced
                      ? style.selected + " opacity-70"
                      : allRanked
                      ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                      : style.card
                  }`}
                >
                  <span className="text-xl leading-none">{club.emoji}</span>
                  <span className="flex-1">{club.name}</span>
                  {isPlaced && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/30 text-xs font-black">
                      {rankIdx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STEP 3: MVP 선정 ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-bold text-slate-800">소모임 내 MVP 선정</h2>
          </div>

          <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2 mb-4 mt-3">
            <span className="text-sm">⭐</span>
            <p className="text-xs text-violet-700 font-medium">
              <strong>{myClub?.name}</strong> 내에서 MVP를 1명 선택해주세요.
              본인은 선택할 수 없습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mvpCandidates.map((name) => {
              const isSelected = selectedMVP === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedMVP(isSelected ? null : name)}
                  className={`py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100 scale-105"
                      : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                  }`}
                >
                  {isSelected && (
                    <span className="mr-1.5">⭐</span>
                  )}
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 ${
              canProceed
                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-lg shadow-indigo-200"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {!allRanked
              ? `순위를 모두 선택해주세요 (${rankings.filter(Boolean).length}/3)`
              : !selectedMVP
              ? "MVP를 선택해주세요"
              : "최종 확인하기 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

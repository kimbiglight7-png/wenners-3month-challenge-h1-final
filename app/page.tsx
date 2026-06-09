"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CLUBS,
  MEMBERS,
  CLUB_STYLES,
  SESSION_KEY,
  SUBMITTED_KEY,
} from "@/lib/data";

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

export default function Step1Page() {
  const router = useRouter();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [votedKeys, setVotedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(SUBMITTED_KEY)) {
      router.replace("/complete");
      return;
    }
    fetchVotedNames();
  }, [router]);

  async function fetchVotedNames() {
    try {
      const { data } = await supabase
        .from("votes")
        .select("voter_club, voter_name");

      if (data) {
        setVotedKeys(
          new Set(data.map((v) => `${v.voter_club}:${v.voter_name}`))
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClubSelect(clubId: string) {
    setSelectedClub(clubId);
    setSelectedName(null);
  }

  function handleNameSelect(name: string) {
    if (!selectedClub) return;
    if (!votedKeys.has(`${selectedClub}:${name}`)) {
      setSelectedName(name);
    }
  }

  function handleNext() {
    if (!selectedClub || !selectedName) return;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ voterClub: selectedClub, voterName: selectedName })
    );
    router.push("/vote");
  }

  const currentMembers = selectedClub ? MEMBERS[selectedClub] : [];
  const canProceed = !!selectedClub && !!selectedName;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">
              Wenners
            </span>
            <StepIndicator current={1} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            3개월 챌린지 파이널 🏆
          </h1>
          <p className="text-indigo-200 text-sm mt-1 font-medium">
            상반기 투표 · STEP 1 / 3
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-5 mt-6">
        {/* 소모임 선택 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="font-bold text-slate-800">
              본인이 활동한 소모임을 선택해주세요
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {CLUBS.map((club) => {
              const isSelected = selectedClub === club.id;
              const style = CLUB_STYLES[club.id];
              return (
                <button
                  key={club.id}
                  onClick={() => handleClubSelect(club.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left font-semibold text-sm transition-all duration-150 active:scale-98 ${
                    isSelected ? style.selected : style.card
                  }`}
                >
                  <span className="text-2xl leading-none">{club.emoji}</span>
                  <span className="flex-1">{club.name}</span>
                  {isSelected && (
                    <span className="text-base font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 이름 선택 */}
        {selectedClub && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-slate-800">
                본인 이름을 선택해주세요
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentMembers.map((name) => {
                const isVoted = votedKeys.has(`${selectedClub}:${name}`);
                const isSelected = selectedName === name;
                return (
                  <button
                    key={name}
                    onClick={() => handleNameSelect(name)}
                    disabled={isVoted}
                    className={`relative py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all duration-150 ${
                      isVoted
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 active:scale-95"
                    }`}
                  >
                    {name}
                    {isVoted && (
                      <span className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        완료
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 ${
            canProceed
              ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-lg shadow-indigo-200"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
        >
          {canProceed ? "다음 단계로 →" : "소모임과 이름을 선택해주세요"}
        </button>
      </div>
    </div>
  );
}

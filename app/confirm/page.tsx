"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CLUBS,
  RANK_MEDALS,
  RANK_SCORES,
  CLUB_STYLES,
  SESSION_KEY,
  SUBMITTED_KEY,
} from "@/lib/data";
import type { SessionData } from "@/lib/types";

export default function ConfirmPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed: SessionData = JSON.parse(raw);
    if (!parsed.rankings || !parsed.mvpName) {
      router.replace("/vote");
      return;
    }
    setSession(parsed);
  }, [router]);

  async function handleSubmit() {
    if (!session?.rankings || !session.mvpName) return;
    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase.from("votes").insert({
      voter_club: session.voterClub,
      voter_name: session.voterName,
      rank1_club: session.rankings[0],
      rank2_club: session.rankings[1],
      rank3_club: session.rankings[2],
      mvp_name: session.mvpName,
    });

    if (dbError) {
      if (dbError.code === "23505") {
        // 이미 투표한 경우 완료 페이지로 이동
        localStorage.setItem(SUBMITTED_KEY, "true");
        router.replace("/complete");
      } else {
        setError("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      setSubmitting(false);
      return;
    }

    localStorage.setItem(SUBMITTED_KEY, "true");
    router.replace("/complete");
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const myClub = CLUBS.find((c) => c.id === session.voterClub);
  const rankings = session.rankings!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center gap-1.5 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="w-2 h-2 rounded-full bg-white/60" />
            ))}
          </div>
          <h1 className="text-2xl font-black tracking-tight">최종 확인 ✅</h1>
          <p className="text-indigo-200 text-sm mt-1 font-medium">
            아래 내용을 확인 후 투표를 완료해주세요
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-6">
        {/* 투표자 정보 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            투표자 정보
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{myClub?.emoji}</span>
            <div>
              <p className="font-black text-lg text-slate-900">
                {session.voterName}
              </p>
              <p className="text-sm text-slate-500">{myClub?.name}</p>
            </div>
          </div>
        </div>

        {/* 소모임 순위 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            우수 소모임 순위
          </p>
          <div className="flex flex-col gap-2">
            {rankings.map((clubId, idx) => {
              const club = CLUBS.find((c) => c.id === clubId);
              const style = CLUB_STYLES[clubId];
              if (!club) return null;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.text} border-current/20`}
                >
                  <span className="text-xl w-8 text-center">
                    {RANK_MEDALS[idx]}
                  </span>
                  <span className="text-lg">{club.emoji}</span>
                  <span className="flex-1 font-bold text-sm">{club.name}</span>
                  <span className="font-black text-base">
                    +{RANK_SCORES[idx]}점
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MVP */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            소모임 내 MVP
          </p>
          <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-black text-lg text-amber-700">
                {session.mvpName}
              </p>
              <p className="text-sm text-amber-500">{myClub?.name} MVP</p>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
            <p className="text-rose-600 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 active:scale-98 transition-all disabled:opacity-50"
          >
            ← 수정하기
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-[2] py-4 rounded-2xl font-black text-base transition-all duration-200 ${
              submitting
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-lg shadow-indigo-200"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                제출 중...
              </span>
            ) : (
              "🗳️ 투표 완료"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 pb-2">
          투표 완료 후에는 수정이 불가능합니다
        </p>
      </div>
    </div>
  );
}

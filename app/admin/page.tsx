"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  CLUBS,
  MEMBERS,
  CLUB_STYLES,
  RANK_MEDALS,
  TOTAL_MEMBERS,
} from "@/lib/data";
import type { VoteRecord, ClubScore, MVPResult } from "@/lib/types";

const ADMIN_PASSWORD = "0316";

// ─── 점수 계산 헬퍼 ───────────────────────────────────────────
function calcClubScores(votes: VoteRecord[]): ClubScore[] {
  const map: Record<
    string,
    { score: number; rank1: number; rank2: number; rank3: number }
  > = {};

  CLUBS.forEach((c) => {
    map[c.id] = { score: 0, rank1: 0, rank2: 0, rank3: 0 };
  });

  votes.forEach((v) => {
    if (map[v.rank1_club]) {
      map[v.rank1_club].score += 3;
      map[v.rank1_club].rank1 += 1;
    }
    if (map[v.rank2_club]) {
      map[v.rank2_club].score += 2;
      map[v.rank2_club].rank2 += 1;
    }
    if (map[v.rank3_club]) {
      map[v.rank3_club].score += 1;
      map[v.rank3_club].rank3 += 1;
    }
  });

  return CLUBS.map((c) => ({
    clubId: c.id,
    clubName: c.name,
    emoji: c.emoji,
    totalScore: map[c.id].score,
    rank1Votes: map[c.id].rank1,
    rank2Votes: map[c.id].rank2,
    rank3Votes: map[c.id].rank3,
  })).sort((a, b) => b.totalScore - a.totalScore);
}

function calcMVPs(votes: VoteRecord[]): MVPResult[] {
  const map: Record<string, Record<string, number>> = {};

  votes.forEach((v) => {
    if (!map[v.voter_club]) map[v.voter_club] = {};
    map[v.voter_club][v.mvp_name] =
      (map[v.voter_club][v.mvp_name] || 0) + 1;
  });

  return CLUBS.map((c) => {
    const memberVotes = map[c.id] || {};
    const sorted = Object.entries(memberVotes).sort(
      ([, a], [, b]) => b - a
    ) as [string, number][];
    return {
      clubId: c.id,
      clubName: c.name,
      emoji: c.emoji,
      mvpName: sorted[0]?.[0] ?? null,
      mvpVotes: sorted[0]?.[1] ?? 0,
      allVotes: sorted,
    };
  });
}

// ─── 비밀번호 게이트 ────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-5">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-7">
          <span className="text-5xl">🔐</span>
          <h1 className="text-xl font-black text-slate-800 mt-3">
            관리자 대시보드
          </h1>
          <p className="text-slate-400 text-sm mt-1">비밀번호를 입력해주세요</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            maxLength={10}
            placeholder="비밀번호"
            autoFocus
            className={`w-full text-center text-2xl font-black tracking-[0.5em] border-2 rounded-2xl py-4 px-4 outline-none transition-all ${
              shake
                ? "border-rose-400 bg-rose-50 text-rose-500"
                : "border-slate-200 focus:border-indigo-400 text-slate-800"
            }`}
          />
          <button
            type="submit"
            className="w-full mt-4 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 active:scale-98 transition-all shadow-lg shadow-indigo-200"
          >
            입장하기
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 메인 대시보드 ────────────────────────────────────────────
function Dashboard() {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchVotes = useCallback(async () => {
    const { data } = await supabase.from("votes").select("*");
    if (data) {
      setVotes(data as VoteRecord[]);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVotes();

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        () => fetchVotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVotes]);

  const scores = calcClubScores(votes);
  const mvps = calcMVPs(votes);
  const totalVotes = votes.length;
  const maxScore = scores[0]?.totalScore || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-slate-400">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-700 to-violet-700 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">
                Wenners
              </p>
              <h1 className="text-2xl font-black">
                3개월 챌린지 파이널 🏆 실시간 결과
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* 참여 현황 */}
              <div className="text-right bg-white/10 rounded-xl px-4 py-2">
                <p className="text-indigo-300 text-xs font-semibold">참여 현황</p>
                <p className="text-2xl font-black">
                  {totalVotes}
                  <span className="text-indigo-300 text-sm font-normal">
                    /{TOTAL_MEMBERS}명
                  </span>
                </p>
              </div>
              {/* 실시간 인디케이터 */}
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-bold">LIVE</span>
              </div>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-indigo-300/60 text-xs mt-2">
              마지막 업데이트:{" "}
              {lastUpdated.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ─── 우수 소모임 순위 ─── */}
        <section>
          <h2 className="text-lg font-black text-slate-200 mb-5 flex items-center gap-2">
            <span>🏅</span> 우수 소모임 순위
          </h2>

          {totalVotes === 0 ? (
            <div className="bg-slate-800 rounded-2xl p-10 text-center">
              <p className="text-slate-500 text-lg">아직 투표가 없습니다</p>
            </div>
          ) : (
            <>
              {/* Top 3 포디움 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { rank: 0, order: 1, height: "h-40", medal: "🥇" },
                  { rank: 1, order: 0, height: "h-32", medal: "🥈" },
                  { rank: 2, order: 2, height: "h-24", medal: "🥉" },
                ].map(({ rank, order, height, medal }) => {
                  const item = top3[rank];
                  if (!item) return null;
                  const style = CLUB_STYLES[item.clubId];
                  return (
                    <div
                      key={rank}
                      style={{ order }}
                      className={`flex flex-col items-center gap-2 bg-slate-800 rounded-2xl p-4 border border-slate-700 transition-all`}
                    >
                      <span className="text-3xl">{medal}</span>
                      <span className="text-2xl">{item.emoji}</span>
                      <p className="text-xs font-bold text-center text-slate-300 leading-tight">
                        {item.clubName}
                      </p>
                      <div className="text-center">
                        <p className="text-3xl font-black text-white">
                          {item.totalScore}
                        </p>
                        <p className="text-xs text-slate-400">점</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-center">
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                          1등 {item.rank1Votes}표
                        </span>
                        <span className="text-xs bg-slate-600/50 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">
                          2등 {item.rank2Votes}표
                        </span>
                        <span className="text-xs bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">
                          3등 {item.rank3Votes}표
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4위 이하 */}
              {rest.length > 0 && (
                <div className="flex flex-col gap-2">
                  {rest.map((item, idx) => {
                    const pct = maxScore > 0 ? (item.totalScore / maxScore) * 100 : 0;
                    return (
                      <div
                        key={item.clubId}
                        className="bg-slate-800 rounded-xl px-5 py-4 border border-slate-700 flex items-center gap-4"
                      >
                        <span className="text-slate-500 font-black w-6 text-center text-sm">
                          {idx + 4}위
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-slate-200">
                              {item.clubName}
                            </p>
                            <p className="text-sm font-black text-white">
                              {item.totalScore}점
                            </p>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {/* ─── 소모임별 MVP ─── */}
        <section>
          <h2 className="text-lg font-black text-slate-200 mb-5 flex items-center gap-2">
            <span>⭐</span> 소모임별 MVP
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mvps.map((mvp) => {
              const style = CLUB_STYLES[mvp.clubId];
              const members = MEMBERS[mvp.clubId] || [];
              const totalClubVotes = votes.filter(
                (v) => v.voter_club === mvp.clubId
              ).length;

              return (
                <div
                  key={mvp.clubId}
                  className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"
                >
                  {/* 클럽 헤더 */}
                  <div className={`px-4 py-3 ${style.bg} border-b border-slate-700`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mvp.emoji}</span>
                      <p className={`text-xs font-bold ${style.text} leading-tight flex-1`}>
                        {mvp.clubName}
                      </p>
                      <span className="text-xs text-slate-500 font-medium">
                        {totalClubVotes}표 집계
                      </span>
                    </div>
                  </div>

                  {/* MVP 결과 */}
                  <div className="p-4">
                    {mvp.mvpName ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <p className="font-black text-xl text-white">
                              {mvp.mvpName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {mvp.mvpVotes}표 획득
                            </p>
                          </div>
                        </div>

                        {/* 멤버별 득표 현황 */}
                        <div className="space-y-1.5">
                          {members
                            .map((name) => {
                              const voteCount =
                                mvp.allVotes.find(
                                  ([n]) => n === name
                                )?.[1] ?? 0;
                              const pct =
                                mvp.mvpVotes > 0
                                  ? (voteCount / mvp.mvpVotes) * 100
                                  : 0;
                              return { name, voteCount, pct };
                            })
                            .sort((a, b) => b.voteCount - a.voteCount)
                            .map(({ name, voteCount, pct }) => (
                              <div key={name} className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 w-12 text-right font-medium truncate">
                                  {name}
                                </span>
                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      name === mvp.mvpName
                                        ? "bg-amber-400"
                                        : "bg-slate-500"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-6 text-right font-mono">
                                  {voteCount}
                                </span>
                              </div>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-slate-500 text-sm">집계 중...</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 진행률 바 */}
        <section className="bg-slate-800 rounded-2xl px-5 py-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-300">전체 투표 진행률</p>
            <p className="text-sm font-black text-white">
              {totalVotes} / {TOTAL_MEMBERS}명
            </p>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((totalVotes / TOTAL_MEMBERS) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-right">
            {Math.round((totalVotes / TOTAL_MEMBERS) * 100)}% 완료
          </p>
        </section>
      </div>
    </div>
  );
}

// ─── 페이지 진입점 ────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("wenners_admin_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  function handleAuth() {
    sessionStorage.setItem("wenners_admin_auth", "true");
    setAuthenticated(true);
  }

  return authenticated ? (
    <Dashboard />
  ) : (
    <PasswordGate onAuth={handleAuth} />
  );
}

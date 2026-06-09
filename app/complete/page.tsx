"use client";

import { useEffect, useState } from "react";
import { CLUBS, RANK_MEDALS, SESSION_KEY } from "@/lib/data";
import type { SessionData } from "@/lib/types";

export default function CompletePage() {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      setSession(JSON.parse(raw));
    }
  }, []);

  const myClub = session ? CLUBS.find((c) => c.id === session.voterClub) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-violet-600 to-purple-700 flex flex-col items-center justify-center px-5 text-white">
      {/* 메인 컨텐츠 */}
      <div className="text-center space-y-6 max-w-sm w-full">
        {/* 이모지 애니메이션 */}
        <div className="flex justify-center gap-3 text-5xl animate-bounce">
          <span>🎉</span>
          <span style={{ animationDelay: "0.1s" }}>🏆</span>
          <span style={{ animationDelay: "0.2s" }}>🎊</span>
        </div>

        <div>
          <h1 className="text-3xl font-black mb-2">투표 완료!</h1>
          <p className="text-indigo-200 text-lg font-medium">
            참여해주셔서 감사합니다 😊
          </p>
        </div>

        {/* 투표 요약 */}
        {session && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left space-y-4 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">{myClub?.emoji}</span>
              <span className="font-bold">{session.voterName}</span>
              <span className="text-indigo-300 text-sm">님의 투표</span>
            </div>

            {session.rankings && (
              <div>
                <p className="text-xs text-indigo-300 font-semibold mb-2 uppercase tracking-wider">
                  선택한 우수 소모임
                </p>
                <div className="space-y-1.5">
                  {session.rankings.map((clubId, idx) => {
                    const club = CLUBS.find((c) => c.id === clubId);
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span>{RANK_MEDALS[idx]}</span>
                        <span>{club?.emoji}</span>
                        <span className="font-semibold">{club?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {session.mvpName && (
              <div>
                <p className="text-xs text-indigo-300 font-semibold mb-2 uppercase tracking-wider">
                  선택한 MVP
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span>⭐</span>
                  <span className="font-bold">{session.mvpName}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
          <p className="text-sm text-indigo-200 font-medium text-center">
            이제 발표를 즐겨주세요! 🚀
          </p>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {["🏆", "⭐", "🎯", "💪", "📚", "🤖", "📈", "📜"].map(
          (emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                left: `${10 + i * 12}%`,
                top: `${5 + (i % 3) * 30}%`,
                transform: `rotate(${i * 20}deg)`,
              }}
            >
              {emoji}
            </span>
          )
        )}
      </div>
    </div>
  );
}

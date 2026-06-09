-- =====================================================
-- Wenners 3개월 챌린지 파이널 - Supabase 스키마
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- =====================================================

-- votes 테이블 생성
CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_club  TEXT        NOT NULL,
  voter_name  TEXT        NOT NULL,
  rank1_club  TEXT        NOT NULL,
  rank2_club  TEXT        NOT NULL,
  rank3_club  TEXT        NOT NULL,
  mvp_name    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- 동일인 중복 투표 방지
  CONSTRAINT unique_voter UNIQUE (voter_club, voter_name)
);

-- Row Level Security 활성화
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 누구나 투표 데이터 INSERT 가능 (익명 투표)
CREATE POLICY "Allow public insert" ON public.votes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 누구나 SELECT 가능 (투표 여부 확인 및 관리자 대시보드)
CREATE POLICY "Allow public select" ON public.votes
  FOR SELECT TO anon, authenticated
  USING (true);

-- Realtime 활성화 (관리자 대시보드 실시간 업데이트)
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

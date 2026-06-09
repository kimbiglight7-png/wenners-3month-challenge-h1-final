export interface Club {
  id: string;
  name: string;
  emoji: string;
}

export interface SessionData {
  voterClub: string;
  voterName: string;
  rankings?: string[]; // [rank1ClubId, rank2ClubId, rank3ClubId]
  mvpName?: string;
}

export interface VoteRecord {
  id: string;
  voter_club: string;
  voter_name: string;
  rank1_club: string;
  rank2_club: string;
  rank3_club: string;
  mvp_name: string;
  created_at: string;
}

export interface ClubScore {
  clubId: string;
  clubName: string;
  emoji: string;
  totalScore: number;
  rank1Votes: number;
  rank2Votes: number;
  rank3Votes: number;
}

export interface MVPResult {
  clubId: string;
  clubName: string;
  emoji: string;
  mvpName: string | null;
  mvpVotes: number;
  allVotes: [string, number][];
}

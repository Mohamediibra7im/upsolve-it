export type RoadmapLevel = {
  _id: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
  videoUnlockSheetPct: number;
  sheetUnlockTopicPct: number;
  levelCompletionPct: number;
  xpPerAcceptedProblem: number;
  topicsCount: number;
  topicsUnlockedCount: number;
};

export type RoadmapTopicBase = {
  _id: string;
  levelId: string;
  title: string;
  description: string;
  orderIndex: number;
  subtopics: string[];
  xpVideoReward: number;
};

export type RoadmapTopicSummary = RoadmapTopicBase & {
  hasVideo: boolean;
  hasSheet: boolean;
  problemsCount: number;
  progress: {
    videoPct: number;
    sheetUnlocked: boolean;
    lastPositionSec: number;
    isLocked: boolean;
    isComplete: boolean;
  };
};

export type RoadmapVideo = {
  _id: string;
  topicId: string;
  title: string;
  youtubeUrl: string;
  durationSec: number | null;
};

export type RoadmapSheet = {
  _id: string;
  topicId: string;
  title: string;
  cfGroupUrl: string;
  groupNote: string;
};

export type RoadmapProblem = {
  _id: string;
  sheetId: string;
  cfProblemId: string;
  title: string;
  difficulty: string;
  orderIndex: number;
  xpReward: number;
};

export type RoadmapLevelDetail = {
  level: RoadmapLevel;
  topics: RoadmapTopicSummary[];
};

export type RoadmapTopicDetail = {
  level: RoadmapLevel;
  topic: RoadmapTopicBase;
  video: RoadmapVideo | null;
  sheet: RoadmapSheet | null;
  problems: RoadmapProblem[];
  progress: {
    videoPct: number;
    sheetUnlocked: boolean;
    lastPositionSec: number;
    problemProgress: Record<string, boolean>;
  };
};

export type SyncResult = {
  newlySolved: string[];
  xpEarned: number;
  sheetPct: number;
  problemsSolved: number;
  totalProblems: number;
  topicProgress?: any;
  levelProgress?: any;
};

export type ToggleProblemResult = {
  problemId: string;
  isSolved: boolean;
  xpDelta: number;
  sheetPct: number;
  problemsSolved: number;
  totalProblems: number;
};

export type UserRoadmapSummary = {
  totalXp: number;
  problemsSolved: number;
  topicsCompleted: number;
  levelsCompleted: number;
  currentLevel: {
    _id: string;
    title: string;
  } | null;
};

export type LeaderboardEntry = {
  userId: string;
  handle: string;
  avatar: string | null;
  totalXp: number;
  topicsDone: number;
  problemsSolved: number;
  rank: number;
};

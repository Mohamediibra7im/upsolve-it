export type RoadmapLevel = {
  _id: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
  visibility: 'all' | 'specific_users';
  allowedUserIds: string[];
  levelBonusXp: number;
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
  requiredLearningPct: number;
  requiredProblemPct: number;
  topicXpReward: number;
  groupLinks?: string | Array<string | { link: string }>;
  groupNote?: string;
};

export type RoadmapTopicSummary = RoadmapTopicBase & {
  resourcesCount: number;
  problemsCount: number;
  progress: {
    learningPct: number;
    problemPct: number;
    isLocked: boolean;
    isComplete: boolean;
  };
};

export type RoadmapResource = {
  _id: string;
  topicId: string;
  title: string;
  description: string;
  language: 'Arabic' | 'English';
  type: 'Video' | 'Article' | 'Documentation' | 'Tutorial' | 'Course' | 'PDF' | 'Website';
  url: string;
  weight: number;
  xpReward: number;
  videoCompletionThresholdPct: number;
  orderIndex: number;
};

export type RoadmapProblem = {
  _id: string;
  topicId: string;
  name: string;
  url: string;
  orderIndex: number;
  xpReward: number;
  cfProblemId?: string;
};

export type RoadmapLevelDetail = {
  level: RoadmapLevel;
  topics: RoadmapTopicSummary[];
};

export type RoadmapTopicDetail = {
  level: RoadmapLevel;
  topic: RoadmapTopicBase;
  resources: RoadmapResource[];
  problems: RoadmapProblem[];
  progress: {
    learningPct: number;
    problemPct: number;
    isTopicComplete: boolean;
    resourceProgress: Record<string, { watchPct: number; isCompleted: boolean; lastPositionSec: number }>;
    problemProgress: Record<string, boolean>;
  };
};

export type SyncResult = {
  newlySolved: string[];
  xpEarned: number;
  problemPct: number;
  problemsSolved: number;
  totalProblems: number;
};

export type ToggleProblemResult = {
  problemId: string;
  isSolved: boolean;
  xpDelta: number;
  problemPct: number;
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

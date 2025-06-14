export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: string;
  emailNotifications: boolean;
  remindersSent: number;
  lastSubmissionDate?: string;
}

export interface Contest {
  _id: string;
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
  creationTimeSeconds: number;
}

export interface Submission {
  _id: string;
  contestId?: number;
  creationTimeSeconds: number;
  handle: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
  verdict: string;
  programmingLanguage: string;
}

export interface ProblemStats {
  totalSolved: number;
  averageRating: number;
  hardestProblem: {
    name: string;
    rating: number;
  };
  averagePerDay: number;
  ratingDistribution: { [key: string]: number };
}
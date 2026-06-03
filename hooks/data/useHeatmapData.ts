import { useMemo } from "react";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";

export interface HeatmapValue {
  date: string;
  count: number;
}

export interface HeatmapData {
  values: HeatmapValue[];
  totalSolved: number;
}

export interface RoadmapActivityData {
  problemDates: string[];
  topicDates: string[];
}

export const useHeatmapData = (
  history: Training[],
  upsolvedProblems: TrainingProblem[] = [],
  roadmapActivity: RoadmapActivityData = { problemDates: [], topicDates: [] },
): HeatmapData => {
  return useMemo(() => {
    const dailyCounts: { [key: string]: number } = {};
    const solvedProblemKeys = new Set<string>(); // For deduplication
    let totalSolved = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const processSolvedTime = (solvedTime: number | string | null | undefined) => {
      if (!solvedTime) return null;
      const numTime = typeof solvedTime === 'string' ? Number.parseInt(solvedTime, 10) : solvedTime;
      if (Number.isNaN(numTime)) return null;
      const ms = numTime < 10000000000 ? numTime * 1000 : numTime;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const processDateString = (dateStr: string) => {
      const d = new Date(dateStr);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const addToHeatmap = (d: Date, problemKey: string) => {
      if (!d || Number.isNaN(d.getTime())) return;
      
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateKey = `${year}/${month}/${day}`;
      const uniqueKey = `${dateKey}-${problemKey}`;

      if (!solvedProblemKeys.has(uniqueKey)) {
        solvedProblemKeys.add(uniqueKey);
        totalSolved++;
        if (d >= oneYearAgo) {
          dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
        }
      }
    };

    // 1. Process Native Training History
    history?.forEach((training) => {
      let sessionHasSolvedProblem = false;
      training.problems?.forEach((problem) => {
        const d = processSolvedTime(problem.solvedTime);
        if (d) {
          addToHeatmap(d, `${problem.contestId}-${problem.index}`);
          sessionHasSolvedProblem = true;
        }
      });

      // Fallback: If session has solves but problems missing solvedTime
      if (!sessionHasSolvedProblem && training.endTime) {
        const hasAC = training.problems?.some(p => p.solvedTime !== null);
        if (hasAC) {
          const d = processSolvedTime(training.endTime);
          if (d) addToHeatmap(d, `session-${training._id}`);
        }
      }
    });

    // 2. Process Upsolve Problems
    upsolvedProblems?.forEach((problem) => {
      const d = processSolvedTime(problem.solvedTime);
      if (d) {
        addToHeatmap(d, `${problem.contestId}-${problem.index}`);
      }
    });

    // 3. Process Roadmap Problem Solves
    roadmapActivity.problemDates?.forEach((dateStr, idx) => {
      const d = processDateString(dateStr);
      if (d) {
        addToHeatmap(d, `roadmap-problem-${idx}`);
      }
    });

    // 4. Process Roadmap Topic Completions
    roadmapActivity.topicDates?.forEach((dateStr, idx) => {
      const d = processDateString(dateStr);
      if (d) {
        addToHeatmap(d, `roadmap-topic-${idx}`);
      }
    });

    const values = Object.keys(dailyCounts).map((date) => ({
      date,
      count: dailyCounts[date],
    }));

    return { values, totalSolved };
  }, [history, upsolvedProblems, roadmapActivity]);
};

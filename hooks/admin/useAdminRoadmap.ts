import useSWR from "swr";
import { swrFetcher, apiClient } from "@/lib/apiClient";
import type { RoadmapLevel, RoadmapTopicSummary, RoadmapVideo, RoadmapSheet, RoadmapProblem } from "@/types/Roadmap";

export const useAdminRoadmapLevels = () => {
  const { data, error, isLoading, mutate } = useSWR<{ levels: RoadmapLevel[] }>(
    "/api/admin/roadmap/levels",
    swrFetcher
  );

  const createLevel = async (body: Partial<RoadmapLevel>) => {
    const res = await apiClient.post<{ level: RoadmapLevel }>("/api/admin/roadmap/levels", body);
    await mutate();
    return res.level;
  };

  const updateLevel = async (id: string, body: Partial<RoadmapLevel>) => {
    const res = await apiClient.patch<{ level: RoadmapLevel }>(`/api/admin/roadmap/levels/${id}`, body);
    await mutate();
    return res.level;
  };

  const deleteLevel = async (id: string) => {
    await apiClient.delete(`/api/admin/roadmap/levels/${id}`);
    await mutate();
  };

  return {
    levels: data?.levels ?? [],
    isLoading,
    error: error ? String(error) : null,
    mutateLevels: mutate,
    createLevel,
    updateLevel,
    deleteLevel,
  };
};

export const useAdminRoadmapTopics = (levelId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ topics: RoadmapTopicSummary[] }>(
    levelId ? `/api/admin/roadmap/levels/${levelId}/topics` : null,
    swrFetcher
  );

  const createTopic = async (body: Partial<RoadmapTopicSummary>) => {
    if (!levelId) throw new Error("levelId is required to create a topic");
    const res = await apiClient.post<{ topic: RoadmapTopicSummary }>(`/api/admin/roadmap/levels/${levelId}/topics`, body);
    await mutate();
    return res.topic;
  };

  const updateTopic = async (topicId: string, body: Partial<RoadmapTopicSummary>) => {
    const res = await apiClient.patch<{ topic: RoadmapTopicSummary }>(`/api/admin/roadmap/topics/${topicId}`, body);
    await mutate();
    return res.topic;
  };

  const deleteTopic = async (topicId: string) => {
    await apiClient.delete(`/api/admin/roadmap/topics/${topicId}`);
    await mutate();
  };

  const upsertVideo = async (topicId: string, body: Partial<RoadmapVideo>) => {
    const res = await apiClient.post<{ video: RoadmapVideo }>(`/api/admin/roadmap/topics/${topicId}/video`, body);
    await mutate();
    return res.video;
  };

  const deleteVideo = async (topicId: string) => {
    await apiClient.delete(`/api/admin/roadmap/topics/${topicId}/video`);
    await mutate();
  };

  const upsertSheet = async (topicId: string, body: Partial<RoadmapSheet>) => {
    const res = await apiClient.post<{ sheet: RoadmapSheet }>(`/api/admin/roadmap/topics/${topicId}/sheet`, body);
    await mutate();
    return res.sheet;
  };

  const addProblem = async (sheetId: string, body: Partial<RoadmapProblem>) => {
    const res = await apiClient.post<{ problem: RoadmapProblem }>(`/api/admin/roadmap/sheets/${sheetId}/problems`, body);
    await mutate();
    return res.problem;
  };

  const deleteProblem = async (problemId: string) => {
    await apiClient.delete(`/api/admin/roadmap/problems/${problemId}`);
    await mutate();
  };

  const deleteProblems = async (problemIds: string[]) => {
    await apiClient.delete(`/api/admin/roadmap/problems`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemIds }),
    });
    await mutate();
  };

  const importProblems = async (sheetId: string, body: { contestId?: number; force?: boolean }) => {
    const res = await apiClient.post(`/api/admin/roadmap/sheets/${sheetId}/import`, body);
    await mutate();
    return res;
  };

  return {
    topics: data?.topics ?? [],
    isLoading,
    error: error ? String(error) : null,
    mutateTopics: mutate,
    createTopic,
    updateTopic,
    deleteTopic,
    upsertVideo,
    deleteVideo,
    upsertSheet,
    addProblem,
    deleteProblem,
    deleteProblems,
    importProblems,
  };
};

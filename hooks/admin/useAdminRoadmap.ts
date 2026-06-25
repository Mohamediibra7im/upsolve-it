import useSWR from "swr";
import { swrFetcher, apiClient } from "@/lib/apiClient";
import type { RoadmapLevel, RoadmapTopicSummary, RoadmapResource, RoadmapProblem } from "@/types/Roadmap";

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

  const grantLevelAccess = async (levelId: string, userIds: string[]) => {
    const res = await apiClient.post<{ level: RoadmapLevel }>(
      `/api/admin/roadmap/levels/${levelId}/grant`,
      { userIds },
    );
    await mutate();
    return res.level;
  };

  const revokeLevelAccess = async (levelId: string, userIds: string[]) => {
    const res = await apiClient.post<{ level: RoadmapLevel }>(
      `/api/admin/roadmap/levels/${levelId}/revoke`,
      { userIds },
    );
    await mutate();
    return res.level;
  };

  return {
    levels: data?.levels ?? [],
    isLoading,
    error: error ? String(error) : null,
    mutateLevels: mutate,
    createLevel,
    updateLevel,
    deleteLevel,
    grantLevelAccess,
    revokeLevelAccess,
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

  // === RESOURCE ENDPOINTS ===
  const addResource = async (topicId: string, body: Partial<RoadmapResource>) => {
    const res = await apiClient.post<{ resource: RoadmapResource }>(`/api/admin/roadmap/topics/${topicId}/resources`, body);
    await mutate();
    return res.resource;
  };

  const updateResource = async (resourceId: string, body: Partial<RoadmapResource>) => {
    const res = await apiClient.patch<{ resource: RoadmapResource }>(`/api/admin/roadmap/resources/${resourceId}`, body);
    await mutate();
    return res.resource;
  };

  const deleteResource = async (resourceId: string) => {
    await apiClient.delete(`/api/admin/roadmap/resources/${resourceId}`);
    await mutate();
  };

  const reorderResource = async (resourceId: string, orderIndex: number) => {
    const res = await apiClient.patch<{ resource: RoadmapResource }>(`/api/admin/roadmap/resources/${resourceId}/reorder`, { orderIndex });
    await mutate();
    return res.resource;
  };

  // === PROBLEM ENDPOINTS ===
  const addProblem = async (topicId: string, body: Partial<RoadmapProblem>) => {
    const res = await apiClient.post<{ problem: RoadmapProblem }>(`/api/admin/roadmap/topics/${topicId}/problems`, body);
    await mutate();
    return res.problem;
  };

  const addProblems = async (topicId: string, problems: Array<{ cfProblemId: string; name: string; xpReward: number; url: string }>) => {
    const res = await apiClient.post<{ inserted: number; skipped: number }>(
      `/api/admin/roadmap/topics/${topicId}/problems/bulk`,
      { problems }
    );
    await mutate();
    return res;
  };

  const updateProblem = async (problemId: string, body: Partial<RoadmapProblem>) => {
    const res = await apiClient.patch<{ problem: RoadmapProblem }>(`/api/admin/roadmap/problems/${problemId}`, body);
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

  const reorderProblem = async (problemId: string, orderIndex: number) => {
    const res = await apiClient.patch<{ problem: RoadmapProblem }>(`/api/admin/roadmap/problems/${problemId}/reorder`, { orderIndex });
    await mutate();
    return res.problem;
  };

  const importProblems = async (topicId: string, body: { contestId?: number; force?: boolean }) => {
    const res = await apiClient.post(`/api/admin/roadmap/topics/${topicId}/import`, body);
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
    addResource,
    updateResource,
    deleteResource,
    reorderResource,
    addProblem,
    addProblems,
    updateProblem,
    deleteProblem,
    deleteProblems,
    reorderProblem,
    importProblems,
  };
};


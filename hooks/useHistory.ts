import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { Training } from "@/types/Training";
import { getAccuratePerformance } from "@/utils/getPerformance";
import useUser from "@/hooks/useUser";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

const useHistory = () => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const {
    data: history,
    error,
    mutate,
  } = useSWR<Training[]>(isClient ? "/api/trainings" : null, swrFetcher);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addTraining = useCallback(
    async (training: Training) => {
      if (!isClient) return;

      // Use the user's current rating for accurate performance calculation
      const userRating = user?.rating || 1500; // Default to 1500 if rating not available
      const performance = getAccuratePerformance(training, userRating);
      const newTraining = { ...training, performance };

      try {
        await apiFetcher("/api/trainings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTraining),
        });
        // Revalidate the SWR cache to show the new training
        mutate();
      } catch (error) {
        console.error(error);
      }
    },
    [isClient, mutate, user?.rating],
  );

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteTraining = useCallback(
    async (trainingId: string) => {
      if (isDeleting) return;

      setIsDeleting(trainingId);

      // Optimistic update
      mutate(
        (currentData = []) =>
          currentData.filter((training) => training._id !== trainingId),
        false,
      );

      try {
        await apiFetcher(`/api/trainings/${trainingId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting training:", error);
        // Rollback on error
        mutate();
      } finally {
        setIsDeleting(null);
      }
    },
    [mutate, isDeleting],
  );

  return {
    history: history || [],
    isLoading: (!error && !history) || !isClient,
    error,
    addTraining,
    deleteTraining,
    isDeleting,
  };
};

export default useHistory;





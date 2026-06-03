"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";

const RedirectToSession = () => {
  const params = useParams<{ id: string; topicId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params?.id && params?.topicId) {
      router.replace(`/roadmap/levels/${params.id}/topics/${params.topicId}`);
    }
  }, [params, router]);

  return <Loader message="Redirecting to session briefing..." />;
};

export default RedirectToSession;

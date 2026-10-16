"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MemberPageState from "@/components/features/profile/MemberPageState";

const RedirectToSession = () => {
  const params = useParams<{ id: string; topicId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params?.id && params?.topicId) {
      router.replace(`/roadmap/levels/${params.id}/topics/${params.topicId}`);
    }
  }, [params, router]);

  return <MemberPageState kind="loading" title="Opening your learning workspace" description="Your learning resources and practice problems are together in one place."><Button asChild variant="outline"><Link href={params?.id && params?.topicId ? `/roadmap/levels/${params.id}/topics/${params.topicId}` : "/roadmap"}>Continue to topic</Link></Button></MemberPageState>;
};

export default RedirectToSession;

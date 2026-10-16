"use client";

import { AdminState } from "@/components/features/admin/AdminState";
import { useParams } from "next/navigation";
import { AdminRoadmapTopics as AdminRoadmapTopicsComponent } from "@/components/features/admin";

export default function AdminRoadmapTopicsClient() {
  const params = useParams<{ levelId: string }>();
  const levelId = params?.levelId ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-medium tracking-tight text-foreground">
          Curriculum & Sessions
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage session materials, lecture video briefs, and Codeforces sheet
          imports.
        </p>
      </div>
      {levelId ? (
        <AdminRoadmapTopicsComponent levelId={levelId} />
      ) : (
        <AdminState
          title="Level not found"
          description="Return to the roadmap to choose another level."
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/ui/kit";
import { useAdminLogs } from "@/hooks/admin/useAdminLogs";
import { AdminPager } from "./AdminPager";
import { AdminState, AdminRetry } from "./AdminState";

/** Deletes read as failed; role, lock and cancel actions as pending; the rest is plain. */
function ActionBadge({ action }: { action: string }) {
  const label = action.replaceAll("_", " ");
  if (action.includes("DELETE"))
    return (
      <Badge variant="failed">
        <Trash2 />
        {label}
      </Badge>
    );
  if (/ROLE|LOCK|CANCEL/.test(action))
    return (
      <Badge variant="pending">
        <TriangleAlert />
        {label}
      </Badge>
    );
  return <Badge>{label}</Badge>;
}

export default function AdminLogsView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    performedByHandle: "",
    action: "",
    entity: "",
  });

  const { logs, total, isLoading, isError, mutate } = useAdminLogs({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    action: filters.action || undefined,
    entity: filters.entity || undefined,
    performedByHandle: filters.performedByHandle || undefined,
  });

  const filterInput = (
    key: keyof typeof filters,
    label: string,
    placeholder: string,
  ) => (
    <Input
      type="search"
      aria-label={label}
      placeholder={placeholder}
      value={filters[key]}
      onChange={(e) => {
        setFilters({ ...filters, [key]: e.target.value });
        setPage(1);
      }}
      className="h-10 w-full sm:w-56"
    />
  );

  return (
    <>
      <PageHead eyebrow="Admin" title="Logs" />

      <section className="u-panel" aria-label="Logs">
        <div className="u-panel__head">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            {filterInput("performedByHandle", "Filter by handle", "Handle")}
            {filterInput(
              "action",
              "Filter by exact action name",
              "Action, such as SYNC_RATING",
            )}
            {filterInput(
              "entity",
              "Filter by exact entity name",
              "Entity, such as User",
            )}
          </div>
          <span className="t-sm t-num t-muted">{total} events</span>
        </div>

        {isLoading ? (
          <AdminState tone="loading" title="Loading the log…" />
        ) : isError ? (
          <AdminState
            tone="error"
            title="The log did not load"
            description="The server did not answer. Try again in a minute."
            action={<AdminRetry onRetry={() => mutate()} />}
            className="border-0"
          />
        ) : logs.length === 0 ? (
          <AdminState
            title="Nothing logged here"
            description="Admin actions appear in this list. With a filter on, try a wider one."
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="u-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Handle</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="t-num whitespace-nowrap text-ink-muted">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          {...log.performedBy}
                          codeforcesHandle={log.performedByHandle}
                          size={24}
                        />
                        <b className="whitespace-nowrap">
                          {log.performedByHandle}
                        </b>
                      </div>
                    </td>
                    <td className="text-ink-muted">{log.entity}</td>
                    <td className="t-sm min-w-64">
                      {Object.entries(log.details || {}).map(([key, value]) => (
                        <span key={key} className="mr-4 inline-block break-all">
                          <span className="t-muted">{key}: </span>
                          <span className="t-num">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPager
          page={page}
          totalPages={Math.max(1, Math.ceil(total / pageSize))}
          pageSize={pageSize}
          disabled={isLoading}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </section>
    </>
  );
}

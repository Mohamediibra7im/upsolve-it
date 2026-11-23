import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZES = [10, 20, 50, 100];

/** Panel foot for a paged table. `page` is 1-based. */
export function AdminPager({
  page,
  totalPages,
  pageSize,
  onPage,
  onPageSize,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  disabled?: boolean;
}) {
  const atStart = disabled || page <= 1;
  const atEnd = disabled || page >= totalPages;
  const steps = [
    { label: "First page", to: 1, off: atStart, Icon: ChevronsLeft },
    { label: "Previous page", to: page - 1, off: atStart, Icon: ChevronLeft },
    { label: "Next page", to: page + 1, off: atEnd, Icon: ChevronRight },
    { label: "Last page", to: totalPages, off: atEnd, Icon: ChevronsRight },
  ];

  return (
    <div className="u-panel__foot">
      <div className="flex items-center gap-3">
        Rows per page
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSize(Number(value))}
        >
          <SelectTrigger
            aria-label="Rows per page"
            className="t-num h-8 w-20 text-ink"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)} className="t-num">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav aria-label="Pages" className="flex items-center gap-2">
        <span className="t-num mr-2">
          Page {page} of {totalPages}
        </span>
        {steps.map(({ label, to, off, Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            className="u-btn--sm"
            aria-label={label}
            disabled={off}
            onClick={() => onPage(to)}
          >
            <Icon />
          </Button>
        ))}
      </nav>
    </div>
  );
}

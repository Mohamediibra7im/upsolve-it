"use client";

import { useId, useState } from "react";
import { Eye, Edit3, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

const markdownGuide = `## Make your message easy to read

Use **bold** for key details and *italics* for emphasis.

| Format | Write |
| --- | --- |
| Heading | \`## Your heading\` |
| Bold | \`**important detail**\` |
| Italic | \`*emphasis*\` |
| Link | \`[link text](https://example.com)\` |
| Inline code | Surround code with backticks |

### Lists
Start each line with a dash for a bullet list, or a number followed by a period for ordered steps.

### Code blocks
Put three backticks on the line before and after your code. Add a language name after the opening backticks for context.

### Images
Use \`![Image description](https://example.com/image.png)\`. Always include a useful description.
`;

export default function MarkdownEditor({
  value,
  onChange,
  label = "Message",
  placeholder = "Write your message…",
  rows = 6,
  required = false,
  className,
}: MarkdownEditorProps) {
  const editorId = useId();
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor={editorId}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <TabsList
            aria-label={`${label} editor`}
            className="h-9 bg-background/60 p-1"
          >
            <TabsTrigger value="edit" className="gap-2 px-3 text-xs">
              <Edit3 className="size-3.5" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2 px-3 text-xs">
              <Eye className="size-3.5" />
              Preview
            </TabsTrigger>
          </TabsList>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground"
                aria-label="Markdown formatting guide"
              >
                <HelpCircle className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pr-7 text-left">
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Formatting guide
                </DialogTitle>
                <DialogDescription>
                  A few simple shortcuts for clear, readable messages.
                </DialogDescription>
              </DialogHeader>
              <MarkdownRenderer>{markdownGuide}</MarkdownRenderer>
            </DialogContent>
          </Dialog>
        </div>
        <TabsContent value="edit" className="m-0 p-4 sm:p-5">
          <Textarea
            id={editorId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
            aria-describedby={`${editorId}-hint`}
            className="min-h-40 resize-y rounded-lg border-0 bg-transparent p-0 text-sm leading-7 shadow-none focus-visible:ring-offset-4"
          />
          <p
            id={`${editorId}-hint`}
            className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground"
          >
            Markdown supported. Preview your message before sharing.
          </p>
        </TabsContent>
        <TabsContent value="preview" className="m-0 min-h-52 p-4 sm:p-5">
          {value.trim() ? (
            <MarkdownRenderer>{value}</MarkdownRenderer>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <FileText className="size-6 opacity-60" />
              <p className="text-sm">Your preview will appear here.</p>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => setActiveTab("edit")}
              >
                Start writing
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

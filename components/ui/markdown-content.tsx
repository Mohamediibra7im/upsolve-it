"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words text-muted-foreground prose-headings:font-medium prose-headings:text-foreground prose-p:leading-7 prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-foreground prose-code:font-mono prose-code:font-normal prose-code:text-primary prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-background prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-img:rounded-xl prose-th:text-foreground prose-hr:border-border">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ node: _node, children, ...props }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-border">
              <table {...props} className="!my-0 min-w-full">
                {children}
              </table>
            </div>
          ),
          pre: ({ node: _node, children, ...props }) => (
            <pre {...props} className="max-w-full overflow-x-auto">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;

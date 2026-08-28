'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none text-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match ? match[1] : 'javascript'}
                PreTag="div"
                className="rounded-lg my-3 text-xs !bg-[#0D1117] border border-border/80 custom-scrollbar shadow-sm font-mono"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-background border border-border px-1.5 py-0.5 rounded font-mono text-xs text-primary font-semibold" {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }: any) => <a className="text-primary hover:underline font-medium font-mono text-xs" target="_blank" rel="noopener noreferrer" {...props} />,
          p: ({ node, ...props }: any) => <p className="mb-3 text-muted-text text-sm leading-relaxed whitespace-pre-wrap" {...props} />,
          ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-3 text-muted-text text-sm space-y-1" {...props} />,
          ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-3 text-muted-text text-sm space-y-1" {...props} />,
          h1: ({ node, ...props }: any) => <h1 className="text-xl font-bold mb-3 mt-5 text-text tracking-tight" {...props} />,
          h2: ({ node, ...props }: any) => <h2 className="text-lg font-bold mb-2.5 mt-4 text-text tracking-tight" {...props} />,
          h3: ({ node, ...props }: any) => <h3 className="text-base font-bold mb-2 mt-3 text-text" {...props} />,
          blockquote: ({ node, ...props }: any) => <blockquote className="border-l-2 border-primary pl-3.5 italic text-muted-text bg-primary/5 py-1.5 pr-3 rounded-r my-3 text-sm" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

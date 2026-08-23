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
    <div className={`prose prose-invert max-w-none ${className}`}>
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
                className="rounded-xl my-4 text-sm !bg-[#1e1e1e] border border-border/50 shadow-inner"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-surface border border-border/50 px-1.5 py-0.5 rounded-md font-mono text-sm text-primary" {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }: any) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          p: ({ node, ...props }: any) => <p className="mb-4 text-muted-text leading-relaxed whitespace-pre-wrap" {...props} />,
          ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-4 text-muted-text space-y-1" {...props} />,
          ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-4 text-muted-text space-y-1" {...props} />,
          h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mb-4 mt-6 text-text" {...props} />,
          h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mb-3 mt-5 text-text" {...props} />,
          h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mb-2 mt-4 text-text" {...props} />,
          blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-text bg-primary/5 py-2 pr-4 rounded-r-lg my-4" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

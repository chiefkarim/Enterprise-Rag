import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownProps {
  content: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="my-4 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <div className="bg-white/5 px-4 py-1 text-[10px] text-white/40 uppercase font-bold border-b border-white/10 flex justify-between items-center">
                <span>{match[1]}</span>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="!m-0 !bg-[#0d1117]"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#5DD7AD] border border-white/5" {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5DD7AD] hover:underline underline-offset-4 decoration-2"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-[#5DD7AD]/40 pl-4 py-1 italic bg-white/5 my-4 rounded-r-md">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-white">{children}</h3>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-6 rounded-lg border border-white/10">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-white/10">{children}</thead>,
        th: ({ children }) => (
          <th className="px-4 py-2 border border-white/10 text-left font-bold text-white/80">{children}</th>
        ),
        td: ({ children }) => <td className="px-4 py-2 border border-white/10">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

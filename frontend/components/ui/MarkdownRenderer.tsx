"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

// 导入代码高亮样式（选一个主题）
import "highlight.js/styles/github-dark.css"; // 深色主题，适合暗色背景
// import 'highlight.js/styles/github.css' // 浅色主题

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // ---------- 标题 ----------
          h1: ({ children, ...props }) => (
            <h1
              className="text-3xl font-bold mt-8 mb-4 scroll-mt-20"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="text-2xl font-bold mt-6 mb-3 scroll-mt-20"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="text-xl font-semibold mt-4 mb-2 scroll-mt-20"
              {...props}
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              className="text-lg font-semibold mt-3 mb-1 scroll-mt-20"
              {...props}
            >
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-semibold mt-2 mb-1" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-semibold mt-2 mb-1" {...props}>
              {children}
            </h6>
          ),

          // ---------- 段落 ----------
          p: ({ children, ...props }) => (
            <p
              className="leading-relaxed my-3 text-gray-800 dark:text-gray-200"
              {...props}
            >
              {children}
            </p>
          ),

          // ---------- 链接 ----------
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),

          // ---------- 代码 ----------
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            // 行内代码
            if (inline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // 代码块（rehype-highlight 会自动添加高亮类）
            return (
              <pre className="rounded-lg overflow-x-auto my-4">
                {language && (
                  <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-1.5 rounded-t-lg border-b border-gray-700">
                    <span className="text-xs text-gray-400 font-mono">
                      {language}
                    </span>
                    <button
                      onClick={() => {
                        const code = String(children).replace(/\n$/, "");
                        navigator.clipboard?.writeText(code);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      复制
                    </button>
                  </div>
                )}
                <code
                  className={cn("text-sm font-mono block p-4", className)}
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          },

          // ---------- 列表 ----------
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 my-3 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li
              className="leading-relaxed text-gray-800 dark:text-gray-200"
              {...props}
            >
              {children}
            </li>
          ),

          // ---------- 引用块 ----------
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-400 dark:border-blue-500 pl-4 my-4 py-1 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-r"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // ---------- 图片 ----------
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || "图片"}
              className="max-w-full h-auto rounded-lg my-4 shadow-md"
              loading="lazy"
              {...props}
            />
          ),

          // ---------- 表格 ----------
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-semibold"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="border-b border-gray-100 dark:border-gray-800 px-4 py-2"
              {...props}
            >
              {children}
            </td>
          ),

          // ---------- 分割线 ----------
          hr: (props) => (
            <hr
              className="my-6 border-t-2 border-gray-200 dark:border-gray-700"
              {...props}
            />
          ),

          // ---------- 强调 ----------
          strong: ({ children, ...props }) => (
            <strong
              className="font-semibold text-gray-900 dark:text-gray-100"
              {...props}
            >
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>
              {children}
            </em>
          ),
          del: ({ children, ...props }) => (
            <del className="line-through text-gray-500" {...props}>
              {children}
            </del>
          ),

          // ---------- 任务列表（GFM） ----------
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mr-2 accent-blue-600"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

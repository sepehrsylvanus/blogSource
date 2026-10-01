import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { isValidElement, type ReactNode } from "react";
import { slugifyHeading, textOf } from "@/lib/markdown";
import { CodeShell } from "@/components/CodeShell";

function languageOf(children: ReactNode): string | null {
  if (!isValidElement(children)) return null;
  const className = (children.props as { className?: string }).className ?? "";
  const match = /language-([a-z0-9]+)/.exec(className);
  return match ? match[1] : null;
}

const components: Components = {
  h2: ({ children }) => (
    <h2 id={slugifyHeading(textOf(children))}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugifyHeading(textOf(children))}>{children}</h3>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  pre: ({ children }) => <CodeShell language={languageOf(children)}>{children}</CodeShell>,
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

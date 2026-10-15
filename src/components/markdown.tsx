import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function Markdown({ text }: { text: string }) {
  // No rehype-raw: author-supplied HTML is not executed. Sanitize as defense in depth.
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

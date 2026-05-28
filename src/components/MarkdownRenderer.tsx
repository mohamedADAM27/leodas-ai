import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(code);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!content) return null;

  // Split content by code blocks ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-sm break-words tracking-wide">
      {parts.map((part, pIdx) => {
        // Code Block Block
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div key={pIdx} className="my-4 overflow-hidden rounded-xl border border-app-border bg-black/45 shadow-sm font-mono max-w-full text-xs">
              <div className="bg-black/70 px-4 py-2 border-b border-app-border/40 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1.5 uppercase font-semibold text-zinc-300">
                  <Terminal className="w-3.5 h-3.5 text-app-primary" />
                  {lang || 'code-snippet'}
                </span>
                <button
                  onClick={() => handleCopyCode(code)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedText === code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-400 whitespace-pre scrollbar-thin">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Standard lines with line breaks
        const paragraphs = part.split(/\n\n+/);
        return paragraphs.map((para, prIdx) => {
          if (!para.trim()) return null;

          // Check for header blocks
          if (para.startsWith('# ')) {
            return <h1 key={`h1-${prIdx}`} className="text-xl font-display font-extrabold text-app-text mt-3 mb-1.5 border-b border-app-border/20 pb-1">{parseInlineStyles(para.slice(2))}</h1>;
          }
          if (para.startsWith('## ')) {
            return <h2 key={`h2-${prIdx}`} className="text-lg font-display font-bold text-app-text mt-3 mb-1">{parseInlineStyles(para.slice(3))}</h2>;
          }
          if (para.startsWith('### ')) {
            return <h3 key={`h3-${prIdx}`} className="text-md font-display font-semibold text-app-text mt-2 mb-1">{parseInlineStyles(para.slice(4))}</h3>;
          }

          // Check for line lists
          if (para.startsWith('* ') || para.startsWith('- ')) {
            const listItems = para.split(/\n[\*\-]\s+/);
            return (
              <ul key={`ul-${prIdx}`} className="list-disc pl-5 space-y-1 my-1 text-app-text">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx}>{parseInlineStyles(li.replace(/^[\*\-]\s+/, ''))}</li>
                ))}
              </ul>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(para)) {
            const listItems = para.split(/\n\d+\.\s+/);
            return (
              <ol key={`ol-${prIdx}`} className="list-decimal pl-5 space-y-1 my-1 text-app-text">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx}>{parseInlineStyles(li.replace(/^\d+\.\s+/, ''))}</li>
                ))}
              </ol>
            );
          }

          // Blockquotes
          if (para.startsWith('> ')) {
            return (
              <blockquote key={`bq-${prIdx}`} className="border-l-4 border-app-primary bg-app-muted/30 p-3 pl-4 rounded-r-lg my-1.5 text-app-subtext font-light italic">
                {parseInlineStyles(para.replace(/^>\s*/g, ''))}
              </blockquote>
            );
          }

          return (
            <p key={prIdx} className="text-app-text leading-relaxed font-light mt-0.5">
              {parseInlineStyles(para)}
            </p>
          );
        });
      })}
    </div>
  );
}

// Inline formatting: Bold (**), Italic (*), Inline Code (`)
function parseInlineStyles(text: string) {
  if (!text) return '';

  // Split by inline markdown regex components
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-app-text">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <span key={idx} className="italic text-app-subtext">
          {token.slice(1, -1)}
        </span>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={idx} className="bg-app-muted/85 border border-app-border/40 px-1.5 py-0.5 rounded font-mono text-xs text-app-primary">
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

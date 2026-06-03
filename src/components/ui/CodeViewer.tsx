import type { ReactNode } from 'react';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  showHeader?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  bodyClassName?: string;
}

function normalizeLanguage(language?: string): string {
  return (
    language
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') || 'plaintext'
  );
}

function formatLanguageLabel(language?: string): string {
  return language ? language.toUpperCase() : 'CODE';
}

function formatCode(code: string, language?: string): string {
  if (language?.toLowerCase() !== 'json') return code;

  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch {
    return code;
  }
}

function renderJsonLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const tokenPattern =
    /("(?:\\.|[^"\\])*")(\s*:)?|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|\b(?:true|false|null)\b|[{}[\]:,]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const [token, stringToken, keySuffix] = match;
    const key = `${match.index}-${token}`;

    if (stringToken && keySuffix) {
      parts.push(
        <span key={`${key}-key`} className='text-green-300'>
          {stringToken}
        </span>,
        <span key={`${key}-suffix`} className='text-slate-500'>
          {keySuffix}
        </span>
      );
      lastIndex = match.index + token.length;
      continue;
    }

    if (stringToken) {
      parts.push(
        <span key={key} className='text-sky-300'>
          {token}
        </span>
      );
      lastIndex = match.index + token.length;
      continue;
    }

    let tokenClassName = 'text-slate-500';

    if (token === 'true' || token === 'false') {
      tokenClassName = 'text-amber-300';
    } else if (token === 'null') {
      tokenClassName = 'text-rose-300';
    } else if (/^-?\d/.test(token)) {
      tokenClassName = 'text-emerald-300';
    } else if (/^[{}[\]]$/.test(token)) {
      tokenClassName = 'text-yellow-300';
    }

    parts.push(
      <span key={key} className={tokenClassName}>
        {token}
      </span>
    );

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [' '];
}

function renderCodeLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const tokenPattern =
    /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|switch|throw|try|typeof|var|void|while)\b|\b(?:true|false|null|undefined)\b|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?|[{}()[\];,.:+\-*/%=<>!?&|]+)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    let tokenClassName = 'text-slate-400';

    if (token.startsWith('//')) {
      tokenClassName = 'text-slate-500';
    } else if (/^["'`]/.test(token)) {
      tokenClassName = 'text-sky-300';
    } else if (
      /^(async|await|break|case|catch|class|const|continue|default|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|switch|throw|try|typeof|var|void|while)$/i.test(
        token
      )
    ) {
      tokenClassName = 'text-violet-300';
    } else if (/^(true|false|null|undefined)$/i.test(token)) {
      tokenClassName = 'text-amber-300';
    } else if (/^-?\d/.test(token)) {
      tokenClassName = 'text-emerald-300';
    } else if (/^[{}()[\]]+$/.test(token)) {
      tokenClassName = 'text-yellow-300';
    }

    parts.push(
      <span key={`${match.index}-${token}`} className={tokenClassName}>
        {token}
      </span>
    );

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [' '];
}

function renderHighlightedLine(line: string, normalizedLanguage: string): ReactNode[] | string {
  if (normalizedLanguage === 'json') return renderJsonLine(line);
  if (
    normalizedLanguage === 'javascript' ||
    normalizedLanguage === 'js' ||
    normalizedLanguage === 'typescript' ||
    normalizedLanguage === 'ts' ||
    normalizedLanguage === 'tsx' ||
    normalizedLanguage === 'jsx'
  ) {
    return renderCodeLine(line);
  }

  return line || ' ';
}

export function CodeViewer({
  code,
  language,
  title,
  showHeader = true,
  showLineNumbers = true,
  className,
  bodyClassName,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const formattedCode = formatCode(code, language);
  const lines = formattedCode.split('\n');
  const languageLabel = formatLanguageLabel(language);
  const normalizedLanguage = normalizeLanguage(language);
  const copyLabel = `Copy ${title ?? languageLabel.toLowerCase()} to clipboard`;

  const handleCopy = () => {
    void navigator.clipboard
      .writeText(formattedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard access can be unavailable in locked-down browser contexts.
      });
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 bg-slate-950 shadow-sm',
        'dark:border-[#2d3540]',
        className
      )}
    >
      {showHeader && (
        <div className='flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2.5'>
          <div className='flex min-w-0 items-center gap-2'>
            {title && (
              <span className='truncate text-xs font-semibold text-slate-100' title={title}>
                {title}
              </span>
            )}
            <span className='rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-300'>
              {languageLabel}
            </span>
            <span className='text-xs text-slate-500'>
              {lines.length} {lines.length === 1 ? 'line' : 'lines'}
            </span>
          </div>
          <button
            type='button'
            onClick={handleCopy}
            className='flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
            aria-label={copyLabel}
          >
            {copied ? (
              <>
                <Check className='h-3.5 w-3.5' />
                Copied
              </>
            ) : (
              <>
                <Copy className='h-3.5 w-3.5' />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div
        className={cn(
          'max-h-[min(52vh,640px)] overflow-auto bg-slate-950',
          'scrollbar-thin',
          bodyClassName
        )}
      >
        <pre
          className='min-w-full p-0 font-mono text-xs leading-6 text-slate-100'
          aria-label={`${languageLabel} code viewer`}
        >
          <code className={cn(`language-${normalizedLanguage}`, 'table w-full min-w-max py-3')}>
            {lines.map((line, index) => (
              <span key={`${index}-${line}`} className='table-row'>
                {showLineNumbers && (
                  <span
                    className='table-cell w-12 border-r border-slate-800 px-3 text-right text-slate-600 select-none'
                    aria-hidden='true'
                  >
                    {index + 1}
                  </span>
                )}
                <span className='table-cell px-4 whitespace-pre'>
                  {renderHighlightedLine(line, normalizedLanguage)}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

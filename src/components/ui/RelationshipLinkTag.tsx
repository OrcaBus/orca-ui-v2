import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

const colorMap = {
  purple:
    'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
  green:
    'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50',
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
} as const;

type Color = keyof typeof colorMap;

interface BaseProps {
  children: ReactNode;
  color?: Color;
  icon?: ReactNode;
  className?: string;
}

type ExternalProps = BaseProps & {
  href: string;
  onClick?: never;
};

type ButtonProps = BaseProps & {
  onClick: () => void;
  href?: never;
};

export type RelationshipLinkTagProps = ExternalProps | ButtonProps;

const baseClass =
  'inline-flex cursor-pointer items-center gap-1 rounded border-0 px-2 py-1 text-xs! font-medium! transition-colors focus:outline-none';

export function RelationshipLinkTag({
  children,
  color = 'blue',
  icon,
  className,
  ...props
}: RelationshipLinkTagProps) {
  const classes = cn(baseClass, colorMap[color], className);
  const content = (
    <>
      {icon ?? <ExternalLink className='h-3 w-3' />}
      {children}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    return (
      <a href={props.href} target='_blank' rel='noreferrer' className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type='button' onClick={props.onClick} className={classes}>
      {content}
    </button>
  );
}

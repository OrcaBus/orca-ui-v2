import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';

export interface UnderDevelopmentPageProps {
  featureName: string;
  description?: string;
  homePath?: string;
  devUrl?: string;
}

const DEFAULT_DESCRIPTION = 'This page is still in progress. Progress can be previewed in Dev.';

function normalizeDevUrl(devUrl: string) {
  const trimmedDevUrl = devUrl.trim();

  if (/^https?:\/\//i.test(trimmedDevUrl)) {
    return trimmedDevUrl;
  }

  if (trimmedDevUrl.startsWith('//')) {
    return `https:${trimmedDevUrl}`;
  }

  return `https://${trimmedDevUrl.replace(/^\/+/, '')}`;
}

function ConstructionLaptopIllustration() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 520 360'
      className='mx-auto h-64 w-full max-w-lg overflow-visible'
    >
      <style>
        {`
          .ud-window { animation: ud-float 5.8s ease-in-out infinite; }
          .ud-cursor { animation: ud-cursor 4.2s ease-in-out infinite; transform-origin: 340px 84px; }
          .ud-bubble { animation: ud-bubble 4.8s ease-in-out infinite; }
          .ud-code-left { animation: ud-code-left 3.6s ease-in-out infinite; transform-origin: 214px 180px; }
          .ud-code-right { animation: ud-code-right 3.6s ease-in-out infinite; transform-origin: 306px 180px; }
          .ud-slash { animation: ud-slash 3.8s ease-in-out infinite; transform-origin: 260px 180px; }
          .ud-leaves { animation: ud-leaves 5.2s ease-in-out infinite; transform-origin: 88px 239px; }
          .ud-steam-a { animation: ud-steam 2.8s ease-in-out infinite; }
          .ud-steam-b { animation: ud-steam 2.8s ease-in-out .35s infinite; }
          .ud-steam-c { animation: ud-steam 2.8s ease-in-out .7s infinite; }

          @keyframes ud-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }

          @keyframes ud-cursor {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(5px, -6px) rotate(-4deg); }
          }

          @keyframes ud-bubble {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }

          @keyframes ud-code-left {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-7px); }
          }

          @keyframes ud-code-right {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(7px); }
          }

          @keyframes ud-slash {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(5deg); }
          }

          @keyframes ud-leaves {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-2deg); }
          }

          @keyframes ud-steam {
            0% { opacity: 0; transform: translateY(8px); }
            35% { opacity: .9; }
            100% { opacity: 0; transform: translateY(-10px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .ud-window,
            .ud-cursor,
            .ud-bubble,
            .ud-code-left,
            .ud-code-right,
            .ud-slash,
            .ud-leaves,
            .ud-steam-a,
            .ud-steam-b,
            .ud-steam-c {
              animation: none;
            }
          }
        `}
      </style>
      <defs>
        <linearGradient id='ud-plant' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stopColor='#14b8a6' />
          <stop offset='100%' stopColor='#0f766e' />
        </linearGradient>
        <filter id='ud-shadow' x='-20%' y='-20%' width='140%' height='150%'>
          <feDropShadow dx='0' dy='10' stdDeviation='8' floodColor='#0f172a' floodOpacity='.12' />
        </filter>
      </defs>

      <g className='ud-window' filter='url(#ud-shadow)'>
        <rect
          x='88'
          y='50'
          width='364'
          height='244'
          rx='10'
          className='fill-white stroke-slate-900 dark:fill-[#111418] dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path d='M88 88h364' className='stroke-slate-900 dark:stroke-slate-100' strokeWidth='3' />
        <rect
          x='380'
          y='66'
          width='15'
          height='15'
          rx='4'
          className='fill-amber-400 stroke-slate-900'
          strokeWidth='3'
        />
        <rect
          x='406'
          y='66'
          width='15'
          height='15'
          rx='4'
          className='fill-teal-500 stroke-slate-900'
          strokeWidth='3'
        />
        <rect
          x='432'
          y='66'
          width='15'
          height='15'
          rx='4'
          className='fill-red-400 stroke-slate-900'
          strokeWidth='3'
        />

        <path
          d='M220 142l-54 36 54 36'
          className='ud-code-left stroke-amber-400'
          strokeWidth='24'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        <path
          d='M320 142l54 36-54 36'
          className='ud-code-right stroke-amber-400'
          strokeWidth='24'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        <path
          d='M286 124l-42 128'
          className='ud-slash stroke-amber-400'
          strokeWidth='24'
          strokeLinecap='round'
        />
      </g>

      <g className='ud-bubble'>
        <path
          d='M152 40h174a10 10 0 0 1 10 10v72a10 10 0 0 1-10 10h-54l-5 30-36-30h-79a10 10 0 0 1-10-10V50a10 10 0 0 1 10-10z'
          className='fill-white stroke-slate-900 dark:fill-[#101922] dark:stroke-slate-100'
          strokeWidth='3'
          strokeLinejoin='round'
        />
        <g className='stroke-red-400' strokeWidth='3' strokeLinecap='round'>
          <path d='M162 68h142' />
          <path d='M162 91h39' />
          <path d='M218 91h32' />
          <path d='M268 91h54' />
          <path d='M244 113h78' />
        </g>
      </g>

      <g className='ud-cursor'>
        <g transform='translate(344 26) scale(0.64)'>
          <path
            d='M0 0l108 76-48 3 24 52-28 12-24-55-32 32z'
            className='fill-white stroke-slate-900 dark:fill-slate-100 dark:stroke-slate-900'
            strokeWidth='4'
            strokeLinejoin='round'
          />
        </g>
      </g>

      <g className='ud-leaves'>
        <path
          d='M86 238C54 208 41 167 52 122c25 35 37 75 34 116z'
          fill='url(#ud-plant)'
          className='stroke-slate-900 dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path
          d='M108 238c-12-43-4-86 20-119 11 45 2 86-20 119z'
          fill='url(#ud-plant)'
          className='stroke-slate-900 dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path
          d='M72 239c-32-17-49-44-50-80 27 18 43 47 50 80z'
          fill='url(#ud-plant)'
          className='stroke-slate-900 dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path
          d='M127 239c14-39 36-68 67-88-2 43-25 73-67 88z'
          fill='url(#ud-plant)'
          className='stroke-slate-900 dark:stroke-slate-100'
          strokeWidth='3'
        />
      </g>
      <g>
        <rect
          x='42'
          y='237'
          width='121'
          height='20'
          className='fill-white stroke-slate-900 dark:fill-[#101922] dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path
          d='M52 257h101l-11 75H63z'
          className='fill-white stroke-slate-900 dark:fill-[#101922] dark:stroke-slate-100'
          strokeWidth='3'
          strokeLinejoin='round'
        />
        <ellipse
          cx='102'
          cy='333'
          rx='48'
          ry='8'
          className='fill-slate-900/15 dark:fill-black/35'
        />
      </g>

      <g className='stroke-slate-900 dark:stroke-slate-100' strokeWidth='3' strokeLinecap='round'>
        <path d='M377 236c-6 14 8 19 0 34' className='ud-steam-a fill-none' />
        <path d='M392 236c-6 14 8 19 0 34' className='ud-steam-b fill-none' />
        <path d='M407 236c-6 14 8 19 0 34' className='ud-steam-c fill-none' />
      </g>
      <g>
        <path
          d='M362 280h62v36c0 11-9 19-19 19h-24c-10 0-19-8-19-19z'
          className='fill-white stroke-slate-900 dark:fill-[#101922] dark:stroke-slate-100'
          strokeWidth='3'
          strokeLinejoin='round'
        />
        <path
          d='M424 290h14c13 0 13 25 0 25h-14'
          className='fill-none stroke-slate-900 dark:stroke-slate-100'
          strokeWidth='3'
        />
        <path d='M393 287v11' className='stroke-red-400' strokeWidth='4' strokeLinecap='round' />
        <path
          d='M384 301c-5 5-5 13 0 18 5 5 13 5 18 0 5-5 5-13 0-18'
          className='fill-none stroke-red-400'
          strokeWidth='4'
          strokeLinecap='round'
        />
        <ellipse
          cx='394'
          cy='337'
          rx='46'
          ry='7'
          className='fill-slate-900/15 dark:fill-black/35'
        />
      </g>
    </svg>
  );
}

export function UnderDevelopmentPage({
  featureName,
  description = DEFAULT_DESCRIPTION,
  homePath = '/',
  devUrl,
}: UnderDevelopmentPageProps) {
  const normalizedDevUrl = devUrl ? normalizeDevUrl(devUrl) : undefined;

  return (
    <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 p-6 dark:bg-[#101922]'>
      <section className='mx-auto max-w-lg text-center'>
        <ConstructionLaptopIllustration />

        <h1 className='mt-7 text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
          {featureName} page is under development
        </h1>
        <p className='text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6'>
          {description}
        </p>

        <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Button asChild>
            <Link to={homePath}>
              <ArrowLeft className='h-4 w-4' />
              Back to Lab Page
            </Link>
          </Button>

          {normalizedDevUrl && (
            <Button variant='outline' asChild>
              <a href={normalizedDevUrl} target='_blank' rel='noopener noreferrer'>
                Open in Dev
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

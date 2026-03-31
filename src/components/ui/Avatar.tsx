'use client';

import { createContext, useContext, useEffect, useState, type ComponentProps } from 'react';

import { cn } from '@/utils/cn';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

const AvatarContext = createContext<{
  status: ImageLoadingStatus;
  setStatus: (status: ImageLoadingStatus) => void;
}>({
  status: 'idle',
  setStatus: () => {},
});

function Avatar({ className, children, ...props }: ComponentProps<'span'>) {
  const [status, setStatus] = useState<ImageLoadingStatus>('idle');

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        data-slot='avatar'
        className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
}

function AvatarImage({ className, src, alt, ...props }: ComponentProps<'img'>) {
  const { status, setStatus } = useContext(AvatarContext);

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    const img = new Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, setStatus]);

  if (status !== 'loaded') return null;

  return (
    <img
      data-slot='avatar-image'
      src={src}
      alt={alt}
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  delayMs,
  children,
  ...props
}: ComponentProps<'span'> & { delayMs?: number }) {
  const { status } = useContext(AvatarContext);
  const [canRender, setCanRender] = useState(!delayMs);

  useEffect(() => {
    if (delayMs) {
      const timer = setTimeout(() => setCanRender(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (status === 'loaded' || !canRender) return null;

  return (
    <span
      data-slot='avatar-fallback'
      className={cn(
        'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback };

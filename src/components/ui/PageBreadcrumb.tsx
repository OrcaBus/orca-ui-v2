import { Fragment } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';
import { cn } from '@/utils/cn';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageBreadcrumbProps {
  items: BreadcrumbEntry[];
  className?: string;
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className='font-medium text-neutral-900 dark:text-white'>
                    {item.label}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.href}
                      className='cursor-pointer text-neutral-600 transition-colors hover:text-neutral-900 dark:text-[#9dabb9] dark:hover:text-white'
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className='cursor-pointer text-neutral-600 transition-colors hover:text-neutral-900 dark:text-[#9dabb9] dark:hover:text-white'
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className='text-neutral-600 dark:text-[#9dabb9]'>{item.label}</span>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className='h-3.5 w-3.5 text-neutral-400 dark:text-[#9dabb9]/60' />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

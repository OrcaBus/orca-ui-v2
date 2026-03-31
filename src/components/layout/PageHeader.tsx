interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className='mb-6'>
      <div className='flex items-start justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            {icon && <div className='text-slate-500 dark:text-[#9dabb9]'>{icon}</div>}
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
              {title}
            </h1>
          </div>
          {description && (
            <p className='mt-1.5 ml-0.5 text-[13px] text-slate-500 dark:text-[#9dabb9]'>
              {description}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}

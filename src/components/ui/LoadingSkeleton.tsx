export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='animate-pulse space-y-3'>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className='flex gap-4'>
          <div className='h-12 flex-1 rounded bg-neutral-200'></div>
          <div className='h-12 w-32 rounded bg-neutral-200'></div>
          <div className='h-12 w-24 rounded bg-neutral-200'></div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className='mb-6 grid animate-pulse grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className='rounded-lg border border-neutral-200 bg-white p-4'>
          <div className='mb-2 h-4 w-20 rounded bg-neutral-200'></div>
          <div className='h-6 w-12 rounded bg-neutral-200'></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className='overflow-hidden rounded-lg border border-neutral-200 bg-white'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b border-neutral-200 bg-neutral-50'>
            <tr>
              {Array.from({ length: 6 }).map((_, idx) => (
                <th key={idx} className='px-4 py-3'>
                  <div className='h-4 w-24 animate-pulse rounded bg-neutral-200'></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-200'>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: 6 }).map((_, colIdx) => (
                  <td key={colIdx} className='px-4 py-3'>
                    <div className='h-5 w-full animate-pulse rounded bg-neutral-200'></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
